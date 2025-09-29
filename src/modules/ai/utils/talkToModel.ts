import axios from "axios";
import "dotenv/config";

export async function talkToModel(prompt: string): Promise<string> {
  const apiKey = process.env.LLAMA_MODEL_API_KEY;
  if (!apiKey) {
    throw new Error("La clé LLAMA_MODEL_API_KEY n’est pas définie");
  }

  try {
    const response = await axios.post<any>(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-4-maverick:free", // nom du modèle OpenRouter
        messages: [
          { role: "user", content: prompt },
        ],
        max_tokens: 500,        // par exemple
        temperature: 0.7,       // ajustable
        // tu peux ajouter d’autres paramètres supportés par OpenRouter
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // la réponse a une structure similaire à celle d’OpenAI
    const choices = response.data.choices;
    if (!choices || choices.length === 0) {
      throw new Error("Aucune réponse reçue du modèle");
    }
    return choices[0].message.content;
  } catch (error: any) {
    console.error("Erreur talkToModel (OpenRouter):", error.response?.data || error.message || error);
    throw new Error("Impossible d’obtenir une réponse du modèle via OpenRouter");
  }
}
