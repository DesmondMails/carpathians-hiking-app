import { Difficulty, DIFFICULTY_VALUES } from '@hiking/shared';
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
} from 'class-validator';

const hasGeoParam = (o: SearchRouteQueryDto): boolean =>
  o.latitude != null || o.longitude != null || o.radiusM != null;

export class SearchRouteQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }): string[] =>
    Array.isArray(value) ? (value as string[]) : String(value).split(','),
  )
  @IsIn(DIFFICULTY_VALUES, { each: true })
  difficulty?: Difficulty[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceFromM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  distanceToM?: number;

  @Type(() => Number)
  @ValidateIf(hasGeoParam)
  @IsLatitude()
  latitude?: number;

  @Type(() => Number)
  @ValidateIf(hasGeoParam)
  @IsLongitude()
  longitude?: number;

  @ValidateIf(hasGeoParam)
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  radiusM?: number;
}
