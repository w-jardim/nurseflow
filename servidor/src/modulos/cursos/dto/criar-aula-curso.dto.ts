import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CriarAulaCursoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  titulo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  videoReferencia?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86400)
  duracaoSegundos?: number;
}
