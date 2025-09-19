

import axios from 'axios';

// ⚡ Génération d’image sans insert
export async function generateImage(prompt: string): Promise<{ url: string }> {
  try {
    const response = await axios.post<any>(
      'https://clipdrop-api.co/text-to-image/v1',
      {
        prompt,
      },
      {
        headers: {
          'x-api-key': `b6c189da9201f010e2e1cfb354518fe8fa743c032d9644093ee26c4731c91f8c9d51dd55baf8fca1d279b45eb135c711`,
          'Content-Type': 'application/json',
        },
      },
    );

    return { url: response.data.data[0].url };
  } catch (error: any) {
    console.error('Erreur génération image:', error.response?.data || error);
    throw new Error('Impossible de générer l’image');
  }
}
