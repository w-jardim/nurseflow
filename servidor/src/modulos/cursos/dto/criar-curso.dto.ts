import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ModalidadeCurso, StatusCurso } from '@prisma/client';

export class CriarCursoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  titulo!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @IsOptional()
  @IsEnum(ModalidadeCurso)
  modalidade?: ModalidadeCurso;

  @IsInt()
  @Min(0)
  @Max(100000000)
  precoCentavos!: number;

  @IsOptional()
  @IsEnum(StatusCurso)
  status?: StatusCurso;
}
