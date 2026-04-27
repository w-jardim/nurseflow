import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class AtualizarServicoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000000)
  precoCentavos?: number;

  @IsOptional()
  @IsBoolean()
  exibirPreco?: boolean;

  @IsOptional()
  @IsBoolean()
  publicado?: boolean;
}
