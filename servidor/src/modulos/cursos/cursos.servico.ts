import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ModalidadeCurso, Prisma, StatusCurso } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarAulaCursoDto } from './dto/criar-aula-curso.dto';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { CriarModuloCursoDto } from './dto/criar-modulo-curso.dto';

const CURSO_SELECT = {
  id: true,
  titulo: true,
  slug: true,
  descricao: true,
  modalidade: true,
  precoCentavos: true,
  status: true,
  publicadoEm: true,
  criadoEm: true,
} satisfies Prisma.CursoSelect;

@Injectable()
export class CursosServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.curso.findMany({
      where: {
        profissionalId,
        excluidoEm: null,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      select: CURSO_SELECT,
    });
  }

  async criar(profissionalId: string, dados: CriarCursoDto) {
    if (dados.status === StatusCurso.ARQUIVADO) {
      throw new BadRequestException('Um curso novo não pode iniciar arquivado.');
    }

    const status = dados.status ?? StatusCurso.RASCUNHO;

    try {
      return await this.prisma.curso.create({
        data: {
          profissionalId,
          titulo: dados.titulo.trim(),
          slug: dados.slug.trim().toLowerCase(),
          descricao: dados.descricao?.trim() || null,
          modalidade: dados.modalidade ?? ModalidadeCurso.ONLINE,
          precoCentavos: dados.precoCentavos,
          status,
          publicadoEm: status === StatusCurso.PUBLICADO ? new Date() : null,
        },
        select: CURSO_SELECT,
      });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('Endereço do curso já cadastrado para este profissional.');
      }

      throw erro;
    }
  }

  async listarModulos(profissionalId: string, cursoId: string) {
    await this.obterCursoDoTenant(profissionalId, cursoId);

    return this.prisma.moduloCurso.findMany({
      where: {
        cursoId,
      },
      orderBy: {
        ordem: 'asc',
      },
      select: {
        id: true,
        titulo: true,
        ordem: true,
        criadoEm: true,
        aulas: {
          orderBy: {
            ordem: 'asc',
          },
          select: {
            id: true,
            titulo: true,
            descricao: true,
            videoReferencia: true,
            duracaoSegundos: true,
            ordem: true,
            criadoEm: true,
          },
        },
      },
    });
  }

  async criarModulo(profissionalId: string, cursoId: string, dados: CriarModuloCursoDto) {
    await this.obterCursoDoTenant(profissionalId, cursoId);

    const proximaOrdem = await this.prisma.moduloCurso.count({
      where: { cursoId },
    });

    return this.prisma.moduloCurso.create({
      data: {
        cursoId,
        titulo: dados.titulo.trim(),
        ordem: proximaOrdem + 1,
      },
      select: {
        id: true,
        titulo: true,
        ordem: true,
        criadoEm: true,
        aulas: true,
      },
    });
  }

  async criarAula(
    profissionalId: string,
    cursoId: string,
    moduloId: string,
    dados: CriarAulaCursoDto,
  ) {
    await this.obterCursoDoTenant(profissionalId, cursoId);

    const modulo = await this.prisma.moduloCurso.findFirst({
      where: {
        id: moduloId,
        cursoId,
      },
      select: {
        id: true,
      },
    });

    if (!modulo) {
      throw new NotFoundException('Módulo não encontrado para este curso.');
    }

    const proximaOrdem = await this.prisma.aulaCurso.count({
      where: { moduloId },
    });

    return this.prisma.aulaCurso.create({
      data: {
        moduloId,
        titulo: dados.titulo.trim(),
        descricao: dados.descricao?.trim() || null,
        videoReferencia: dados.videoReferencia?.trim() || null,
        duracaoSegundos: dados.duracaoSegundos ?? null,
        ordem: proximaOrdem + 1,
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        videoReferencia: true,
        duracaoSegundos: true,
        ordem: true,
        criadoEm: true,
      },
    });
  }

  private async obterCursoDoTenant(profissionalId: string, cursoId: string) {
    const curso = await this.prisma.curso.findFirst({
      where: {
        id: cursoId,
        profissionalId,
        excluidoEm: null,
      },
      select: {
        id: true,
      },
    });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado.');
    }

    return curso;
  }
}
