import { IsNotEmpty, IsString } from 'class-validator';
import { DeviceDto } from '../../device/dto/device.dto';

export class LoginDto {
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  device: DeviceDto;
}
