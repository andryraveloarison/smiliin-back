// src/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { Audit, AuditSchema } from './schema/audit-log.schema';
import { AuditEmitterService } from './audit-emitter.service';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    SocketModule
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditEmitterService],
  exports: [AuditService, AuditEmitterService],
})
export class AuditModule {} 
