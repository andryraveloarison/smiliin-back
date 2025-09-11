import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { Meeting } from './schema/meeting.schema';

@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  // ✅ Créer un meeting
  @Post()
  async createMeeting(@Body() body: Partial<Meeting>) {
    return this.meetingService.createMeeting(body);
  }

  // ✅ Tous les meetings
  @Get()
  async getMeetings() {
    return this.meetingService.getMeetings();
  }

  // ✅ Par ID
  @Get(':id')
  async getMeetingById(@Param('id') id: string) {
    return this.meetingService.getMeetingById(id);
  }

  // ✅ Update
  @Put(':id')
  async updateMeeting(
    @Param('id') id: string,
    @Body() body: Partial<Meeting>,
  ) {
    return this.meetingService.updateMeeting(id, body);
  }

  // ✅ Tous les meetings d’un utilisateur
  @Get('user/:userId')
  async getAllByUser(@Param('userId') userId: string) {
    return this.meetingService.getAllByUser(userId);
  }

  // ✅ Meetings +/- 5 mois autour de la date actuelle
  @Get('user/:userId/last-months/:months')
  async getByUserLastMonths(
    @Param('userId') userId: string,
    @Param('months') months: string,
  ) {
    return this.meetingService.getByUserLastMonths(userId, Number(months));
  }

  // ✅ Meetings par mois/année
  @Get('user/:userId/:year/:month')
  async getByUserAndMonthYear(
    @Param('userId') userId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.meetingService.getByUserAndMonthYear(
      userId,
      Number(year),
      Number(month),
    );
  }
}
