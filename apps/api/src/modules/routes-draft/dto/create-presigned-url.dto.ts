import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Тип файлу' })
  contentType!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Ім'я файлу" })
  fileName!: string;
}
