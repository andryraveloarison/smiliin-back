import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InsightService } from './insight.service';
import { CreateInsightDto } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';
import { FileService } from '../../utils/file.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';

//@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightController {
  constructor(
    private readonly insightService: InsightService,
    private readonly fileService: FileService,
  ) {}

  // CREATE (avec upload d'une seule image)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateInsightDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.image = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        'insight',
      );
    }

    console.log("**************")
    console.log(dto)
    console.log("**************")
    return this.insightService.create(dto);
  }

  @Get()
  async findAll() {
    return this.insightService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.insightService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInsightDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.image = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        'insight',
      );
    }

    return this.insightService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.insightService.delete(id);
  }

  // GET BY USER
  @Get('user/:userId')
  async getByUser(@Param('userId') userId: string) {
    return this.insightService.findByUser(userId);
  }
}



