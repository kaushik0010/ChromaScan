import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const formData = await request.formData();
  const imageFile = formData.get('image') as File | null;

  if (!imageFile) {
    return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
  }

  console.log("Image received. Sending to Google Cloud Vision API...");

  try {
    // 1. Get the API Key from environment variables
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error("API key for Google Vision is not configured.");
    }
    
    // 2. Convert the image file to a base64 string
    const imageBase64 = Buffer.from(await imageFile.arrayBuffer()).toString('base64');

    // 3. Construct the request payload for Google Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    };

    // 4. Make the API call to Google
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    // 5. Check for errors from the API
    if (data.responses[0].error) {
      throw new Error(data.responses[0].error.message);
    }
    
    // 6. Extract the text from the response
    const extractedText = data.responses[0]?.fullTextAnnotation?.text || '';

    console.log("Google Vision API finished. Extracted text received");

    console.log("Loading knowledge base and finding ingredient matches...");

    const jsonPath = path.join(process.cwd(), 'knowledge_base.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const knowledgeBase: Ingredient[] = JSON.parse(jsonData);

    const searchableText = extractedText.toLowerCase().replace(/[\n,.]/g, ' ');

    const foundIngredients: Ingredient[] = [];
    for (const ingredient of knowledgeBase) {
      // Check for the main name
      if (searchableText.includes(ingredient.ingredientName.toLowerCase())) {
        foundIngredients.push(ingredient);
        continue; // Move to the next ingredient to avoid duplicates
      }
      // Check for any aliases
      for (const alias of ingredient.aliases) {
        if (searchableText.includes(alias.toLowerCase())) {
          foundIngredients.push(ingredient);
          break; // Exit the inner loop once an alias is found
        }
      }
    }
    
    console.log(`Found ${foundIngredients.length} matching ingredients.`);


    return NextResponse.json({ 
        extractedText: extractedText,
        foundIngredients: foundIngredients
    });

  } catch (error) {
    console.error('Error calling Google Vision API:', error);
    return NextResponse.json({ error: 'Failed to process the request.' }, { status: 500 });
  }
}