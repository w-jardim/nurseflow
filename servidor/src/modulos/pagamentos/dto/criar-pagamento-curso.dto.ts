import { IsUUID } from 'class-validator';

export class CriarPagamentoCursoDto {
  @IsUUID()
  alunoId!: string;
}
