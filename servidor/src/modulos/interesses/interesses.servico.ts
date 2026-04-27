import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrigemInteresse, Prisma, StatusCurso } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarInteressePublicoDto } from './dto/criar-interesse-publico.dto';

const INTERESSE_SELECT = {
  id: true,
  origem: true,
  nome: true,
  email: true,
  telefone: true,
  mensagem: true,
  visualizadoEm: true,
  criadoEm: true,
  curso: {
    select: {
      id: true,
      titulo: true,
    },
  },
  consultoria: {
    select: {
      id: true,
      titulo: true,
    },
  },
  servico: {
    select: {
      id: true,
      titulo: true,
    },
  },
} satisfies Prisma.InteressePublicoSelect;

@Injectable()
export class InteressesServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.interessePublico.findMany({
      where: {
        profissionalId,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      select: INTERESSE_SELECT,
    });
  }

  async criarPublico(slug: string, dados: CriarInteressePublicoDto) {
    const itensSelecionados = [dados.cursoId, dados.consultoriaId, dados.servicoId].filter(Boolean);
    if (itensSelecionados.length > 1) {
      throw new BadRequestException('Selecione apenas um item de interesse.');
    }

    const profissional = await this.prisma.profissional.findFirst({
      where: {
        slug: slug.trim().toLowerCase(),
        excluidoEm: null,
      },
      select: {
        id: true,
      },
    });

    if (!profissional) {
      throw new NotFoundException('Página não encontrada.');
    }

    const origem = this.definirOrigem(dados);

    if (dados.cursoId) {
      const curso = await this.prisma.curso.findFirst({
        where: {
          id: dados.cursoId,
          profissionalId: profissional.id,
          status: StatusCurso.PUBLICADO,
          excluidoEm: null,
        },
        select: {
          id: true,
        },
      });

      if (!curso) {
        throw new NotFoundException('Curso não encontrado nesta página.');
      }
    }

    if (dados.consultoriaId) {
      const consultoria = await this.prisma.consultoria.findFirst({
        where: {
          id: dados.consultoriaId,
          profissionalId: profissional.id,
        },
        select: {
          id: true,
        },
      });

      if (!consultoria) {
        throw new NotFoundException('Consultoria não encontrada nesta página.');
      }
    }

    if (dados.servicoId) {
      const servico = await this.prisma.servico.findFirst({
        where: {
          id: dados.servicoId,
          profissionalId: profissional.id,
          publicado: true,
          excluidoEm: null,
        },
        select: {
          id: true,
        },
      });

      if (!servico) {
        throw new NotFoundException('Serviço não encontrado nesta página.');
      }
    }

    const interesse = await this.prisma.interessePublico.create({
      data: {
        profissionalId: profissional.id,
        cursoId: dados.cursoId ?? null,
        consultoriaId: dados.consultoriaId ?? null,
        servicoId: dados.servicoId ?? null,
        origem,
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        telefone: dados.telefone?.trim() || null,
        mensagem: dados.mensagem?.trim() || null,
      },
      select: {
        id: true,
        criadoEm: true,
      },
    });

    return {
      id: interesse.id,
      criadoEm: interesse.criadoEm,
      mensagem: 'Interesse registrado.',
    };
  }

  private definirOrigem(dados: CriarInteressePublicoDto) {
    if (dados.cursoId) {
      return OrigemInteresse.CURSO;
    }

    if (dados.consultoriaId) {
      return OrigemInteresse.CONSULTORIA;
    }

    if (dados.servicoId) {
      return OrigemInteresse.SERVICO;
    }

    return dados.origem ?? OrigemInteresse.PERFIL;
  }
}
