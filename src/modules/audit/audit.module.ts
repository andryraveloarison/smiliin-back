// src/audit/audit.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { Audit, AuditSchema } from './schema/audit-log.schema';
import { AuditEmitterService } from './audit-emitter.service';
import { SocketModule } from '../socket/socket.module';
import { DeviceModule } from '../device/device.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    SocketModule,
    DeviceModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditEmitterService, JwtAuthGuard],
  exports: [AuditService, AuditEmitterService],
})
export class AuditModule {} 
