import { IsString } from 'class-validator';

export class GoogleNativeDto {
  @IsString()
  idToken!: string;
}
