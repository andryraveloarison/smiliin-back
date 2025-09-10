// src/meeting/meeting.controller.ts
import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { Meeting } from './schema/meeting.schema';

@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  async createMeeting(@Body() body: Partial<Meeting>) {
    return this.meetingService.createMeeting(body);
  }

  @Get()
  async getMeetings() {
    return this.meetingService.getMeetings();
  }

  @Get(':id')
  async getMeetingById(@Param('id') id: string) {
    return this.meetingService.getMeetingById(id);
  }

  @Put(':id')
    async updateMeeting(
    @Param('id') id: string,
    @Body() body: Partial<Meeting>,
    ) {
    return this.meetingService.updateMeeting(id, body);
    }
}
