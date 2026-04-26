import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
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

  @IsInt()
  @Min(0)
  @Max(100000000)
  precoCentavos!: number;
}
