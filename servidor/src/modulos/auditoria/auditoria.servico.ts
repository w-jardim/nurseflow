import { Injectable } from '@nestjs/common';
import { PrismaServico } from '../../comum/prisma/prisma.servico';

type DadosAuditoria = {
  profissionalId: string;
  usuarioId?: string;
  acao: string;
  entidade?: string;
  entidadeId?: string;
  metadados?: Record<string, string | number | boolean | null>;
};

const AUDITORIA_SELECT = {
  id: true,
  acao: true,
  entidade: true,
  entidadeId: true,
  metadados: true,
  criadoEm: true,
} as const;

@Injectable()
export class AuditoriaServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.logAuditoria.findMany({
      where: {
        profissionalId,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      take: 50,
      select: AUDITORIA_SELECT,
    });
  }

  async registrar(dados: DadosAuditoria) {
    await this.prisma.logAuditoria.create({
      data: {
        profissionalId: dados.profissionalId,
        usuarioId: dados.usuarioId ?? null,
        acao: dados.acao,
        entidade: dados.entidade ?? null,
        entidadeId: dados.entidadeId ?? null,
        metadados: dados.metadados ?? undefined,
      },
    });
  }
}
