import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendCodeDto {
  @IsEmail()
  @ApiProperty({ description: 'Email користувача' })
  @IsNotEmpty()
  email!: string;
}
