import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publication, PublicationSchema } from './schema/publication.schema';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { FileService } from '../../utils/file.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publication.name, schema: PublicationSchema }]),
    AuthModule
  ],
  providers: [PublicationService, FileService],
  controllers: [PublicationController],
})
export class PublicationModule {}
