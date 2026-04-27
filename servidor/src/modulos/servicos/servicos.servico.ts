import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { CriarServicoDto } from './dto/criar-servico.dto';

const SERVICO_SELECT = {
  id: true,
  titulo: true,
  descricao: true,
  precoCentavos: true,
  exibirPreco: true,
  publicado: true,
  criadoEm: true,
} satisfies Prisma.ServicoSelect;

@Injectable()
export class ServicosServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.servico.findMany({
      where: {
        profissionalId,
        excluidoEm: null,
      },
      orderBy: [{ criadoEm: 'desc' }],
      select: SERVICO_SELECT,
    });
  }

  criar(profissionalId: string, dados: CriarServicoDto) {
    return this.prisma.servico.create({
      data: {
        profissionalId,
        titulo: dados.titulo.trim(),
        descricao: dados.descricao?.trim() || null,
        precoCentavos: dados.precoCentavos,
        exibirPreco: dados.exibirPreco,
        publicado: dados.publicado,
      },
      select: SERVICO_SELECT,
    });
  }

  async atualizar(profissionalId: string, servicoId: string, dados: AtualizarServicoDto) {
    const servico = await this.obterServicoDoTenant(profissionalId, servicoId);

    return this.prisma.servico.update({
      where: {
        id: servico.id,
      },
      data: {
        ...(dados.titulo !== undefined ? { titulo: dados.titulo.trim() } : {}),
        ...(dados.descricao !== undefined ? { descricao: dados.descricao.trim() || null } : {}),
        ...(dados.precoCentavos !== undefined ? { precoCentavos: dados.precoCentavos } : {}),
        ...(dados.exibirPreco !== undefined ? { exibirPreco: dados.exibirPreco } : {}),
        ...(dados.publicado !== undefined ? { publicado: dados.publicado } : {}),
      },
      select: SERVICO_SELECT,
    });
  }

  async excluir(profissionalId: string, servicoId: string) {
    const servico = await this.obterServicoDoTenant(profissionalId, servicoId);

    return this.prisma.servico.update({
      where: {
        id: servico.id,
      },
      data: {
        excluidoEm: new Date(),
        publicado: false,
      },
      select: {
        id: true,
      },
    });
  }

  private async obterServicoDoTenant(profissionalId: string, servicoId: string) {
    const servico = await this.prisma.servico.findFirst({
      where: {
        id: servicoId,
        profissionalId,
        excluidoEm: null,
      },
      select: {
        id: true,
      },
    });

    if (!servico) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    return servico;
  }
}
