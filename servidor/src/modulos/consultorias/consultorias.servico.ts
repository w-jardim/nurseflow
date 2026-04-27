import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, StatusConsulta } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarConsultoriaDto } from './dto/criar-consultoria.dto';

const CONSULTORIA_SELECT = {
  id: true,
  titulo: true,
  descricao: true,
  modalidade: true,
  precoCentavos: true,
  inicioEm: true,
  fimEm: true,
  status: true,
  observacoes: true,
  criadoEm: true,
} satisfies Prisma.ConsultoriaSelect;

@Injectable()
export class ConsultoriasServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.consultoria.findMany({
      where: { profissionalId },
      orderBy: [{ criadoEm: 'desc' }],
      select: CONSULTORIA_SELECT,
    });
  }

  async criar(profissionalId: string, dados: CriarConsultoriaDto) {
    const inicioEm = dados.inicioEm ? new Date(dados.inicioEm) : null;
    const fimEm = dados.fimEm ? new Date(dados.fimEm) : null;

    if (inicioEm || fimEm) {
      if (!inicioEm || !fimEm) {
        throw new BadRequestException('Informe início e fim para agendar a consultoria.');
      }

      if (fimEm <= inicioEm) {
        throw new BadRequestException('O horário final deve ser posterior ao horário inicial.');
      }

      if (!dados.permitirSobreposicao) {
        await this.garantirHorarioDisponivel(profissionalId, inicioEm, fimEm);
      }
    }

    return this.prisma.consultoria.create({
      data: {
        profissionalId,
        titulo: dados.titulo.trim(),
        descricao: dados.descricao?.trim() || null,
        modalidade: dados.modalidade,
        precoCentavos: dados.precoCentavos,
        inicioEm,
        fimEm,
        status: dados.status ?? StatusConsulta.AGENDADA,
        observacoes: dados.observacoes?.trim() || null,
      },
      select: CONSULTORIA_SELECT,
    });
  }

  private async garantirHorarioDisponivel(profissionalId: string, inicioEm: Date, fimEm: Date) {
    const [consultaConflitante, consultoriaConflitante] = await Promise.all([
      this.prisma.consulta.findFirst({
        where: {
          profissionalId,
          status: {
            not: StatusConsulta.CANCELADA,
          },
          inicioEm: {
            lt: fimEm,
          },
          fimEm: {
            gt: inicioEm,
          },
        },
        select: {
          id: true,
        },
      }),
      this.prisma.consultoria.findFirst({
        where: {
          profissionalId,
          status: {
            not: StatusConsulta.CANCELADA,
          },
          inicioEm: {
            not: null,
            lt: fimEm,
          },
          fimEm: {
            not: null,
            gt: inicioEm,
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (consultaConflitante || consultoriaConflitante) {
      throw new BadRequestException(
        'Já existe atendimento neste horário. Confirme a sobreposição para salvar mesmo assim.',
      );
    }
  }
}
