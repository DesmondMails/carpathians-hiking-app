import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
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
