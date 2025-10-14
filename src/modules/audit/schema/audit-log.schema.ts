import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditDocument = HydratedDocument<Audit>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class Audit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'READ'], required: true })
  action: string;

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

// JSON clean : inclut le virtual id et supprime _id
AuditSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
