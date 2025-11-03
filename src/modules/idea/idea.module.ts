// src/ideas/idea.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Idea, IdeaSchema } from './schema/idea.schema';
import { IdeaService } from './idea.service';
import { IdeaController } from './idea.controller';
import { FileService } from 'src/utils/file.service';
import { AuthModule } from '../auth/auth.module';
import { SocketGateway } from '../socket/socket.gateway';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Idea.name, schema: IdeaSchema }]), 
    AuthModule,
    AuditModule
  ],
  providers: [IdeaService, FileService, SocketGateway],
  controllers: [IdeaController],
})
export class IdeaModule {}
