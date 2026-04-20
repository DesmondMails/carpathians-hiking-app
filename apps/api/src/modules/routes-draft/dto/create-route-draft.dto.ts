import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import type { Prisma } from 'src/prisma/generated/client';

export class CreateRouteDraftDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Оригінальна назва GPX-файлу' })
  sourceFileName!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Ключ файлу у зовнішньому сховищі' })
  gpxStorageKey?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Попередньо визначена назва маршруту' })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Попередньо визначений опис маршруту' })
  description?: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Результат парсингу GPX для preview screen',
    additionalProperties: true,
  })
  previewJson?: Prisma.InputJsonValue;

  @IsDateString()
  @ApiProperty({
    description: 'Дата, після якої draft вважається простроченим',
  })
  expiresAt!: string;
}
