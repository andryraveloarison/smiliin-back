import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from './schemas/device.schema';

@Injectable()
export class DeviceService {
    constructor(
        @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    ) {}

    async findByIdMacAndUserId(idmac: string, userId: string): Promise<DeviceDocument | null> {
        const rep = await this.deviceModel.findOne({
        idmac,
        userId: new Types.ObjectId(userId),
        }).exec();

        return rep
    }

    async createDevice(userId: string, deviceData: Partial<Device>): Promise<Device> {
        // Vérifier si l'utilisateur a déjà des appareils
        const existingDevices = await this.deviceModel.findOne({
        userId: new Types.ObjectId(userId),
        }).exec();

        // Si c'est le premier appareil, access = true, sinon false
        const access = !existingDevices;

        const device = new this.deviceModel({
        ...deviceData,
        userId: new Types.ObjectId(userId),
        access,
        connected: new Date(),
        });

        return device.save();
    }

    async updateDevice(deviceId: string, updateData: Partial<Device>): Promise<Device | null> {
        // Vérifie que l’ID est bien valide
        if (!Types.ObjectId.isValid(deviceId)) {
            throw new BadRequestException('ID de device invalide');
        }

        // Mise à jour partielle du document
        const updatedDevice = await this.deviceModel.findByIdAndUpdate(
            deviceId,
            { $set: updateData },
            { new: true } // retourne le document mis à jour
        );

        if (!updatedDevice) {
            throw new NotFoundException('Device non trouvé');
        }

        return updatedDevice;
    }


    async updateConnectionStatus(deviceId: string, isConnected: boolean): Promise<Device> {
        const update = isConnected
        ? { connected: new Date() }
        : { disconnected: new Date() };

        return this.deviceModel.findByIdAndUpdate(
            deviceId,
            update,
            { new: true }
            ).exec();
    }

    async updateAccess(deviceId: string, access: boolean): Promise<Device> {
        return this.deviceModel.findByIdAndUpdate(
        deviceId,
        { access },
        { new: true }
        ).exec();
    }

    async getAllDevices(userId: string): Promise<Device[]> {
        return this.deviceModel.find({
        userId: new Types.ObjectId(userId),
        }).exec();
    }

    async getAllByUserId(userId: string): Promise<DeviceDocument[]> {
        if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid userID');
        }
        return this.deviceModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 }) // tri du plus récent au plus ancien
        .exec();
    }

    async getOneById(deviceId: string) {
        if (!Types.ObjectId.isValid(deviceId)) {
            throw new BadRequestException('Invalid deviceId');
        }
        const device = await this.deviceModel.findById(deviceId).exec();
        if (!device) throw new NotFoundException('Device not found');
        return device;
    }

    async deleteDevice(deviceId: string): Promise<{ deleted: boolean; id: string }> {
        if (!Types.ObjectId.isValid(deviceId)) {
        throw new BadRequestException('Invalid deviceId');
        }

        const deletedDevice = await this.deviceModel.findByIdAndDelete(deviceId).exec();
        if (!deletedDevice) {
        throw new NotFoundException('Device not found');
        }

        return { deleted: true, id: deletedDevice.id };
    }
}