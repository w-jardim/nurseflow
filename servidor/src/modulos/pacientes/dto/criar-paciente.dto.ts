import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { limparCpf } from '../../../comum/validadores/cpf';

export class CriarPacienteDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  sobrenome!: string;

  @Transform(({ value }) => (typeof value === 'string' ? limparCpf(value) : value))
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  cpf!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @MaxLength(24)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  endereco?: string;
}
