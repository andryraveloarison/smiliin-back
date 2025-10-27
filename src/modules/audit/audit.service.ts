import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Audit, AuditDocument, AuditEntity } from './schema/audit-log.schema';
import { AuditAction } from './audit-emitter.service';


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


    const doc = await this.auditModel.create({
      ...rest,
      userId: new Types.ObjectId(userId),
      idObject: new Types.ObjectId(idObject),
      idmac: idmac,
      receiverIds: receiverIds.map((id) => new Types.ObjectId(id)),
    });


    return doc;
  }

  async getOneById(id: string): Promise<AuditDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid audit ID');
    }

    const audit = await this.auditModel
      .findById(id)
      .exec();

      if (!audit) {
        throw new NotFoundException(`Audit with ID ${id} not found`);
      }


    return audit;
  }
}
