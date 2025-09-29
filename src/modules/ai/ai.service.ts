import { Injectable } from '@nestjs/common';
import { generatePrompt } from './utils/generatePrompt';
import { generateWithGemini } from './utils/generateImage';

@Injectable()
export class AiService {
  // Génère une image directement à partir d’un prompt
  async generateImage(prompt: string) {
    return await generateWithGemini(prompt);
  }

  // Génère un prompt publicitaire + image à partir d’une description d’entreprise
  async generateAd(entreprise: string) {

    const adPrompt = await generatePrompt(entreprise);
    console.log("********************************")
    console.log(adPrompt)
    console.log("********************************")
    return
    const image = await generateWithGemini(adPrompt);

    return {
      entreprise,
      prompt: adPrompt,
      imageUrl: image.url,
    };
  }
}
