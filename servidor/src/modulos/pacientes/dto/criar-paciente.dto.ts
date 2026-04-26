import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { limparCep } from '../../../comum/validadores/cep';
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
  @Transform(({ value }) => (typeof value === 'string' ? limparCep(value) : value))
  @MinLength(8)
  @MaxLength(8)
  cep?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  logradouro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  complemento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  bairro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  cidade?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  uf?: string;
}
