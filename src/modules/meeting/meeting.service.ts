import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meeting, MeetingDocument } from './schema/meeting.schema';
import { subMonths, addMonths } from 'date-fns';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    private readonly socketGateway: SocketGateway,

  ) {}

  // ✅ Créer un meeting
  async createMeeting(data: Partial<Meeting>): Promise<Meeting> {
    const meeting = new this.meetingModel(data);
    const newMeeting = await meeting.save()

    this.socketGateway.emitSocket('meeting',{
      id: newMeeting._id.toString(),
      action: 'create'});

    return newMeeting;
  }

  // ✅ Récupérer tous les meetings
  async getMeetings(): Promise<Meeting[]> {
    return this.meetingModel
      .find()
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Récupérer par ID
  async getMeetingById(id: string): Promise<Meeting> {
    return this.meetingModel
      .findById(id)
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Mettre à jour
  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {

      // 🔔 Émettre un socket pour notifier la suppression (optionnel si tu veux du temps réel)
    this.socketGateway.emitSocket('meeting', {
      id: id,
      action: 'update',
    });

    return this.meetingModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Récupérer tous les meetings d’un utilisateur
  async getAllByUser(userId: string): Promise<Meeting[]> {
    return this.meetingModel
      .find({ clientId: userId })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Meetings dans un intervalle de 5 mois avant/après
  async getByUserLastMonths(userId: string, months: number = 5): Promise<Meeting[]> {
    const now = new Date();
    const startDate = subMonths(now, months);
    const endDate = addMonths(now, months);

    return this.meetingModel
      .find({
        clientId: userId,
        meetingDate: { $gte: startDate, $lte: endDate },
      })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Récupérer par année et mois
  async getByUserAndMonthYear(userId: string, year: number, month: number): Promise<Meeting[]> {
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    return this.meetingModel
      .find({
        clientId: userId,
        meetingDate: { $gte: startOfMonth, $lte: endOfMonth },
      })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Supprimer un meeting
async deleteMeeting(id: string): Promise<{ deleted: boolean }> {
  const deleted = await this.meetingModel.findByIdAndDelete(id).exec();
  if (!deleted) {
    throw new NotFoundException(`Meeting with id ${id} not found`);
  }

  // 🔔 Émettre un socket pour notifier la suppression (optionnel si tu veux du temps réel)
  this.socketGateway.emitSocket('meeting', {
    id: id,
    action: 'delete',
  });

  return { deleted: true };
}

}
