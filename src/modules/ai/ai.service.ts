import { Injectable } from '@nestjs/common';
import { generate } from './utils/generateImageGemini';
import { generatePrompt } from './utils/generatePrompt';
import { generateImage } from './utils/generateImageTest';
import { generateWithGemini } from './utils/generateImage';

@Injectable()
export class AiService {
  // Génère une image directement à partir d’un prompt
  async generateImage(prompt: string) {
    return await generateWithGemini(prompt);
  }

  // Génère un prompt publicitaire + image à partir d’une description d’entreprise
  async generateAd(entreprise: string, previousPrompts: string) {
    const adPrompt = await generatePrompt(entreprise, previousPrompts);
    const image = await generate(adPrompt);

    return {
      entreprise,
      prompt: adPrompt,
      imageUrl: image.url,
    };
  }
}
