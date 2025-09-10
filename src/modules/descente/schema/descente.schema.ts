// src/descente/schemas/descente.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export type DescenteDocument = Descente & Document;

@Schema({ timestamps: true })
export class Descente {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // qui a créé la descente

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId; // le client concerné

  @Prop({ required: true })
  descenteDate: Date; // date et heure de la descente

  @Prop()
  description?: string; // optionnel

  @Prop()
  rapportUrl?: string; // PDF
}

export const DescenteSchema = SchemaFactory.createForClass(Descente);

// Virtual id
DescenteSchema.virtual('id').get(function (this: DescenteDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
DescenteSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
