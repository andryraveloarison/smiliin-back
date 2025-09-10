// src/calendrier/calendrier.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalendrierService } from './calendrier.service';
import { CalendrierController } from './calendrier.controller';
import { Publication, PublicationSchema } from '../publication/schema/publication.schema';
import { Descente, DescenteSchema } from '../descente/schema/descente.schema';
import { Meeting, MeetingSchema } from '../meeting/schema/meeting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publication.name, schema: PublicationSchema }]),
    MongooseModule.forFeature([{ name: Descente.name, schema: DescenteSchema }]),
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
  ],
  controllers: [CalendrierController],
  providers: [CalendrierService],
})
export class CalendrierModule {}
