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
    UseGuards,
    Req,
  } from '@nestjs/common';
  import { FileFieldsInterceptor } from '@nestjs/platform-express';
  import { PublicationService } from './publication.service';
  import { CreatePublicationDto } from './dto/create-publication.dto';
  import { UpdatePublicationDto } from './dto/update-publication.dto';
  import { FileService } from '../../utils/file.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { JwtPayload } from 'jsonwebtoken';

  @UseGuards(JwtAuthGuard) // ✅ Protection par token

  @Controller('publications')
  export class PublicationController {
    constructor(
      private readonly pubService: PublicationService,
      private readonly fileService: FileService,
    ) {}
  
    // CREATE (avec upload multiple images)
    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
    async create(
      @Body() dto: CreatePublicationDto,
      @Req() req: Request & { user: JwtPayload },
      @UploadedFiles() files?: { images?: Express.Multer.File[] },

    ) {
      if (files?.images) {
        const urls: string[] = [];
        for (const file of files.images) {
          const url = await this.fileService.uploadFile(
            file.buffer,
            file.originalname,
            'post',
          );
          urls.push(url);
        }
        dto.images = urls;
      }


      return this.pubService.create(dto,req.user.id);
    }
  
    @Get()
    async findAll() {
      return this.pubService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.pubService.findOne(id);
    }
  
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
    async update(
      @Param('id') id: string,
      @Body() dto: UpdatePublicationDto,
      @UploadedFiles() files: { images?: Express.Multer.File[] } | undefined, // ⚡️ plus de "?"
      @Req() req: Request & { user: JwtPayload },
    ) {
      if (files?.images) {
        const urls: string[] = [];
        for (const file of files.images) {
          const url = await this.fileService.uploadFile(file.buffer, file.originalname, 'post');
          urls.push(url);
        }
        dto.images = urls;
      }

      return this.pubService.update(id, dto, req.user.id);
    }
    
  
    @Delete(':id')
    async remove(
      @Param('id') id: string,       
      @Req() req: Request & { user: JwtPayload },
  ) {
      return this.pubService.delete(id, req.user.id);
    }


    @Get('user/:userId/monthly')
    async getByUserMonthly(@Param('userId') userId: string) {
      const publications = await this.pubService.findByUserMonthly(userId);
      return {publications};
    }

    @Get('user/:id/month/:year/:month')
    async getByUserAndMonth(
      @Param('id') userId: string,
      @Param('year') year: number,
      @Param('month') month: number,
    ) {
      const publications = await this.pubService.findByUserAndMonth(userId, +year, +month);
      return {publications };
    }

  }
  