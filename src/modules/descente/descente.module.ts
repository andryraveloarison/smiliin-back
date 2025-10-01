// src/descente/descente.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Descente, DescenteSchema } from './schema/descente.schema';
import { DescenteService } from './descente.service';
import { DescenteController } from './descente.controller';
import { FileService } from '../../utils/file.service';
import { SocketGateway } from '../socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Descente.name, schema: DescenteSchema }]),
  ],
  controllers: [DescenteController],
  providers: [DescenteService, FileService, SocketGateway],
})
export class DescenteModule {}
