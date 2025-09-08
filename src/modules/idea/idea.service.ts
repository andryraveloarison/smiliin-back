// src/ideas/idea.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idea, IdeaDocument } from './schema/idea.schema';

@Injectable()
export class IdeaService {
  constructor(@InjectModel(Idea.name) private ideaModel: Model<IdeaDocument>) {}

  async create(data: Partial<Idea>): Promise<Idea> {
    const idea = new this.ideaModel(data);
    return idea.save();
  }

  async findAll(): Promise<Idea[]> {
    return this.ideaModel.find().populate('category').exec();
  }

  async findOne(id: string): Promise<Idea> {
    const idea = await this.ideaModel.findById(id).populate('category').exec();
    if (!idea) throw new NotFoundException('Idea not found');
    return idea;
  }

  async update(id: string, data: Partial<Idea>): Promise<Idea> {
    const idea = await this.ideaModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('category')
      .exec();
    if (!idea) throw new NotFoundException('Idea not found');
    return idea;
  }

  async remove(id: string): Promise<void> {
    const result = await this.ideaModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Idea not found');
  }
}
