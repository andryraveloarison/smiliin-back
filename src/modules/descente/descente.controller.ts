// src/descente/descente.controller.ts
import { Controller, Get, Post, Put, Body, Param, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { DescenteService } from './descente.service';
import { FileService } from '../../utils/file.service';
import { Descente } from './schema/descente.schema';

//@UseGuards(JwtAuthGuard)
@Controller('descentes')
export class DescenteController {
  constructor(
    private readonly descenteService: DescenteService,
    private readonly fileService: FileService,
  ) {}

  // CREATE avec PDF
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'rapport', maxCount: 1 }]))
  async createDescente(
    @Body() body: Partial<Descente>,
    @UploadedFiles() files?: { rapport?: Express.Multer.File[] },
  ) {
    if (files?.rapport?.length) {
      const file = files.rapport[0];
      const url = await this.fileService.uploadFile(file.buffer, file.originalname, 'descente');
      body.rapportUrl = url;
    }
    return this.descenteService.createDescente(body);
  }

  // UPDATE avec PDF
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'rapport', maxCount: 1 }]))
  async updateDescente(
    @Param('id') id: string,
    @Body() body: Partial<Descente>,
    @UploadedFiles() files?: { rapport?: Express.Multer.File[] },
  ) {
    if (files?.rapport?.length) {
      const file = files.rapport[0];
      const url = await this.fileService.uploadFile(file.buffer, file.originalname, 'descente');
      body.rapportUrl = url;
    }
    return this.descenteService.updateDescente(id, body);
  }

  @Get()
  async getDescentes() {
    return this.descenteService.getDescentes();
  }

  @Get(':id')
  async getDescenteById(@Param('id') id: string) {
    return this.descenteService.getDescenteById(id);
  }
}
