import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;
}
