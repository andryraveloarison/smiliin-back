import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Insight, InsightDocument } from './schema/insight.schema';
import { CreateInsightDto } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class InsightService {
  constructor(
    @InjectModel(Insight.name) private insightModel: Model<InsightDocument>,
    private readonly socketGateway: SocketGateway,

  ) {}

  async create(dto: CreateInsightDto): Promise<Insight> {
    const created = new this.insightModel({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
    });

    const newInsight = await created.save()
    this.socketGateway.emitSocket('insight',{
      id: newInsight._id.toString(),
      action: 'create'});

    return newInsight;
  }

  async findAll(): Promise<Insight[]> {
    return this.insightModel.find().populate('userId').exec();
  }

  async findOne(id: string): Promise<Insight> {
    const insight = await this.insightModel.findById(id).populate('userId').exec();
    if (!insight) throw new NotFoundException('Insight not found');
    return insight;
  }

  async update(id: string, dto: UpdateInsightDto): Promise<Insight> {
    const updated = await this.insightModel
      .findByIdAndUpdate(id, { ...dto }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Insight not found');

    this.socketGateway.emitSocket('insight',{
      id: id,
      action: 'update'});

    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.insightModel.findByIdAndDelete(id).exec();
    this.socketGateway.emitSocket('insight',{
      id,
      action: 'delete'});

    if (!deleted) throw new NotFoundException('Insight not found');
  }

  async findByUser(userId: string): Promise<Insight[]> {
    return this.insightModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }
}
