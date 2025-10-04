import { NextResponse } from 'next/server';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

export async function POST(request: Request) {
  try {
    const client = new Cerebras();

    const { question, context, chatHistory } = await request.json();

    if (!question || !context) {
      return NextResponse.json({ error: 'Question and context are required.' }, { status: 400 });
    }

    const historyString = (chatHistory || [])
      .map((msg: Message) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // --- AGENT 1: TRIAGE AGENT ---
    // Goal: Quickly classify the user's intent.
    const triagePrompt = `
      Analyze the user's latest question in the context of the conversation history. Classify the intent: ANALYSIS or SAFETY.
      - ANALYSIS: The user is asking for information about what an ingredient is or does.
      - SAFETY: The user is asking for medical advice, usage instructions, personal suitability, or age restrictions.

      Conversation History:
      ${historyString}

      Latest User Question: "${question}"
      Category:
    `;

    const triageCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: triagePrompt }],
      model: 'llama3.1-8b', // A small, fast model for classification
      max_tokens: 5,
      temperature: 0.1,
    }) as any;
    const intentCategory = triageCompletion.choices[0]?.message?.content?.trim().toUpperCase() || 'ANALYSIS';
    console.log(`Triage Agent (with history) classified intent as: ${intentCategory}`);

    // --- CONDITIONAL LOGIC ---
    // If the intent is about safety, respond immediately with a canned message.
    if (intentCategory.includes('SAFETY')) {
      const safeResponse = "As an AI ingredient analyst, I can't provide medical advice or personal usage instructions. For that kind of recommendation, it's always best to consult with a qualified professional like a dermatologist or doctor.";
      return NextResponse.json({ answer: safeResponse });
    }

    // --- AGENT 2: ANALYST AGENT ---
    // If the intent is analysis, proceed with our detailed RAG prompt.
    const ingredientsContext = context.map((ing: any) => `- ${ing.ingredientName}: ${ing.summary}`).join('\n');
    const analystPrompt = `
      You are ChromaScan. A user is asking a follow-up question. Use the conversation history and the ingredient data to provide a helpful, concise answer.

      RULES:
      - Your answer must be relevant to the LATEST USER QUESTION.
      - Use the CONVERSATION HISTORY to understand context (like what "it" or "that" refers to).
      - Base all factual claims about ingredients ONLY on the provided INGREDIENT DATA.
      - Stick STRICTLY to the provided data. Do not use any outside knowledge.

      INGREDIENT DATA:
      ${ingredientsContext}

      CONVERSATION HISTORY:
      ${historyString}
      
      LATEST USER QUESTION:
      "${question}"

      ANSWER:
    `;
    
    const analystCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: analystPrompt }],
      model: 'llama-4-scout-17b-16e-instruct', // Our powerful analyst model
      max_tokens: 150,
      temperature: 0.2,
    }) as any;
    
    const analystAnswer = analystCompletion.choices[0]?.message?.content?.trim() || "Sorry, I couldn't generate an answer.";

    // --- AGENT 3: SAFETY AGENT (GUARDRAIL) ---
    // Goal: Review the Analyst's answer for any accidental medical advice.
    const safetyCheckPrompt = `
      Does the following text contain any form of medical advice, dosage, or personal safety recommendations? Answer only with a single word: YES or NO.

      Text: "${analystAnswer}"
      Answer:
    `;
    const safetyCompletion = await client.chat.completions.create({
        messages: [{ role: 'user', content: safetyCheckPrompt }],
        model: 'llama-4-maverick-17b-128e-instruct', // A fast, instruction-following model
        max_tokens: 2,
        temperature: 0.1,
    }) as any;
    const safetyCheckResult = safetyCompletion.choices[0]?.message?.content?.trim().toUpperCase();
    console.log(`Safety Agent check result: ${safetyCheckResult}`);

    // If the safety check fails, override with the safe response. Otherwise, use the Analyst's answer.
    if (safetyCheckResult === 'YES') {
      const safeResponse = "For safety and personalized advice, please consult with a qualified professional.";
      return NextResponse.json({ answer: safeResponse });
    } else {
      return NextResponse.json({ answer: analystAnswer });
    }

  } catch (error) {
    console.error('Error in multi-agent chat:', error);
    return NextResponse.json({ error: 'Failed to get a response.' }, { status: 500 });
  }
}