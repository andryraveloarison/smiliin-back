// src/ideas/idea.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UploadedFiles,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileFieldsInterceptor } from '@nestjs/platform-express';
  import { IdeaService } from './idea.service';
  import { Idea } from './schema/idea.schema';
  import { FileService } from '../../utils/file.service';
  
  @Controller('ideas')
  export class IdeaController {
    constructor(
      private readonly ideaService: IdeaService,
      private readonly fileService: FileService,
    ) {}
  
    // CREATE (upload une ou plusieurs images)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
    async create(
      @Body() data: Partial<Idea>,
      @UploadedFiles() files?: { images?: Express.Multer.File[] },
    ) {
      if (files?.images) {
        const urls: string[] = [];
        for (const file of files.images) {
          const url = await this.fileService.uploadFile(
            file.buffer,
            file.originalname,
            'idea',
          );
          urls.push(url);
        }
        data.images = urls;
      }
      return this.ideaService.create(data);
    }
  
    // READ all
    @Get()
    async findAll() {
      return this.ideaService.findAll();
    }
  
    // READ one
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.ideaService.findOne(id);
    }
  
    // UPDATE (upload une ou plusieurs images)
    @Put(':id')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
    async update(
      @Param('id') id: string,
      @Body() data: Partial<Idea>,
      @UploadedFiles() files?: { images?: Express.Multer.File[] },
    ) {
      if (files?.images) {
        const urls: string[] = [];
        for (const file of files.images) {
          const url = await this.fileService.uploadFile(
            file.buffer,
            file.originalname,
            'idea',
          );
          urls.push(url);
        }
        data.images = urls;
      }
      return this.ideaService.update(id, data);
    }
  
    // DELETE
    @Delete(':id')
    async remove(@Param('id') id: string) {
      return this.ideaService.remove(id);
    }
  }
  