// src/descente/descente.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DescenteService } from './descente.service';
import { FileService } from '../../utils/file.service';
import { Descente } from './schema/descente.schema';

@Controller('descentes')
export class DescenteController {
  constructor(
    private readonly descenteService: DescenteService,
    private readonly fileService: FileService,
  ) {}

  // ✅ CREATE avec PDF
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'rapport', maxCount: 1 }]))
  async createDescente(
    @Body() body: Partial<Descente>,
    @UploadedFiles() files?: { rapport?: Express.Multer.File[] },
  ) {
    if (files?.rapport?.length) {
      const file = files.rapport[0];
      const url = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        'descente',
      );
      body.rapportUrl = url;
    }
    return this.descenteService.createDescente(body);
  }

  // ✅ UPDATE avec PDF
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'rapport', maxCount: 1 }]))
  async updateDescente(
    @Param('id') id: string,
    @Body() body: Partial<Descente>,
    @UploadedFiles() files?: { rapport?: Express.Multer.File[] },
  ) {
    if (files?.rapport?.length) {
      const file = files.rapport[0];
      const url = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        'descente',
      );
      body.rapportUrl = url;
    }
    return this.descenteService.updateDescente(id, body);
  }

  // ✅ GET ALL
  @Get()
  async getDescentes() {
    return this.descenteService.getDescentes();
  }

  // ✅ GET by ID
  @Get(':id')
  async getDescenteById(@Param('id') id: string) {
    return this.descenteService.getDescenteById(id);
  }

  // ✅ GET all by user
  @Get('user/:userId')
  async getAllByUser(@Param('userId') userId: string) {
    return this.descenteService.getAllByUser(userId);
  }

  // ✅ GET last months by user (par défaut 5 mois avant/après)
  @Get('user/:userId/last-months/:months?')
  async getByUserLastMonths(
    @Param('userId') userId: string,
    @Param('months') months?: number,
  ) {
    return this.descenteService.getByUserLastMonths(
      userId,
      months ? +months : 5,
    );
  }

  // ✅ GET by year/month by user
  @Get('user/:userId/:year/:month')
  async getByUserAndMonthYear(
    @Param('userId') userId: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.descenteService.getByUserAndMonthYear(userId, +year, +month);
  }
}
