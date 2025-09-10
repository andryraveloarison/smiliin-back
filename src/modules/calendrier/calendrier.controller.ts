import { Controller, Get, Param } from '@nestjs/common';
import { CalendrierService } from './calendrier.service';

@Controller('calendrier')
export class CalendrierController {
  constructor(private readonly calendrierService: CalendrierService) {}

  // --- Tous les événements d’un utilisateur ---
  @Get('user/:userId')
  async getAllByUser(@Param('userId') userId: string) {
    const data=  await this.calendrierService.getAllByUser(userId)
    return data
  }

  // --- Tous les événements d’un utilisateur pour un mois précis ---
  @Get('user/:userId/month/:year/:month')
  async getByUserAndMonth(
    @Param('userId') userId: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return {
      success: true,
      data: await this.calendrierService.getByUserAndMonth(userId, +year, +month),
    };
  }

  // --- Tous les événements d’un utilisateur sur X derniers mois (10 par défaut) ---
  @Get('user/:userId/last-months/:months?')
  async getByUserLastMonths(
    @Param('userId') userId: string,
    @Param('months') months?: number,
  ) {
    return {
      success: true,
      data: await this.calendrierService.getByUserLastMonths(userId, months ? +months : 10),
    };
  }

  // --- Tous les événements de tous les utilisateurs sur les 5 derniers mois ---
  @Get('all/last-months/:months?')
  async getAllUsersLastMonths(@Param('months') months?: number) {
    return {
      success: true,
      data: await this.calendrierService.getAllUsersLastMonths(months ? +months : 15),
    };
  }
}
