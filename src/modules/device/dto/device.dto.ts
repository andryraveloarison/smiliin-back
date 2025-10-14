import { IsNotEmpty, IsString } from 'class-validator';

export class DeviceDto {
  @IsString()
  @IsNotEmpty()
  idmac: string;

  @IsString()
  @IsNotEmpty()
  navigator: string;

  @IsString()
  @IsNotEmpty()
  deviceType: string;
}