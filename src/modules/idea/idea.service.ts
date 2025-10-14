import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idea, IdeaDocument } from './schema/idea.schema';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class IdeaService {
  constructor(
    @InjectModel(Idea.name) private ideaModel: Model<IdeaDocument>,
    private readonly socketGateway: SocketGateway,
  
  ) {}

  async create(data: Partial<Idea>, createBy?: string): Promise<Idea> {
    const idea = new this.ideaModel(data);
    const ideaSaved = await idea.save()

    const ideaReturn = await this.ideaModel
    .findById(ideaSaved.id)
    .populate('category')
    .populate('userId', 'id name logo email')
    .exec();

    this.socketGateway.emitSocket('Idea',{
      id: ideaReturn._id.toString(),
      userId: createBy,
      action:'create'});
    
    return ideaReturn;
  }

  async findAll(): Promise<Idea[]> {
    return this.ideaModel
      .find()
      .populate('category')
      .populate('userId', 'id name logo email') // on renvoie seulement certains champs
      .exec();
  }

  async findOne(id: string): Promise<Idea> {
    const idea = await this.ideaModel
      .findById(id)
      .populate('category')
      .populate('userId', 'id name logo email')
      .exec();

    if (!idea) throw new NotFoundException('Idea not found');
    return idea;
  }

  async update(id: string, data: any, updateBy?: string): Promise<Idea> {

    const idea = await this.ideaModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('category')
      .populate('userId', 'id name logo email')
      .exec();

    if (!idea) throw new NotFoundException('Idea not found');

    this.socketGateway.emitSocket('Idea',{
      id,
      userId: updateBy,
      action:'update'});

    return idea;
  }

  async remove(id: string, deleteBy: string): Promise<{deleted: boolean, id: string}> {

    const result = await this.ideaModel.findByIdAndDelete(id).exec();

    this.socketGateway.emitSocket('Idea',{
      id,
      userId: deleteBy,
      action:'delete'});

    if (!result) throw new NotFoundException('Idea not found');

    return { deleted: true , id};

  }


}
