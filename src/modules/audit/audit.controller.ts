// src/audit/audit.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // Voir l’historique d’une publication (Idea)
  @Get('post/:id')
  async getPostHistory(@Param('id') id: string) {
    return this.auditService.findByEntity('publications', id);
  }


  // Voir l’historique d’une publication (Idea)
  @Get('idea/:id')
  async getIdeaHistory(@Param('id') id: string) {
    return this.auditService.findByEntity('ideas', id);
  }

  // Voir toutes les actions d’un utilisateur
  @Get('user/:id')
  async getUserHistory(@Param('id') id: string) {
    return this.auditService.findByUser(id);
  }
}
