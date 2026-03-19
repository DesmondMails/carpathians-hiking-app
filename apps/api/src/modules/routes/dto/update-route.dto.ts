import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Назва маршруту' })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Опис маршруту', required: false })
  description?: string;
}
