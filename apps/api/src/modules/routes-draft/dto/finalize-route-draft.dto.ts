import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { Difficulty } from 'src/prisma/generated/client';

export class FinalizeRouteDraftDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Назва маршруту' })
  title!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Опис маршруту' })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Регіон маршруту' })
  region?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Рівень складності маршруту',
    enum: Difficulty,
  })
  difficulty?: Difficulty;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Ключі зображень маршруту' })
  imageIds?: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Ключ зображення покриття маршруту' })
  coverImageId?: string;
}
