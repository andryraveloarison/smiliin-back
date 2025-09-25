// src/publication/schemas/publication.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuditLog } from '../../audit/schema/audit-log.schema';

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

  @Prop({ type: Types.ObjectId, ref: 'PostBudget' })
  postBudgetId: Types.ObjectId;


}



export const PublicationSchema = SchemaFactory.createForClass(Publication);

// Virtual id
PublicationSchema.virtual('id').get(function (this: PublicationDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

PublicationSchema.virtual('postBudget', {
  ref: 'PostBudget',
  localField: '_id',
  foreignField: 'postId',
  justOne: true,
});

PublicationSchema.virtual('publicationIdeas', {
  ref: 'PublicationIdea',
  localField: '_id',
  foreignField: 'publication',
  justOne: true, // ⚡ une publication n’a qu’un seul PublicationIdea
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
