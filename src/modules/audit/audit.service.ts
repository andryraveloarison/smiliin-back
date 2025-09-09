// src/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schema/audit-log.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLog>,
  ) {}

  async log(action: string, entity: string, entityId: string, userId: string, req: any) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip;
    const mac = req.headers['x-mac-address'] || ''; // il faudra que le front l’envoie
    const os = this.extractOS(userAgent);

    await this.auditModel.create({
      action,
      entity,
      entityId,
      user: userId,
      ip,
      mac,
      userAgent,
      os,
    });
  }

  private extractOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os/i.test(userAgent)) return 'MacOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  // src/audit/audit.service.ts
async findByEntity(entity: string, entityId: string) {
    return this.auditModel
      .find({ entity, entityId })
      .populate('user', 'email') // récupère l’email du user
      .sort({ createdAt: -1 })   // plus récents d’abord
      .exec();
  }
  
  async findByUser(userId: string) {
    return this.auditModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
