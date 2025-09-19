import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class adsDto {
  @IsNotEmpty()
  @IsString()
  entreprise: string;

  @IsOptional()
  @IsString()
  previousIdea?: string;
}
