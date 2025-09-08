// src/categories/dto/create-category.dto.ts
import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  readonly name: string;
}

