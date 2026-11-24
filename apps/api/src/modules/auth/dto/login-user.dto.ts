import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ description: 'Email користувача' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @ApiProperty({ description: 'Пароль користувача' })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password!: string;
}
