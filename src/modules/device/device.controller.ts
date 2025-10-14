import { Controller, Get, Post, Put, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { DeviceService } from './device.service';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { Request } from 'express';

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
}