import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarConsultoriaDto } from './dto/criar-consultoria.dto';

const CONSULTORIA_SELECT = {
  id: true,
  titulo: true,
  descricao: true,
  modalidade: true,
  precoCentavos: true,
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
    return this.prisma.consultoria.create({
      data: {
        profissionalId,
        titulo: dados.titulo.trim(),
        descricao: dados.descricao?.trim() || null,
        modalidade: dados.modalidade,
        precoCentavos: dados.precoCentavos,
      },
      select: CONSULTORIA_SELECT,
    });
  }
}
