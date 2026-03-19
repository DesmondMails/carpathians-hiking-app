import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @ApiProperty({ description: 'Refresh токен' })
  @IsNotEmpty()
  refreshToken!: string;
}
