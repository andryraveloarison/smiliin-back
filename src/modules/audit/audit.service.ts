import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Audit, AuditDocument, AuditEntity } from './schema/audit-log.schema';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private readonly auditModel: Model<AuditDocument>,
  ) {}

  async listByEntityAndObject(entity: AuditEntity, idObject: string) {
    if (!Types.ObjectId.isValid(idObject)) {
      throw new BadRequestException('Invalid idObject');
    }

    return this.auditModel
      .find({ entity, idObject: new Types.ObjectId(idObject) })
      .sort({ createdAt: -1 })
      .populate({
        path: 'idmac',        
        select: 'id idmac deviceType navigator access connected disconnected',
      })

      .lean({ virtuals: true })  
      .exec();
  }

  async createAudit(input: {
    userId: string;
    action: AuditAction;
    entity: AuditEntity;
    idObject: string;
    idmac: string;
    modif?: Record<string, { before: any; after: any }>;
    receiverIds?: string[];
    notification?: string;
  }) {
    const { userId, idObject, idmac, receiverIds = [], ...rest } = input;

    const toCheck = [userId, idObject, idmac, ...receiverIds];
    if (toCheck.some((v) => !Types.ObjectId.isValid(v))) {
      throw new BadRequestException('Invalid ObjectId in payload');
    }

    const doc = await this.auditModel.create({
      ...rest,
      userId: new Types.ObjectId(userId),
      idObject: new Types.ObjectId(idObject),
      idmac: new Types.ObjectId(idmac),
      receiverIds: receiverIds.map((id) => new Types.ObjectId(id)),
    });

    const populated = await this.auditModel
      .findById(doc._id)
      .populate({
        path: 'idmac',
        select: 'id idmac deviceType navigator access connected disconnected',
      })
      .lean({ virtuals: true })
      .exec();

    return populated;
  }
}
