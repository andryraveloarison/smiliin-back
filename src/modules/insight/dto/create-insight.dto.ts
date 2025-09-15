import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class CreateInsightDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  link?: string;

  @IsEnum(['strategie', 'analyse'])
  type: 'strategie' | 'analyse';

  @IsString()
  userId: string; 

  @IsOptional()
  @IsString()
  image?: string;
} 
