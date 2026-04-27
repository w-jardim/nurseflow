import { IsUUID } from 'class-validator';

export class CriarInscricaoCursoDto {
  @IsUUID()
  alunoId!: string;
}
