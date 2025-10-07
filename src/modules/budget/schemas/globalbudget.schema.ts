import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GlobalBudgetDocument = GlobalBudget & Document;

@Schema()
export class GlobalBudget {
  @Prop({ type: Types.ObjectId, required: true })
  pageId: Types.ObjectId;

  @Prop({ required: true })
  budget: number;

  @Prop({ required: true })
  month: string;
}

export const GlobalBudgetSchema = SchemaFactory.createForClass(GlobalBudget);

// Virtual id
GlobalBudgetSchema.virtual('id').get(function (this: GlobalBudgetDocument) {
  return (this._id as Types.ObjectId).toHexString();
});


// JSON clean
GlobalBudgetSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
