import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Audit, AuditDocument, AuditEntity } from './schema/audit-log.schema';
import { AuditAction } from './audit-emitter.service';
import { Device } from '../device/schemas/device.schema';
import { DeviceService } from '../device/device.service';


@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private readonly auditModel: Model<AuditDocument>,
       private readonly deviceService: DeviceService,
    
  ) {}

 async listByEntityAndObject(entity: AuditEntity, idObject: string) {
    if (!Types.ObjectId.isValid(idObject)) {
      throw new BadRequestException('Invalid idObject');
    }

    // 🔍 On utilise aggregation pour joindre avec la collection devices
    const audits = await this.auditModel.aggregate([
      {
        $match: {
          entity,
          idObject: new Types.ObjectId(idObject),
        },
      },
      {
        $lookup: {
          from: 'devices', // nom de la collection MongoDB
          localField: 'idmac', // champ dans Audit
          foreignField: 'idmac', // champ dans Device
          as: 'deviceInfo',
        },
      },
      { $unwind: { path: '$deviceInfo', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          pseudo: '$deviceInfo.pseudo',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          deviceInfo: 0, // on masque l’objet complet
        },
      },
    ]);

    return audits;
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
      receiverIds,
    });


    return doc;
  }

  async getOneById(id: string): Promise<AuditDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid audit ID');
    }

    try {
      const audit = await this.auditModel
    .findById(id)
    .populate({ path: 'idObject' }) // ⭐ auto en fonction de "entity" via refPath
    .exec();      
    
    if (!audit) {
        throw new NotFoundException(`Audit with ID ${id} not found`);
      }
    return audit;
    }catch (error) {
      throw new NotFoundException(error.message);
    }
    
  }
}
