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
  
    // Vérifie si un PublicationIdea existe déjà pour cette publication
    let pubIdea = await this.publicationIdeaModel.findOne({ publication: new Types.ObjectId(publicationId)  });
  
    if (pubIdea) {
      // Si l'idée n'existe pas déjà dans le tableau, on l'ajoute
      if (!pubIdea.ideas.includes(new Types.ObjectId(ideaId))) {
        pubIdea.ideas.push(new Types.ObjectId(ideaId));
      }
    } else {
      // Sinon, on crée un nouveau document
      pubIdea = new this.publicationIdeaModel({
        publication: new Types.ObjectId(publicationId),
        ideas: [new Types.ObjectId(ideaId)],
      });
    }
  
    return pubIdea.save();
  }


  // Ajouter une idée en utilisant publicationId
  async addIdea(publicationId: string, ideaId: string): Promise<PublicationIdea> {

    
    // Récupère le PublicationIdea lié à la publication
    const pubIdea = await this.publicationIdeaModel.findOne({ publication: new Types.ObjectId(publicationId)  });

    if (!pubIdea) throw new NotFoundException('PublicationIdea not found for this publication');

    // Ajoute l'idée si elle n'est pas déjà dans le tableau
    if (!pubIdea.ideas.includes(new Types.ObjectId(ideaId))) {
      pubIdea.ideas.push(new Types.ObjectId(ideaId));
    }

    return pubIdea.save();
  }

  // Supprimer une idée en utilisant publicationId
  async removeIdea(publicationId: string, ideaId: string): Promise<PublicationIdea> {
    const pubIdea = await this.publicationIdeaModel.findOne({ publication: new Types.ObjectId(publicationId) });
    if (!pubIdea) throw new NotFoundException('PublicationIdea not found for this publication');

    // Filtrer le tableau pour enlever l'idée
    pubIdea.ideas = pubIdea.ideas.filter(id => id.toString() !== ideaId);

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
