import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


export type PostBudgetDocument = PostBudget & Document;

@Schema({ timestamps: true })
export class PostBudget {
  @Prop({ type: Types.ObjectId, ref: 'Publication', required: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  pageId: Types.ObjectId; // rattacher aussi au page

  @Prop({ required: true })
  objectif: string;

  @Prop({ required: true })
  budget: number; // ex: 6.05

  @Prop({ required: true })
  depense: number; // ex: 6.05

  @Prop({ required: true })
  isBoosted: boolean;

  @Prop()
  boostPrice?: number; // ex: 0.5

  @Prop({ required: true })
  month: string; // ex: "septembre 2025"

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
}

export const PostBudgetSchema = SchemaFactory.createForClass(PostBudget);

// Virtual id
PostBudgetSchema.virtual('id').get(function (this: PostBudgetDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
PostBudgetSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
