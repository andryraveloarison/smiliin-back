import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>; // ✅ _id bien typé

@Schema({ timestamps: true })
export class Device {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  idmac: string;

  @Prop({ required: true })
  navigator: string;

  @Prop({ required: true })
  deviceType: string;

  @Prop({ default: null })
  connected: Date | null;

  @Prop({ default: null })
  disconnected: Date | null;

  @Prop({ default: false })
  access: boolean;

  @Prop({ required: false , default: ""})
  pseudo?: string;

  @Prop({ required: false , default: ""})
  userRole?: string;

  @Prop({ default: true})
  isConnected?: boolean;

}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Virtual id
DeviceSchema.virtual('id').get(function (this: DeviceDocument) {
  return (this._id as Types.ObjectId).toHexString();
});

// JSON clean
DeviceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});
