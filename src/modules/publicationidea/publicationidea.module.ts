import { Module } from '@nestjs/common';
import { PublicationIdeaService } from './publicationidea.service';
import { PublicationIdeaController } from './publicationidea.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicationIdea, PublicationIdeaSchema } from './schema/publicationidea.schema';
import { SocketGateway } from '../socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PublicationIdea.name, schema: PublicationIdeaSchema }]),
  ],
  providers: [PublicationIdeaService, SocketGateway],
  controllers: [PublicationIdeaController],
  exports: [PublicationIdeaService],
})
export class PublicationideaModule {}
