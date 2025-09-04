import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  logo: string;

  @Prop({ enum: ['client', 'admin'], default: 'client' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ✅ Déclare le virtual id
UserSchema.virtual('id').get(function (this: UserDocument) {
  return (this._id as Types.ObjectId).toHexString(); // on cast _id
});

// ✅ Nettoyage JSON
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
