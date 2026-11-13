import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SavedRouteQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(30)
  limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(0)
  offset?: number;
}
