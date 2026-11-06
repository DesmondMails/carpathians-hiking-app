import { PublicUser } from '@hiking/shared';
import { ApiProperty } from '@nestjs/swagger';

export class PublicUserDto implements PublicUser {
  @ApiProperty({ description: 'ID користувача', format: 'uuid' })
  id!: string;

  @ApiProperty({
    description: 'Email користувача',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Дата створення',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Дата оновлення',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: "Ваше ім'я",
    example: 'Микита',
  })
  name!: string | null;
}
