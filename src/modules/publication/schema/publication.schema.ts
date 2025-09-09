// src/publication/schemas/publication.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuditLog } from '../../audit/schema/audit-log.schema';
import { User } from '../../user/schema/user.schema';

export type PublicationDocument = Publication & Document;

@Schema({ timestamps: true })
export class Publication {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  lien?: string;

  @Prop({ type: [String], default: [] }) // plusieurs images possibles
  images?: string[];

  @Prop({
    enum: ['En attente', 'Publié', 'En cours', 'Annulé', 'Terminé'],
    default: 'En attente',
  })
  status: string;

  @Prop()
  publishDate?: Date;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);

// Virtual id
PublicationSchema.virtual('id').get(function (this: PublicationDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// Virtual lastModified
PublicationSchema.virtual('lastModified', {
  ref: 'AuditLog',
  localField: '_id',
  foreignField: 'entityId',
  justOne: true,
  options: { sort: { createdAt: -1 } }, // prend la dernière modification
});

// JSON clean
PublicationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
