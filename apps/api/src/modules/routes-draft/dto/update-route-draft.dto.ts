import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRouteDraftDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Назва draft маршруту' })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Опис draft маршруту' })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Ключ файлу у зовнішньому сховищі' })
  gpxStorageKey?: string;
}
