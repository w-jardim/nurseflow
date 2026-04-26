import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { StatusConsulta } from '@prisma/client';

export class CriarConsultaDto {
  @IsUUID()
  pacienteId!: string;

  @IsDateString()
  inicioEm!: string;

  @IsDateString()
  fimEm!: string;

  @IsOptional()
  @IsEnum(StatusConsulta)
  status?: StatusConsulta;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;
}
