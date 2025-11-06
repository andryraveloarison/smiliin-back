import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idea, IdeaDocument } from './schema/idea.schema';
import { AuditEmitterService } from '../audit/audit-emitter.service';
  import { FileService } from '../../utils/file.service';

@Injectable()
export class IdeaService {
  constructor(
    @InjectModel(Idea.name) private ideaModel: Model<IdeaDocument>,
    private readonly auditEmitter: AuditEmitterService,
    private readonly fileService: FileService,
  
  ) {}

  async create(data: Partial<Idea>, createdBy: any): Promise<Idea> {
    const idea = new this.ideaModel(data);
    const ideaSaved = await idea.save()

    const ideaReturn = await this.ideaModel
    .findById(ideaSaved.id)
    .populate('category')
    .populate('userId', 'id name logo email')
    .exec();

    await this.auditEmitter.createAndNotify({
      userId: data.userId.toString(),
      entity: 'Idea',
      idObject: ideaReturn._id.toString(),
      deviceId: createdBy.deviceId,
      receiverIds: [data.userId.toString(), "0"],
      message: ``,
      action: 'CREATE',
    })
    
    return ideaReturn;
  }

  async findAll(): Promise<Idea[]> {
    return this.ideaModel
      .find()
      .populate('category')
      .populate('userId', 'id name logo email') // on renvoie seulement certains champs
      .exec();
  }

  async findOne(id: string): Promise<Idea> {
    const idea = await this.ideaModel
      .findById(id)
      .populate('category')
      .populate('userId', 'id name logo email')
      .exec();

    if (!idea) throw new NotFoundException('Idea not found');
    return idea;
  }

  async update(id: string, data: any, updatedBy: any): Promise<Idea> {

    // 1) récupérer l'ancien document
    const before = await this.ideaModel.findById(id).lean().exec();
    if (!before) throw new NotFoundException(`Idea with id ${id} not found`);

    const updated = await this.ideaModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('category')
      .populate('userId', 'id name logo email')
      .exec();

    if (!updated) throw new NotFoundException('Idea not found');

    const modifAfter: Record<string, any> = {};
    const dtoKeys = Object.keys(data ?? {});

    for (const key of dtoKeys) {
      const beforeVal = (before as any)[key];
      const afterVal = (updated as any)[key];

      const changed = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);
      if (changed) {
        modifAfter[key] = afterVal;
      }
    }

      await this.auditEmitter.createAndNotify({
        userId: updated.userId.toString(),
        entity: 'Idea',
        idObject: id,
        deviceId: updatedBy.deviceId,
        receiverIds: [updated.userId.toString(), "0"],
        message: ``,
        action: 'UPDATE',
        modif: modifAfter, 
      });


    return updated;
  }

  async remove(id: string, deletedBy: any): Promise<{deleted: boolean, id: string}> {

    const result = await this.ideaModel.findById(id).exec();
    if (!result) throw new NotFoundException('Idea not found');

      // 🔹 Supprimer le fichier associé si existe
    if (result.images) { // ou result.imageUrl selon ton schema
      console.log(result.images)
      for(const imageUrl of result.images) {
        await this.fileService.deleteFile(imageUrl);
      }
    }

      // 🔹 Audit log
    await this.auditEmitter.createAndNotify({
      userId: result.userId.toString(),
      entity: 'Idea',
      idObject: id,
      deviceId: deletedBy.deviceId,
      receiverIds: [result.userId.toString(), '0'],
      message: ``,
      action: 'DELETE',
    });


    await this.ideaModel.findByIdAndDelete(id).exec();


    return { deleted: true , id};

  }


}
