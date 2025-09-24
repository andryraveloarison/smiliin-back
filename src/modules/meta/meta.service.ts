import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getPageInfo } from './utils/facebook/getPageInfo';
import { getAllPage } from './utils/facebook/getAllPage';
import { getAdsPage } from './utils/facebook/getAdsPage';
import { getPageInsights } from './utils/facebook/getPageInsights';

@Injectable()
export class MetaService {

  async getPageInfo(pageId: string){
      return getPageInfo(pageId)
  }

  async getAllPage(){
    return getAllPage()
  } 

  async getPageInsights(pageId: string, period: string){
    return getPageInsights(pageId, period)
  }

  async getAdsPage(){
    return getAdsPage()
  }
}
