import { Controller, Get, Param } from '@nestjs/common';
import { MetaService } from './meta.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}


  @Get('getAllPage')
  async getAllPage(): Promise<any> {
    return this.metaService.getAllPage();
  }

  @Get('getPageInfo/:pageId')
  async getPageInfo(@Param('pageId') pageId: string): Promise<any> {
    return this.metaService.getPageInfo(pageId);
  }


  @Get('getAdsPage')
  async getAdsPage(): Promise<any> {
    return this.metaService.getAdsPage();
  }
}
