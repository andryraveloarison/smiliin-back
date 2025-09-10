// src/meeting/meeting.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Meeting, MeetingSchema } from './schema/meeting.schema';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
})
export class MeetingModule {}
