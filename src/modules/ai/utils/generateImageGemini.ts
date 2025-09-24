import axios from "axios";
import 'dotenv/config'; // ⚡ assure que .env est chargé

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // ⚡ stocke ta clé dans .env

export async function generate(prompt: string): Promise<{ url: string }> {
  console.log(GEMINI_API_KEY)
console.log("*******************************")
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"], // ✅ demande une image
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ) as any;

    // ⚡ L’image est encodée en base64 dans inlineData
    const inlineData =
      response.data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!inlineData) {
      throw new Error("Aucune image générée par Gemini");
    }

    // Convertir en Data URL utilisable directement dans <img src="...">
    const url = `data:${inlineData.mimeType};base64,${inlineData.data}`;

    return { url };
  } catch (error: any) {
    console.error(
      "Erreur génération image:",
      error.response?.data || error.message
    );
    throw new Error("Impossible de générer l’image");
  }
}
