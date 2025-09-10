// src/descente/descente.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Descente, DescenteDocument } from './schema/descente.schema';

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
}
