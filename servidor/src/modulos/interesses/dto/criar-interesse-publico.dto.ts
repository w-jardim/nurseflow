import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { OrigemInteresse } from '@prisma/client';

export class CriarInteressePublicoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @MaxLength(24)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mensagem?: string;

  @IsOptional()
  @IsEnum(OrigemInteresse)
  origem?: OrigemInteresse;

  @IsOptional()
  @IsUUID()
  cursoId?: string;

  @IsOptional()
  @IsUUID()
  consultoriaId?: string;

  @IsOptional()
  @IsUUID()
  servicoId?: string;
}
