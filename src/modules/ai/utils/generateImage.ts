import axios from 'axios';

// ⚡ Génération d’image sans insert
export async function generate(prompt: string): Promise<{ url: string }> {
  try {
    const response = await axios.post<any>(
      'https://api.infip.pro/v1/images/generations',
      {
        model: 'img3',
        prompt,
        n: 1,
        size: '1024x1024',
      },
      {
        headers: {
          Authorization: `Bearer infip-fcbc2b51`,
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
