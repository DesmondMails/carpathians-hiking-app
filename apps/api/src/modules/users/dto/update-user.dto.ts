import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: "Ваше ім'я",
    example: 'Микита',
  })
  @IsString()
  @MinLength(2, {
    message: "Ім'я повинно містити не менше 2 символів",
  })
  @MaxLength(12, {
    message: "Ім'я повинно містити не більше 12 символів",
  })
  name!: string;
}
