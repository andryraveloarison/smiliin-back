import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { DeviceDto } from '../../device/dto/device.dto';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  device: DeviceDto;
}
