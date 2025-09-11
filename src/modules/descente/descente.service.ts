import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Descente, DescenteDocument } from './schema/descente.schema';
import { subMonths, addMonths } from 'date-fns';

@Injectable()
export class DescenteService {
  constructor(
    @InjectModel(Descente.name) private descenteModel: Model<DescenteDocument>,
  ) {}

  async createDescente(data: Partial<Descente>): Promise<Descente> {
    const descente = new this.descenteModel(data);
    return descente.save();
  }

  async getDescentes(): Promise<Descente[]> {
    return this.descenteModel
      .find()
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  async getDescenteById(id: string): Promise<Descente> {
    return this.descenteModel
      .findById(id)
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  async updateDescente(id: string, data: Partial<Descente>): Promise<Descente> {
    return this.descenteModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Récupérer toutes les descentes d’un utilisateur
  async getAllByUser(userId: string): Promise<Descente[]> {
    return this.descenteModel
      .find({ clientId: userId })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Récupérer les descentes pour un utilisateur dans un intervalle de 5 mois avant/après
  async getByUserLastMonths(userId: string, months: number = 5): Promise<Descente[]> {
    const now = new Date();
    const startDate = subMonths(now, months);
    const endDate = addMonths(now, months);

    return this.descenteModel
      .find({
        clientId: userId,
        descenteDate: { $gte: startDate, $lte: endDate },
      })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }

  // ✅ Récupérer par année et mois précis
  async getByUserAndMonthYear(userId: string, year: number, month: number): Promise<Descente[]> {
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    return this.descenteModel
      .find({
        clientId: userId,
        descenteDate: { $gte: startOfMonth, $lte: endOfMonth },
      })
      .populate('userId', 'email name logo')
      .populate('clientId', 'email name logo')
      .exec();
  }
}
