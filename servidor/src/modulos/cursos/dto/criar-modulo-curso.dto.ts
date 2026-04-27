import { IsString, MaxLength, MinLength } from 'class-validator';

export class CriarModuloCursoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  titulo!: string;
}
