import { Module } from '@nestjs/common';
import { PublicationIdeaService } from './publicationidea.service';
import { PublicationIdeaController } from './publicationidea.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicationIdea, PublicationIdeaSchema } from './schema/publicationidea.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PublicationIdea.name, schema: PublicationIdeaSchema }]),
  ],
  providers: [PublicationIdeaService],
  controllers: [PublicationIdeaController],
  exports: [PublicationIdeaService],
})
export class PublicationideaModule {}
