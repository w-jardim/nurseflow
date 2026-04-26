import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AtualizarPerfilProfissionalDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nomePublico?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @MaxLength(24)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  conselho?: string;
}
