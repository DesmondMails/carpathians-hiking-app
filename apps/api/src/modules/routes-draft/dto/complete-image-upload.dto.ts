import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

// A thumbhash is ~25 bytes, so ~35 base64 chars; the limit just blocks junk
const THUMBHASH_MAX_LENGTH = 100;
// Standard or URL-safe base64, depending on the platform encoder
const BASE64_PATTERN = /^[A-Za-z0-9+/_-]+={0,2}$/;

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

  @IsOptional()
  @IsString()
  @MaxLength(THUMBHASH_MAX_LENGTH)
  @Matches(BASE64_PATTERN, { message: 'thumbhash має бути у форматі base64' })
  @ApiPropertyOptional({
    description:
      'Thumbhash зображення для розмитого прев’ю під час завантаження',
  })
  thumbhash?: string;
}
