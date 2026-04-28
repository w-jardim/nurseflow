import { IsString, MaxLength, MinLength } from 'class-validator';

export class SairDto {
  @IsString()
  @MinLength(32)
  @MaxLength(2048)
  refreshToken!: string;
}
