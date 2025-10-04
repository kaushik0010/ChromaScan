# ChromaScan – AI-Powered Product Label Analysis

ChromaScan is a smart, conversational product intelligence tool. Simply scan any product label with your camera, and our advanced multi-agent AI system will instantly decode the ingredients, provide a simple summary, and answer your follow-up questions in real-time.



**[ ➡️ View the Live Demo Here ](YOUR_VERCEL_DEPLOYMENT_URL_HERE)**

---

## The Problem

Product labels are confusing. They are filled with complex chemical names, jargon, and fine print that make it difficult for everyday consumers to make informed choices. Whether you have allergies, dietary restrictions, or simply want to understand what's in your products, the information barrier is a real and constant problem.

## The Solution

ChromaScan acts as your personal product expert. It bridges the gap between confusing labels and clear understanding. By leveraging a sophisticated, multi-agent Generative AI pipeline, it transforms a simple photo into a helpful, interactive conversation, empowering users to make confident decisions about the products they use every day.

---

## Key Features

* **Instant Analysis:** Get an AI-generated summary of any product label (food, cosmetics, cleaning supplies) in seconds.
* **Conversational AI Chat:** Ask follow-up questions and get context-aware answers. Our AI remembers the conversation.
* **Multi-Agent System:** A team of specialist AIs work together to provide accurate, safe, and relevant information.
* **Smart Recognition:** The app intelligently detects whether you've scanned an ingredient list or the front of a product, providing helpful guidance.
* **Mobile-First PWA:** Install ChromaScan to your home screen for a fast, native-app-like experience with live camera access.
* **Secure & Private:** User-uploaded images are processed and immediately discarded. We store no personal data.
* **Light & Dark Mode:** A sleek, futuristic UI that adapts to your system's theme.

---

## How to Test (User Flow)

Here’s a simple guide to experiencing ChromaScan's full capabilities:

**1. First Scan (Front of Product):**
* **Action:** Upload an image of the **front** of a product (e.g., the front of a Coca-Cola can).
* **Expected Result:** The AI will recognize it's not an ingredient list. It will provide a general summary of the product and then prompt you to scan the back.
    > *"It looks like you've scanned a Coca-Cola can. This is a popular carbonated soft drink... For a detailed analysis, please scan the ingredient list."*

**2. Second Scan (Ingredient List):**
* **Action:** Upload a clear image of a cosmetic or food **ingredient list**.
* **Expected Result:** You will receive a detailed, AI-generated summary of the key ingredients and their functions. The follow-up chat box will now appear.
    > *": This product appears to be a hydrating formula. It features key ingredients like Niacinamide, which helps with skin texture, and Glycerin to draw in moisture..."*

**3. Ask a Factual Follow-up:**
* **Action:** In the chat box, type a question about an ingredient from the summary, like: `What is the function of Niacinamide?`
* **Expected Result:** The AI will provide a concise, factual answer based on the data it has.
    > *"Niacinamide is a versatile ingredient that helps minimize the appearance of pores, improve uneven skin tone, and strengthen the skin's surface."*

**4. Ask a Context-Aware Follow-up:**
* **Action:** Ask a question that refers to the previous context, like: `What about the other one you mentioned?`
* **Expected Result:** The AI will use its conversational memory to understand you're asking about Glycerin and provide the relevant information.

**5. Test the Safety Guardrail:**
* **Action:** Ask a question that requires medical advice, like: `Is this safe for my baby?`
* **Expected Result:** The AI will immediately decline to answer and redirect you to a professional, demonstrating its safety training.
    > *"As an AI ingredient analyst, I can't provide medical advice or personal usage instructions. For that kind of recommendation, it's always best to consult with a qualified professional..."*

---

## Tech Stack & Architecture

This project was built using a modern, decoupled, full-stack architecture, deeply integrating key sponsor technologies from the **FutureStack GenAI Hackathon**.

### Frontend
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **UI:** React, Tailwind CSS
* **API Client:** Axios

### Backend
* **Runtime:** Node.js (via Next.js API Routes)
* **Security:** Upstash Redis for API Rate Limiting, File Validation, Prompt Hardening
* **Image Processing:** `heic-convert` for native iPhone photo support

### AI & Cloud Services
* **Generative AI Models:** **Meta Llama** (`llama3.1-8b`, `llama-4-scout-17b`)
* **AI Inference Platform:** **Cerebras API**
* **OCR:** **Google Cloud Vision API**

### Deployment
* **Platform:** **Vercel**

---

## How It Works: The Multi-Agent Pipeline

Our system uses a sophisticated "Intelligent Assembly Line" to ensure every response is fast, accurate, and safe.

1.  **Image Upload & OCR:** The user uploads an image. We perform security checks, convert HEIC files if necessary, and send it to the **Google Cloud Vision API** to extract the raw text.
2.  **RAG - Retrieval:** Our backend searches a curated **Knowledge Base** (a JSON file) to find factual data about ingredients mentioned in the text.
3.  **Conversational AI - Generation:** The user's query and the retrieved factual data are sent to our multi-agent system running on the **Cerebras API**.
    * **Agent 1 (Triage):** A small, fast Llama model classifies the user's intent (e.g., `ANALYSIS` or `SAFETY`).
    * **Agent 2 (Analyst):** A powerful Llama model uses the factual data to generate a detailed, context-aware answer.
    * **Agent 3 (Safety Guardrail):** A third Llama model reviews the Analyst's proposed answer to ensure it contains no medical advice before it is sent to the user.
4.  **Response:** The final, verified answer is sent back to the frontend and displayed to the user.

---

## Getting Started (Local Setup)

To run this project locally, follow these steps:

**1. Prerequisites:**
* Node.js (v18+)
* `pnpm` package manager
* Access to Google Cloud Vision, Cerebras, and Upstash APIs.

**2. Clone the Repository:**
```bash
git clone https://github.com/kaushik0010/ChromaScan.git
cd chromascan
```

**3. Install Dependencies:**
```bash
pnpm install
```

**4. Set Up Environment Variables:**
- Create a file named .env.local in the project root & add the following required keys:

```bash
GOOGLE_VISION_API_KEY="YOUR_GOOGLE_API_KEY"
CEREBRAS_API_KEY="YOUR_CEREBRAS_API_KEY"
UPSTASH_REDIS_REST_URL="YOUR_UPSTASH_URL"
UPSTASH_REDIS_REST_TOKEN="YOUR_UPSTASH_TOKEN"
```

**5. Run the Development Server:**
```bash
pnpm dev
```

The application will be available at http://localhost:3000.


---

## Future Roadmap
* **Scan History & User Profiles:** Allow users to save their scans and create profiles with personalized preferences (e.g., allergies, dietary needs).

* **UI Polish:** Implement loading skeletons for a smoother user experience.

* **Expanded Knowledge Base:** Continuously add more products, ingredients, and categories to the RAG database.
