// src/audit/schemas/audit-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true })
  action: string; // ex: "update", "delete", "create"

  @Prop({ required: true })
  entity: string; // ex: "Idea", "Category"

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // qui a fait l’action

  @Prop()
  entityId: string; // l’ID de la ressource affectée

  @Prop()
  ip: string;

  @Prop()
  mac: string;

  @Prop()
  userAgent: string;

  @Prop()
  os: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Virtual id
AuditLogSchema.virtual('id').get(function (this: AuditLogDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean : inclut le virtual id et supprime _id
AuditLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
