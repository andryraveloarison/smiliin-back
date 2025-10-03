import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idea, IdeaDocument } from './schema/idea.schema';
import axios from 'axios';
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

    console.log("UPDATE IDEA SERVICE")
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

  async remove(id: string, deleteBy: string): Promise<void> {
    const result = await this.ideaModel.findByIdAndDelete(id).exec();
    this.socketGateway.emitSocket('Idea',{
      id,
      userId: deleteBy,
      action:'delete'});

    if (!result) throw new NotFoundException('Idea not found');
  }


   // ⚡ Génération d’image sans insert
   async generate(prompt: string): Promise<{ url: string }> {
    try {
      const response = await axios.post<any>(
        'https://api.infip.pro/v1/images/generations',
        {
          model: 'img3',
          prompt,
          n: 1,
          size: '1024x1024',
        },
        {
          headers: {
            Authorization: `Bearer infip-ac0f0147`,
            'Content-Type': 'application/json',
          },
        },
      );

      return { url: response.data.data[0].url };
    } catch (error) {
      console.error('Erreur génération image:', error.response?.data || error);
      throw new Error('Impossible de générer l’image');
    }
  }
}
