import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';

export class CreatePublicationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  lien?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsEnum(['En attente', 'Publié', 'En cours', 'Annulé', 'Terminé'])
  status?: string;
}
