import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  @ApiProperty({ description: 'Email користувача' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @ApiProperty({ description: 'Код підтвердження' })
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}
