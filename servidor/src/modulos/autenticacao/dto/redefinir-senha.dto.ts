import { IsString, MaxLength, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsString()
  @MinLength(32)
  @MaxLength(2048)
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  novaSenha!: string;
}
