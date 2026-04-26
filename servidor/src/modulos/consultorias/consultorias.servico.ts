import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ModalidadeConsultoria, Prisma, StatusConsultoria } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarConsultoriaDto } from './dto/criar-consultoria.dto';

const CONSULTORIA_SELECT = {
  id: true,
  titulo: true,
  descricao: true,
  modalidade: true,
  status: true,
  inicioEm: true,
  fimEm: true,
  local: true,
  linkOnline: true,
  criadoEm: true,
  aluno: {
    select: {
      id: true,
      nome: true,
      sobrenome: true,
    },
  },
  paciente: {
    select: {
      id: true,
      nome: true,
      sobrenome: true,
    },
  },
} satisfies Prisma.ConsultoriaSelect;

@Injectable()
export class ConsultoriasServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.consultoria.findMany({
      where: { profissionalId },
      orderBy: [{ inicioEm: 'asc' }, { criadoEm: 'desc' }],
      select: CONSULTORIA_SELECT,
    });
  }

  async criar(profissionalId: string, dados: CriarConsultoriaDto) {
    if ((dados.alunoId && dados.pacienteId) || (!dados.alunoId && !dados.pacienteId)) {
      throw new BadRequestException('A consultoria deve ser vinculada a um aluno ou a um paciente.');
    }

    if (dados.inicioEm && dados.fimEm && new Date(dados.fimEm) < new Date(dados.inicioEm)) {
      throw new BadRequestException('O horário final não pode ser anterior ao inicial.');
    }

    if (dados.modalidade === ModalidadeConsultoria.PRESENCIAL && !dados.local?.trim()) {
      throw new BadRequestException('Informe o local da consultoria presencial.');
    }

    if (dados.modalidade === ModalidadeConsultoria.ONLINE && !dados.linkOnline?.trim()) {
      throw new BadRequestException('Informe o link da consultoria online.');
    }

    if (dados.alunoId) {
      const aluno = await this.prisma.aluno.findFirst({
        where: { id: dados.alunoId, profissionalId, excluidoEm: null },
        select: { id: true },
      });

      if (!aluno) {
        throw new NotFoundException('Aluno não encontrado para este profissional.');
      }
    }

    if (dados.pacienteId) {
      const paciente = await this.prisma.paciente.findFirst({
        where: { id: dados.pacienteId, profissionalId, excluidoEm: null },
        select: { id: true },
      });

      if (!paciente) {
        throw new NotFoundException('Paciente não encontrado para este profissional.');
      }
    }

    return this.prisma.consultoria.create({
      data: {
        profissionalId,
        alunoId: dados.alunoId ?? null,
        pacienteId: dados.pacienteId ?? null,
        titulo: dados.titulo.trim(),
        descricao: dados.descricao?.trim() || null,
        modalidade: dados.modalidade,
        status: StatusConsultoria.AGENDADA,
        inicioEm: dados.inicioEm ? new Date(dados.inicioEm) : null,
        fimEm: dados.fimEm ? new Date(dados.fimEm) : null,
        local: dados.local?.trim() || null,
        linkOnline: dados.linkOnline?.trim() || null,
      },
      select: CONSULTORIA_SELECT,
    });
  }
}
