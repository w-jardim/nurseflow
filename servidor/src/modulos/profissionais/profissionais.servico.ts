import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusCurso } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { AtualizarPerfilProfissionalDto } from './dto/atualizar-perfil-profissional.dto';

const PERFIL_PRIVADO_SELECT = {
  id: true,
  nomePublico: true,
  slug: true,
  bio: true,
  telefone: true,
  conselho: true,
  pixChave: true,
  linkPagamento: true,
  instrucoesPagamento: true,
  plano: true,
  statusAssinatura: true,
  criadoEm: true,
} satisfies Prisma.ProfissionalSelect;

const PERFIL_PUBLICO_SELECT = {
  id: true,
  nomePublico: true,
  slug: true,
  bio: true,
  telefone: true,
  conselho: true,
  pixChave: true,
  linkPagamento: true,
  instrucoesPagamento: true,
  cursos: {
    where: {
      status: StatusCurso.PUBLICADO,
      excluidoEm: null,
    },
    orderBy: {
      criadoEm: 'desc',
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      descricao: true,
      modalidade: true,
      precoCentavos: true,
    },
  },
  consultorias: {
    orderBy: {
      criadoEm: 'desc',
    },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      modalidade: true,
      precoCentavos: true,
    },
  },
} satisfies Prisma.ProfissionalSelect;

@Injectable()
export class ProfissionaisServico {
  constructor(private readonly prisma: PrismaServico) {}

  async buscarPerfilPrivado(profissionalId: string) {
    const profissional = await this.prisma.profissional.findFirst({
      where: {
        id: profissionalId,
        excluidoEm: null,
      },
      select: PERFIL_PRIVADO_SELECT,
    });

    if (!profissional) {
      throw new NotFoundException('Perfil profissional não encontrado.');
    }

    return profissional;
  }

  async atualizarPerfil(profissionalId: string, dados: AtualizarPerfilProfissionalDto) {
    try {
      return await this.prisma.profissional.update({
        where: {
          id: profissionalId,
        },
        data: {
          nomePublico: dados.nomePublico?.trim(),
          slug: dados.slug?.trim().toLowerCase(),
          bio: dados.bio?.trim() || null,
          telefone: dados.telefone?.trim() || null,
          conselho: dados.conselho?.trim() || null,
          pixChave: dados.pixChave?.trim() || null,
          linkPagamento: dados.linkPagamento?.trim() || null,
          instrucoesPagamento: dados.instrucoesPagamento?.trim() || null,
        },
        select: PERFIL_PRIVADO_SELECT,
      });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('Endereço da página já está em uso.');
      }

      throw erro;
    }
  }

  async buscarPaginaPublica(slug: string) {
    const profissional = await this.prisma.profissional.findFirst({
      where: {
        slug: slug.trim().toLowerCase(),
        excluidoEm: null,
      },
      select: PERFIL_PUBLICO_SELECT,
    });

    if (!profissional) {
      throw new NotFoundException('Página não encontrada.');
    }

    return profissional;
  }
}
