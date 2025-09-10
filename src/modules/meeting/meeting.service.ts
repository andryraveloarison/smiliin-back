// src/meeting/meeting.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meeting, MeetingDocument } from './schema/meeting.schema';

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
  ) {}

  async createMeeting(data: Partial<Meeting>): Promise<Meeting> {
    const meeting = new this.meetingModel(data);
    return meeting.save();
  }

  async getMeetings(): Promise<Meeting[]> {
    return this.meetingModel.find().populate('userId', 'email name logo').populate('clientId', 'email name logo').exec();
  }

  async getMeetingById(id: string): Promise<Meeting> {
    return this.meetingModel
      .findById(id)
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
    return this.meetingModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }
  
}
