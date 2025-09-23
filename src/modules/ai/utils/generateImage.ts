import axios from "axios";
import 'dotenv/config';
import { writeFile } from "fs/promises"; // version async/await

export async function generate(prompt: string): Promise<{ url: string; filePath: string }> {
  try {
    console.log("GENERATION");
    prompt = "A cat on the road on tesla cars";

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("output_format", "png");

    const response = await axios.post(     
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
          ...((form as any).getHeaders?.() || {}),
        },
      }
    ) as any;

    // ⚡ Vérifie la structure (parfois c’est image_base64[0], parfois image)
    const b64 = response.data.image_base64?.[0] || response.data.image;

    // Crée un buffer à partir du base64
    const buffer = Buffer.from(b64, "base64");

    // Choisis un nom de fichier
    const filePath = `generated_${Date.now()}.png`;

    // Sauvegarde le fichier sur disque
    await writeFile(filePath, buffer);

    console.log(`✅ Image sauvegardée : ${filePath}`);

    // Renvoie à la fois l’URL base64 et le chemin du fichier
    return { url: `data:image/png;base64,${b64}`, filePath };
  } catch (error: any) {
    console.error("Erreur génération image:", error.response?.data || error);
    throw new Error("Impossible de générer l’image");
  }
}
