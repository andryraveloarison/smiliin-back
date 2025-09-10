// src/meeting/schemas/meeting.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export type MeetingDocument = Meeting & Document;

@Schema({ timestamps: true })
export class Meeting {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // qui a créé le meeting

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId; // le client est un user

  @Prop({ required: true })
  meetingDate: Date; // date et heure du meeting

  @Prop()
  description?: string; // optionnel
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);

// Virtual id
MeetingSchema.virtual('id').get(function (this: MeetingDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
MeetingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
