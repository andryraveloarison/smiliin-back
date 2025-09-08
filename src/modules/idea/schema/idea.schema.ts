// src/ideas/schemas/idea.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IdeaDocument = Idea & Document;

@Schema({ timestamps: true })
export class Idea {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ enum: ['post', 'storie', 'couverture'], required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;
}

export const IdeaSchema = SchemaFactory.createForClass(Idea);

// Virtual id
IdeaSchema.virtual('id').get(function (this: IdeaDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
IdeaSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
