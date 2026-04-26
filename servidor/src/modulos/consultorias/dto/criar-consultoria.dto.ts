import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ModalidadeConsultoria } from '@prisma/client';

export class CriarConsultoriaDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  titulo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @IsEnum(ModalidadeConsultoria)
  modalidade!: ModalidadeConsultoria;

  @ValidateIf((objeto: CriarConsultoriaDto) => !objeto.pacienteId)
  @IsUUID()
  alunoId?: string;

  @ValidateIf((objeto: CriarConsultoriaDto) => !objeto.alunoId)
  @IsUUID()
  pacienteId?: string;

  @IsOptional()
  @IsDateString()
  inicioEm?: string;

  @IsOptional()
  @IsDateString()
  fimEm?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  local?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkOnline?: string;
}
