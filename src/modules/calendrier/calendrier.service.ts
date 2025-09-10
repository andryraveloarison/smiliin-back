import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publication, PublicationDocument } from '../publication/schema/publication.schema';
import { Descente, DescenteDocument } from '../descente/schema/descente.schema';
import { Meeting, MeetingDocument } from '../meeting/schema/meeting.schema';
import { subMonths } from 'date-fns';

@Injectable()
export class CalendrierService {
  constructor(
    @InjectModel(Publication.name) private pubModel: Model<PublicationDocument>,
    @InjectModel(Descente.name) private descenteModel: Model<DescenteDocument>,
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
  ) {}

  // 🔹 Formatter générique
  private formatEvents(events: any[], type: string, dateField: string) {
    return events.map(e => ({
      id: e._id.toString(),
      type,
      user: e.userId
        ? {
            id: e.userId._id?.toString(),
            name: e.userId.name,
            email: e.userId.email,
            logo: e.userId.logo,
          }
        : null,
      ...e,
      _id: undefined,
      __v: undefined,
      userId: undefined,
    }));
  }

  // 🔹 Groupement mois → jours
  private groupByMonthAndDay(events: any[], dateField: string) {
    const result: Record<string, Record<string, any[]>> = {};

    for (const event of events) {
      const date = new Date(event[dateField]);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!result[monthKey]) result[monthKey] = {};
      if (!result[monthKey][dayKey]) result[monthKey][dayKey] = [];

      result[monthKey][dayKey].push(event);
    }

    return result;
  }

  // 🔹 Tous les événements d’un utilisateur (toute la période)
  async getAllByUser(userId: string) {
    const uid = new Types.ObjectId(userId);
  
    const publications = this.formatEvents(
      await this.pubModel
        .find({ userId: userId })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'publication',
      'publishDate',
    );


  
    const descentes = this.formatEvents(
      await this.descenteModel
        .find({ clientId: userId })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'descente',
      'descenteDate',
    );


  
    const meetings = this.formatEvents(
      await this.meetingModel
        .find({ clientId: uid })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'meeting',
      'meetingDate',
    );

    
  
    console.log(meetings)

    const allEvents = [...publications, ...descentes, ...meetings];
  
    if (allEvents.length === 0) {
      return {};
    }
  
    const dateFieldMap = {
      publication: 'publishDate',
      descente: 'descenteDate',
      meeting: 'meetingDate',
    } as const;
  
    const data = this.groupByMonthAndDay(
        allEvents,
        dateFieldMap[allEvents[0].type],
      )
    return data;
  }

  // 🔹 Par mois pour un utilisateur
  async getByUserAndMonth(userId: string, year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const publications = this.formatEvents(
      await this.pubModel
        .find({ userId, publishDate: { $gte: startOfMonth, $lte: endOfMonth } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'publication',
      'publishDate',
    );

    const descentes = this.formatEvents(
      await this.descenteModel
        .find({ userId, descenteDate: { $gte: startOfMonth, $lte: endOfMonth } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'descente',
      'descenteDate',
    );

    const meetings = this.formatEvents(
      await this.meetingModel
        .find({ userId, meetingDate: { $gte: startOfMonth, $lte: endOfMonth } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'meeting',
      'meetingDate',
    );

    const allEvents = [...publications, ...descentes, ...meetings];

    return {
      success: true,
      data: this.groupByMonthAndDay(allEvents, {
        publication: 'publishDate',
        descente: 'descenteDate',
        meeting: 'meetingDate',
      }[allEvents[0]?.type || 'publishDate']),
    };
  }

  // 🔹 Les X derniers mois pour un utilisateur
  async getByUserLastMonths(userId: string, months: number = 10) {
    const now = new Date();
    const startDate = subMonths(now, months - 1);

    const publications = this.formatEvents(
      await this.pubModel
        .find({ userId, publishDate: { $gte: startDate, $lte: now } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'publication',
      'publishDate',
    );

    const descentes = this.formatEvents(
      await this.descenteModel
        .find({ userId, descenteDate: { $gte: startDate, $lte: now } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'descente',
      'descenteDate',
    );

    const meetings = this.formatEvents(
      await this.meetingModel
        .find({ userId, meetingDate: { $gte: startDate, $lte: now } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'meeting',
      'meetingDate',
    );

    const allEvents = [...publications, ...descentes, ...meetings];

    return {
      success: true,
      data: this.groupByMonthAndDay(allEvents, {
        publication: 'publishDate',
        descente: 'descenteDate',
        meeting: 'meetingDate',
      }[allEvents[0]?.type || 'publishDate']),
    };
  }

  // 🔹 Tous les users sur les 5 derniers mois
  async getAllUsersLastMonths(months: number = 5) {
    const now = new Date();
    const startDate = subMonths(now, months - 1);

    const publications = this.formatEvents(
      await this.pubModel
        .find({ publishDate: { $gte: startDate, $lte: now } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'publication',
      'publishDate',
    );

    const descentes = this.formatEvents(
      await this.descenteModel
        .find({ descenteDate: { $gte: startDate, $lte: now } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'descente',
      'descenteDate',
    );

    const meetings = this.formatEvents(
      await this.meetingModel
        .find({ meetingDate: { $gte: startDate, $lte: now } })
        .populate('userId', 'name email logo')
        .lean()
        .exec(),
      'meeting',
      'meetingDate',
    );

    const allEvents = [...publications, ...descentes, ...meetings];

    return {
      success: true,
      data: this.groupByMonthAndDay(allEvents, {
        publication: 'publishDate',
        descente: 'descenteDate',
        meeting: 'meetingDate',
      }[allEvents[0]?.type || 'publishDate']),
    };
  }
}
