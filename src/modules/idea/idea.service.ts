import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idea, IdeaDocument } from './schema/idea.schema';
import axios from 'axios';

@Injectable()
export class IdeaService {
  constructor(@InjectModel(Idea.name) private ideaModel: Model<IdeaDocument>) {}

  async create(data: Partial<Idea>): Promise<Idea> {
    const idea = new this.ideaModel(data);
    const ideaSaved = await idea.save()

    const ideaReturn = await this.ideaModel
    .findById(ideaSaved.id)
    .populate('category')
    .populate('userId', 'id name logo email')
    .exec();
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

  async update(id: string, data: Partial<Idea>): Promise<Idea> {
    const idea = await this.ideaModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('category')
      .populate('userId', 'id name logo email')
      .exec();

    if (!idea) throw new NotFoundException('Idea not found');
    return idea;
  }

  async remove(id: string): Promise<void> {
    const result = await this.ideaModel.findByIdAndDelete(id).exec();
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
