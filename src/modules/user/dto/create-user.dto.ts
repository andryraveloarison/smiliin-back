import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string; // mot de passe

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsIn(['client', 'admin'])
  role?: string;
}
