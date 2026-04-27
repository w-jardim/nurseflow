import { IsEnum } from 'class-validator';
import { StatusSolicitacao } from '@prisma/client';

export class AtualizarStatusDto {
  @IsEnum(StatusSolicitacao)
  status!: StatusSolicitacao;
}
