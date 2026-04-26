import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CriarPacienteDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  telefone?: string;
}
