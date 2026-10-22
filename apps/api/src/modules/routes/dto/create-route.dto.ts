import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { Difficulty, RouteType } from 'src/prisma/generated/client';

export class CreateRouteDto {
  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'ID route draft, з якого фіналізується маршрут',
  })
  draftId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Назва маршруту' })
  title!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Опис маршруту', required: false })
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

  @IsEnum(RouteType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Тип маршруту',
    enum: RouteType,
  })
  routeType?: RouteType;
}
