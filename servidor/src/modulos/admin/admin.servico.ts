import { Injectable } from '@nestjs/common';
import { PlanoProfissional, StatusAssinatura, StatusPagamento } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';

const MRR_POR_PLANO: Record<PlanoProfissional, number> = {
  GRATUITO: 0,
  PRO: 9700,
  STANDARD: 19700,
};

@Injectable()
export class AdminServico {
  constructor(private readonly prisma: PrismaServico) {}

  async buscarMetricas() {
    const agora = new Date();
    const inicio30Dias = new Date(agora);
    inicio30Dias.setDate(agora.getDate() - 30);
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const [
      profissionaisPorPlano,
      assinaturasAtivas,
      assinaturasCanceladas30Dias,
      totalAssinaturas,
      transacoesAprovadas,
      novosUsuarios30Dias,
      totalProfissionais,
      totalAlunos,
      totalPacientes,
    ] = await Promise.all([
      this.prisma.profissional.groupBy({
        by: ['plano'],
        _count: { id: true },
        where: { excluidoEm: null },
      }),

      this.prisma.profissional.findMany({
        where: { statusAssinatura: StatusAssinatura.ATIVA, plano: { not: 'GRATUITO' }, excluidoEm: null },
        select: { plano: true },
      }),

      this.prisma.assinatura.count({
        where: { status: StatusAssinatura.CANCELADA, canceladoEm: { gte: inicio30Dias } },
      }),

      this.prisma.assinatura.count({
        where: { criadoEm: { lt: inicio30Dias } },
      }),

      this.prisma.transacao.aggregate({
        _sum: { valorCentavos: true, taxaPlataformaCentavos: true },
        where: { status: StatusPagamento.APROVADO },
      }),

      this.prisma.usuario.count({
        where: { criadoEm: { gte: inicio30Dias } },
      }),

      this.prisma.profissional.count({ where: { excluidoEm: null } }),
      this.prisma.aluno.count({ where: { excluidoEm: null } }),
      this.prisma.paciente.count({ where: { excluidoEm: null } }),
    ]);

    const mrr = assinaturasAtivas.reduce(
      (soma, p) => soma + MRR_POR_PLANO[p.plano],
      0,
    );

    const churnRate =
      totalAssinaturas > 0
        ? Number(((assinaturasCanceladas30Dias / totalAssinaturas) * 100).toFixed(2))
        : 0;

    const distribuicaoPlanos = Object.fromEntries(
      profissionaisPorPlano.map((g) => [g.plano, g._count.id]),
    );

    const [novosMes] = await Promise.all([
      this.prisma.profissional.count({
        where: { criadoEm: { gte: inicioMesAtual }, excluidoEm: null },
      }),
    ]);

    return {
      receita: {
        mrrCentavos: mrr,
        arrCentavos: mrr * 12,
        volumeTransacoesCentavos: transacoesAprovadas._sum.valorCentavos ?? 0,
        taxaPlataformaCentavos: transacoesAprovadas._sum.taxaPlataformaCentavos ?? 0,
      },
      assinaturas: {
        churnRate30Dias: churnRate,
        canceladas30Dias: assinaturasCanceladas30Dias,
      },
      profissionais: {
        total: totalProfissionais,
        novosMesAtual: novosMes,
        novos30Dias: novosUsuarios30Dias,
        porPlano: {
          GRATUITO: (distribuicaoPlanos['GRATUITO'] as number) ?? 0,
          PRO: (distribuicaoPlanos['PRO'] as number) ?? 0,
          STANDARD: (distribuicaoPlanos['STANDARD'] as number) ?? 0,
        },
      },
      usuarios: {
        totalAlunos,
        totalPacientes,
      },
    };
  }

  async listarProfissionais(pagina: number, limite: number) {
    const pular = (pagina - 1) * limite;

    const [profissionais, total] = await Promise.all([
      this.prisma.profissional.findMany({
        skip: pular,
        take: limite,
        where: { excluidoEm: null },
        orderBy: { criadoEm: 'desc' },
        select: {
          id: true,
          nomePublico: true,
          slug: true,
          plano: true,
          statusAssinatura: true,
          criadoEm: true,
          usuarioDono: { select: { email: true, ultimoAcessoEm: true } },
          _count: { select: { alunos: true, pacientes: true, cursos: true } },
        },
      }),
      this.prisma.profissional.count({ where: { excluidoEm: null } }),
    ]);

    return {
      dados: profissionais,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async buscarProfissional(profissionalId: string) {
    const profissional = await this.prisma.profissional.findUnique({
      where: { id: profissionalId },
      include: {
        usuarioDono: { select: { email: true, ultimoAcessoEm: true, criadoEm: true } },
        assinaturas: { orderBy: { criadoEm: 'desc' }, take: 5 },
        _count: { select: { alunos: true, pacientes: true, cursos: true, consultas: true } },
      },
    });

    if (!profissional) return null;

    const receita = await this.prisma.transacao.aggregate({
      _sum: { valorCentavos: true, taxaPlataformaCentavos: true },
      where: { profissionalId, status: StatusPagamento.APROVADO },
    });

    return {
      ...profissional,
      receita: {
        totalCentavos: receita._sum.valorCentavos ?? 0,
        taxaPlataformaCentavos: receita._sum.taxaPlataformaCentavos ?? 0,
      },
    };
  }
}
