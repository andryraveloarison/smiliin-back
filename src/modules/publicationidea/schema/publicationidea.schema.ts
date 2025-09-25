import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PublicationIdea extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Publication', required: true })
  publication: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Idea' }], default: [] })
  ideas: Types.ObjectId[];
}

export const PublicationIdeaSchema = SchemaFactory.createForClass(PublicationIdea);


// JSON clean
PublicationIdeaSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
