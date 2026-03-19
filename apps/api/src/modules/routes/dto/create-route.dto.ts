import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Назва маршруту' })
  title!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Опис маршруту', required: false })
  description?: string;
}
