import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InsightDocument = Insight & Document;

@Schema({ timestamps: true })
export class Insight {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop()
  link: string;

  @Prop({ enum: ['strategie', 'analyse'],  default: 'analyse', required: true })
  type: 'strategie' | 'analyse';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  image: string;
}

export const InsightSchema = SchemaFactory.createForClass(Insight);

// Virtual id
InsightSchema.virtual('id').get(function (this: InsightDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
InsightSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
