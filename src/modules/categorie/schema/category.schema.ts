// src/categories/schemas/category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Virtual id
CategorySchema.virtual('id').get(function (this: CategoryDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // supprime __v
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
