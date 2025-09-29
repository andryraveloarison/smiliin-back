import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { adsDto } from './dto/ads.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // 📌 Génération d’image directe avec un prompt
  @Post('generate-image')
  async generateImage(@Body('prompt') prompt: string) {
    if (!prompt) {
      return { error: 'Le prompt est requis' };
    }
    try {
      const image = await this.aiService.generateImage(prompt);
      return { success: true, imageUrl: image.url };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la génération d’image' };
    }
  }

  // 📌 Génération publicité (description entreprise -> prompt -> image)
  @Post('generate-ad')
  async generateAd(@Body() dto: adsDto) {
    if (!dto.entreprise) {
      return { error: 'La description de l’entreprise est requise' };
    }
    try {
      const result = await this.aiService.generateAd(dto.entreprise);

      return {result };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la génération de publicité' };
    }
  }
}
