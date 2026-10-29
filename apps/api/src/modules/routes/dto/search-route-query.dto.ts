import { Difficulty, DIFFICULTY_VALUES } from '@hiking/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsIn,
  IsNumber,
  IsPositive,
  Min,
  IsLatitude,
  IsLongitude,
  ValidateIf,
  Max,
  IsInt,
  IsString,
} from 'class-validator';

const hasGeoParam = (o: SearchRouteQueryDto): boolean =>
  o.latitude != null || o.longitude != null || o.radiusM != null;

export class SearchRouteQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsInt()
  @ApiPropertyOptional({
    description: 'Кількість маршрутів на сторінці',
    minimum: 1,
    maximum: 50,
    default: 15,
  })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsInt()
  @ApiPropertyOptional({
    description: 'Кількість маршрутів, які потрібно пропустити',
    minimum: 0,
    default: 0,
  })
  offset?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): string[] =>
    Array.isArray(value) ? (value as string[]) : String(value).split(','),
  )
  @IsIn(DIFFICULTY_VALUES, { each: true })
  @ApiPropertyOptional({
    description:
      'Рівні складності. Можна передати кілька параметрів або через кому: EASY,HARD',
    enum: DIFFICULTY_VALUES,
    isArray: true,
  })
  difficulty?: Difficulty[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({
    description: 'Мінімальна довжина маршруту в метрах',
    minimum: 0,
  })
  distanceFromM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @ApiPropertyOptional({
    description: 'Максимальна довжина маршруту в метрах',
    exclusiveMinimum: true,
    minimum: 0,
  })
  distanceToM?: number;

  @Type(() => Number)
  @ValidateIf(hasGeoParam)
  @IsLatitude()
  @ApiPropertyOptional({
    description:
      'Широта користувача. Передається разом з longitude і radiusM для пошуку поруч',
    minimum: -90,
    maximum: 90,
  })
  latitude?: number;

  @Type(() => Number)
  @ValidateIf(hasGeoParam)
  @IsLongitude()
  @ApiPropertyOptional({
    description:
      'Довгота користувача. Передається разом з latitude і radiusM для пошуку поруч',
    minimum: -180,
    maximum: 180,
  })
  longitude?: number;

  @ValidateIf(hasGeoParam)
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @ApiPropertyOptional({
    description:
      'Радіус пошуку від початку маршруту в метрах. Передається разом з latitude і longitude',
    exclusiveMinimum: true,
    minimum: 0,
  })
  radiusM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({
    description: 'Набір висоти в метрах',
    minimum: 0,
  })
  maxElevationGainM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({
    description: 'Тривалість маршруту в годинах',
    minimum: 0,
  })
  maxDurationH?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Назва або локація маршруту',
  })
  searchText?: string;
}
