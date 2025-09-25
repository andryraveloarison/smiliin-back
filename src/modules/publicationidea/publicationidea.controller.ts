import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { PublicationIdeaService } from './publicationidea.service';

@Controller('publication-ideas')
export class PublicationIdeaController {
  constructor(private readonly publicationIdeaService: PublicationIdeaService) {}

  // Créer un PublicationIdea pour une publication donnée
  @Post(':publicationId')
  async create(
    @Param('publicationId') publicationId: string,
    @Body('ideaId') ideaId: string,
  ) {
    return this.publicationIdeaService.create(publicationId, ideaId);
  }

  // Ajouter une idée
  @Post('add-idea/:id')
  async addIdea(@Param('id') id: string, @Body('ideaId') ideaId: string) {
    return this.publicationIdeaService.addIdea(id, ideaId);
  }

  // Supprimer une idée
  @Delete(':id/remove-idea/:ideaId')
  async removeIdea(@Param('id') id: string, @Param('ideaId') ideaId: string) {
    return this.publicationIdeaService.removeIdea(id, ideaId);
  }

  // Supprimer une publicationidée
  @Delete(':id')
  async removePublicationIdea(@Param('id') id: string) {
    return this.publicationIdeaService.delete(id);
  }


  // Récupérer tous les PublicationIdea
  @Get()
  async findAll() {
    return this.publicationIdeaService.findAll();
  }

  // Récupérer un PublicationIdea par ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.publicationIdeaService.findOne(id);
  }
}
