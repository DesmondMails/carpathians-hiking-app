import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import {
  Difficulty,
  RouteStatus,
  RouteType,
} from 'src/prisma/generated/client';

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Назва маршруту' })
  title?: string;

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

  @IsEnum(RouteType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Тип маршруту',
    enum: RouteType,
  })
  routeType?: RouteType;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Нотатки до маршруту' })
  notes?: string;

  @IsEnum(RouteStatus)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Статус маршруту',
    enum: RouteStatus,
  })
  status?: RouteStatus;
}
