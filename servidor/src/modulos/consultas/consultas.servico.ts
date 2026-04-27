import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusConsulta } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarConsultaDto } from './dto/criar-consulta.dto';

const CONSULTA_SELECT = {
  id: true,
  inicioEm: true,
  fimEm: true,
  status: true,
  observacoes: true,
  criadoEm: true,
  paciente: {
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      telefone: true,
      email: true,
    },
  },
} satisfies Prisma.ConsultaSelect;

@Injectable()
export class ConsultasServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.consulta.findMany({
      where: {
        profissionalId,
      },
      orderBy: {
        inicioEm: 'asc',
      },
      select: CONSULTA_SELECT,
    });
  }

  async criar(profissionalId: string, dados: CriarConsultaDto) {
    const inicioEm = new Date(dados.inicioEm);
    const fimEm = new Date(dados.fimEm);

    if (fimEm <= inicioEm) {
      throw new BadRequestException('O horário final deve ser posterior ao horário inicial.');
    }

    const paciente = await this.prisma.paciente.findFirst({
      where: {
        id: dados.pacienteId,
        profissionalId,
        excluidoEm: null,
      },
      select: {
        id: true,
      },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado para este profissional.');
    }

    if (!dados.permitirSobreposicao) {
      await this.garantirHorarioDisponivel(profissionalId, inicioEm, fimEm);
    }

    return this.prisma.consulta.create({
      data: {
        profissionalId,
        pacienteId: dados.pacienteId,
        inicioEm,
        fimEm,
        status: dados.status ?? StatusConsulta.AGENDADA,
        observacoes: dados.observacoes?.trim() || null,
      },
      select: CONSULTA_SELECT,
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
