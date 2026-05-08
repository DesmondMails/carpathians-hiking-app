import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetRouteCoverDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID зображення, яке стане обкладинкою' })
  imageId!: string;
}
