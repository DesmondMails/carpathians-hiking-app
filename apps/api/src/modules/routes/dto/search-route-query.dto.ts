import { Difficulty, DIFFICULTY_VALUES } from '@hiking/shared';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsIn, IsNumber, IsPositive, Min } from 'class-validator';

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
}
