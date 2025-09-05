import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  // ✅ Date à laquelle la publication doit être publiée
  @Prop()
  publishDate?: Date; 
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);

// Virtual id
PublicationSchema.virtual('id').get(function (this: PublicationDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
PublicationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
