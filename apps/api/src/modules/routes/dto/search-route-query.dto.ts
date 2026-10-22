import { Difficulty, DIFFICULTY_VALUES } from '@hiking/shared';
import { Transform } from 'class-transformer';
import { IsOptional, IsIn } from 'class-validator';

export class SearchRouteQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }): string[] =>
    Array.isArray(value) ? (value as string[]) : String(value).split(','),
  )
  @IsIn(DIFFICULTY_VALUES, { each: true })
  difficulty?: Difficulty[];
}
