import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CriarServicoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  titulo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @IsInt()
  @Min(0)
  @Max(100000000)
  precoCentavos!: number;

  @IsBoolean()
  exibirPreco!: boolean;

  @IsBoolean()
  publicado!: boolean;
}
