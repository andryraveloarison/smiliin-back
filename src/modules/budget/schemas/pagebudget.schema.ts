import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PageBudgetDocument = PageBudget & Document;

@Schema({ timestamps: true })
export class PageBudget {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  pageId: Types.ObjectId;

  @Prop({ required: true })
  objectif: string;

  @Prop({ required: true })
  budget: number; // ex: 6.05

  @Prop({ required: true })
  depense: number; // ex: 6.05

  @Prop({ required: true })
  month: string; // ex: "septembre 2025"

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
}

export const PageBudgetSchema = SchemaFactory.createForClass(PageBudget);

// Virtual id
PageBudgetSchema.virtual('id').get(function (this: PageBudgetDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
PageBudgetSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
