import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
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
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: `Пароль занадто слабкий. Він повинен містити принаймні одну цифру, одну велику літеру та одну маленьку літеру.`,
  })
  password!: string;
}
