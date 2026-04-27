import {
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ModalidadeConsultoria, StatusConsulta } from '@prisma/client';

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

  @IsInt()
  @Min(0)
  @Max(100000000)
  precoCentavos!: number;

  @IsOptional()
  @IsDateString()
  inicioEm?: string;

  @IsOptional()
  @IsDateString()
  fimEm?: string;

  @IsOptional()
  @IsEnum(StatusConsulta)
  status?: StatusConsulta;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  permitirSobreposicao?: boolean;
}
