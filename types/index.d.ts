interface Ingredient {
  ingredientName: string;
  aliases: string[];
  category: string;
  summary: string;
  details: string;
  source: string;
}

interface CerebrasCompletion {
  choices: {
    message: {
      content: string | null;
    };
  }[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}