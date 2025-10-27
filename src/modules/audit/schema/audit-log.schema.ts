import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuditAction } from '../audit-emitter.service';

export type AuditDocument = HydratedDocument<Audit>;

export const AUDIT_ENTITIES = [
  'Publication',
  'Device',
  'Idea',
  'User',
  'Auth'
] as const;
export type AuditEntity = typeof AUDIT_ENTITIES[number];

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class Audit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  action: AuditAction;

  // 🔹 Nouvelle propriété : l’entité concernée
  @Prop({ type: String, enum: AUDIT_ENTITIES, required: true })
  entity: AuditEntity;

  // 🔹 L’ID de l’objet dans la collection cible
  @Prop({ type: Types.ObjectId, required: true })
  idObject: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  receiverIds?: Types.ObjectId[];

  @Prop()
  notification?: string;

  @Prop({ type: Types.ObjectId, ref: 'Device', required: true })
  idmac: Types.ObjectId;

  @Prop({ type: Object })
  modif?: Record<string, { before: any; after: any }>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

// Virtual id
AuditSchema.virtual('id').get(function (this: AuditDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
AuditSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => { delete ret._id; },
});

// 🔎 Index pour accélérer les requêtes par (entity, idObject) et tri récent d’abord
AuditSchema.index({ entity: 1, idObject: 1, createdAt: -1 });
