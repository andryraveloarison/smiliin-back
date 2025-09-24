import axios from "axios";
import 'dotenv/config';
import { FileService } from "src/utils/file.service";

const fileService = new FileService();

export async function generateWithGemini(prompt: string): Promise<{ url: string }> {
  try {
    const payload = {
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      modalities: ["image", "text"],
    };

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data as any;

    const choices = data.choices;

    if (!choices || choices.length === 0) {
      throw new Error("Pas de choix retourné par l'API");
    }

    const message = choices[0].message;
    const images = message.images;
    if (!images || images.length === 0) {
      throw new Error("Pas d’image dans la réponse");
    }
    // On prend la première image
    const imageObj = images[0];
    const imageUrl = imageObj.image_url?.url;
    if (!imageUrl) {
      throw new Error("L’URL/base64 de l’image est manquante");
    }

    // imageUrl = "data:image/png;base64,XXXX..."
    const [_, b64] = imageUrl.split(",");
    if (!b64) {
      throw new Error("La partie base64 est vide");
    }

    // Convertir en buffer
    const buffer = Buffer.from(b64, "base64");

    // Upload vers Supabase via ton FileService
    const filename = `generated_gemini_${Date.now()}.png`;
    const url = await fileService.uploadFile(buffer, filename, "idea");

    return { url }; // ✅ Retourne directement l'URL publique de Supabase
  } catch (err: any) {
    console.error("Erreur génération Gemini:", err.response?.data || err.message || err);
    throw new Error("Impossible de générer l’image avec Gemini");
  }
}
