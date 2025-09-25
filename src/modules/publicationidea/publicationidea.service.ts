import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PublicationIdea } from './schema/publicationidea.schema';

@Injectable()
export class PublicationIdeaService {
  constructor(
    @InjectModel(PublicationIdea.name)
    private readonly publicationIdeaModel: Model<PublicationIdea>,
  ) {}

  // Créer un PublicationIdea
// ...
  // Créer un PublicationIdea avec au moins 1 idée
  async create(publicationId: string, ideaId: string): Promise<PublicationIdea> {
    if (!ideaId) {
      throw new Error('Une publication doit avoir au moins une idée');
    }

    const newPubIdea = new this.publicationIdeaModel({
      publication: new Types.ObjectId(publicationId),
      ideas: [new Types.ObjectId(ideaId)], // au moins une idée
    });

    return newPubIdea.save();
  }


  // Ajouter une idée dans PublicationIdea
  async addIdea(publicationIdeaId: string, ideaId: string): Promise<PublicationIdea> {
    const pubIdea = await this.publicationIdeaModel.findById(publicationIdeaId);
    if (!pubIdea) throw new NotFoundException('PublicationIdea not found');

    if (!pubIdea.ideas.includes(new Types.ObjectId(ideaId))) {
      pubIdea.ideas.push(new Types.ObjectId(ideaId));
    }
    return pubIdea.save();
  }

  // Supprimer une idée du tableau
  async removeIdea(publicationIdeaId: string, ideaId: string): Promise<PublicationIdea> {
    const pubIdea = await this.publicationIdeaModel.findById(publicationIdeaId);
    if (!pubIdea) throw new NotFoundException('PublicationIdea not found');

    pubIdea.ideas = pubIdea.ideas.filter(
      (id) => id.toString() !== ideaId,
    );

    return pubIdea.save();
  }

  // Récupérer toutes les PublicationIdea
  async findAll(): Promise<PublicationIdea[]> {
    return this.publicationIdeaModel
      .find()
      .populate('publication')
      .populate('ideas')
      .exec();
  }

  // Récupérer par ID
  async findOne(id: string): Promise<PublicationIdea> {
    return this.publicationIdeaModel
      .findById(id)
      .populate('publication')
      .populate('ideas')
      .exec();
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.publicationIdeaModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`PublicationIdea with id ${id} not found`);
    return { deleted: true };
  }
}
