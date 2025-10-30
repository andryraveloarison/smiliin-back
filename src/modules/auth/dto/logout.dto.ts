import { IsNotEmpty, IsString } from 'class-validator';
import { DeviceDto } from '../../device/dto/device.dto';

export class LogoutDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  device: DeviceDto;
}
