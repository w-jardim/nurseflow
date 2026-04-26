import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CadastroProfissionalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  senha!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;
}
