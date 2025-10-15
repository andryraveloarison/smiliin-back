import { Controller, Get, Post, Put, Body, Param, UseGuards, Req, Delete, Patch, BadRequestException } from '@nestjs/common';
import { DeviceService } from './device.service';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { Request } from 'express';
import { Device } from './schemas/device.schema';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) {}

    @Get()
        async getUserDevices(@Req() request: Request) {
            return this.deviceService.getAllDevices((request.user as any).id);
    }

    @Get(':id')
        async getOne(@Param('id') deviceId: string) {
            return this.deviceService.getOneById(deviceId);
    }

    @Delete(':id')
        async delete(@Param('id') deviceId: string) {
            return this.deviceService.deleteDevice(deviceId);
    }

    @Get('getAllByUserId/:id')
        async getAllByUserId(@Param('id') userId: string) {
            return this.deviceService.getAllByUserId(userId);
    }

    
    @Put(':id/access')
        async updateDeviceAccess(
            @Param('id') deviceId: string,
            @Body('access') access: boolean,
        ) {
            return this.deviceService.updateAccess(deviceId, access);
    }


  // ✅ Nouvelle route: mise à jour partielle d’un device (ex: { pseudo: 'Nouveau' })
  @Patch(':id')
    async updateDevice(
        @Param('id') deviceId: string,
        @Body() updateData: Partial<Device>, // idéalement: UpdateDeviceDto
    ) {
        if (!updateData || typeof updateData !== 'object') {
        throw new BadRequestException('Corps de requête invalide');
        }
        return this.deviceService.updateDevice(deviceId, updateData);
    } 
}