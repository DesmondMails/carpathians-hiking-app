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
  @ApiPropertyOptional({ description: 'URL зображень маршруту' })
  imageUrls?: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'URL зображення покриття маршруту' })
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Нотатки до маршруту' })
  notes?: string;
}
