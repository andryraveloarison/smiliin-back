import { Injectable } from '@nestjs/common';
import { AuditService } from './audit.service';
import { SocketGateway } from '../socket/socket.gateway';
import { AuditEntity } from './schema/audit-log.schema';
import { Types } from 'mongoose';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

@Injectable()
export class AuditEmitterService {
  constructor(
    private readonly auditService: AuditService,
    private readonly socketGateway: SocketGateway,
  ) {}

  /**
   * Crée un audit et envoie un socket de notification simplifié
   */
  async createAndNotify(options: {
    userId: string;
    entity: AuditEntity;
    idObject: string;
    idmac: string;
    action?: AuditAction;
    receiverIds: string[];
    message: string;
    modif?: Record<string, { before: any; after: any }>;
  }) {
    const {
      userId,
      entity,
      idObject,
      idmac,
      receiverIds,
      message,
      modif,
      action,
    } = options;

    // 1️⃣ Créer l’audit
    const audit = await this.auditService.createAudit({
      userId,
      action,
      entity,
      idObject,
      idmac,
      receiverIds,
      notification: message,
      modif,
    });

    console.log('Audit created with ID:', (audit as any)?.id || audit?._id?.toString());

    // 2️⃣ Émettre la notification socket minimale
    this.socketGateway.emitAudit('audit', {
      receiverIds,
      auditId: (audit as any)?.id || audit?._id?.toString(),
      message,
    });

    return audit;
  }
}
