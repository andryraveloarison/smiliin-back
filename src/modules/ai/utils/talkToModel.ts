import axios from "axios";
import 'dotenv/config'; // ⚡ assure que .env est chargé

// ⚡ Fonction pour envoyer un prompt et recevoir un texte
export async function talkToModel(prompt: string): Promise<string> {
    
  try {

  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) throw new Error('La clé AI_API_KEY n’est pas définie');

    const response = await axios.post<any>(
      "https://models.github.ai/inference/chat/completions", // 👉 remplace par ton endpoint réel
      {
        model: "xai/grok-3", // ou le modèle que tu utilises
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`, // clé stockée dans les variables d’environnement
          "Content-Type": "application/json",
        },
      }
    );

    // ⚡ On récupère le texte de la réponse
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("Erreur talkToModel:", error.response?.data || error);
    throw new Error("Impossible d’obtenir une réponse du modèle");
  }
}
