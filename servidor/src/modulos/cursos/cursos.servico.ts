import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma, StatusCurso } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarCursoDto } from './dto/criar-curso.dto';

const CURSO_SELECT = {
  id: true,
  titulo: true,
  slug: true,
  descricao: true,
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
          precoCentavos: dados.precoCentavos,
          status,
          publicadoEm: status === StatusCurso.PUBLICADO ? new Date() : null,
        },
        select: CURSO_SELECT,
      });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('Slug de curso já cadastrado para este profissional.');
      }

      throw erro;
    }
  }
}
