import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateIf, IsLatitude, IsLongitude } from 'class-validator';

const hasGeoParam = (params: GetHomeResponseDto) =>
  params?.latitude != null && params?.longitude != null;

export class GetHomeResponseDto {
  @Type(() => Number)
  @ValidateIf(hasGeoParam)
  @IsLatitude()
  @ApiPropertyOptional({
    description:
      'Широта користувача. Передається разом з longitude для пошуку поруч',
    minimum: -90,
    maximum: 90,
  })
  latitude?: number;

  @Type(() => Number)
  @ValidateIf(hasGeoParam)
  @IsLongitude()
  @ApiPropertyOptional({
    description:
      'Довгота користувача. Передається разом з latitude для пошуку поруч',
    minimum: -180,
    maximum: 180,
  })
  longitude?: number;
}
