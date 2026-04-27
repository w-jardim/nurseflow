import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';

const SOLICITACAO_SELECT = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  dataDesejada: true,
  horarioDesejado: true,
  observacoes: true,
  status: true,
  criadoEm: true,
} satisfies Prisma.SolicitacaoAgendamentoSelect;

@Injectable()
export class AgendamentosServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.solicitacaoAgendamento.findMany({
      where: { profissionalId },
      orderBy: { criadoEm: 'desc' },
      select: SOLICITACAO_SELECT,
    });
  }

  async criarPublico(slug: string, dados: CriarSolicitacaoDto) {
    const profissional = await this.prisma.profissional.findFirst({
      where: { slug: slug.trim().toLowerCase(), excluidoEm: null },
      select: { id: true },
    });

    if (!profissional) {
      throw new NotFoundException('Página não encontrada.');
    }

    const solicitacao = await this.prisma.solicitacaoAgendamento.create({
      data: {
        profissionalId: profissional.id,
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        telefone: dados.telefone?.trim() || null,
        dataDesejada: new Date(dados.dataDesejada),
        horarioDesejado: dados.horarioDesejado?.trim() || null,
        observacoes: dados.observacoes?.trim() || null,
      },
      select: { id: true, criadoEm: true },
    });

    return { id: solicitacao.id, criadoEm: solicitacao.criadoEm, mensagem: 'Solicitação registrada.' };
  }

  async atualizarStatus(id: string, profissionalId: string, dados: AtualizarStatusDto) {
    const solicitacao = await this.prisma.solicitacaoAgendamento.findFirst({
      where: { id, profissionalId },
      select: { id: true },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    return this.prisma.solicitacaoAgendamento.update({
      where: { id },
      data: { status: dados.status },
      select: SOLICITACAO_SELECT,
    });
  }
}
