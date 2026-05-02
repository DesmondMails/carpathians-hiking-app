import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CompleteDraftImageUploadDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID зображення, згенерований на presign етапі' })
  imageId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Storage key завантаженого зображення' })
  storageKey!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ description: 'Порядок зображення в галереї' })
  sortOrder?: number;
}
