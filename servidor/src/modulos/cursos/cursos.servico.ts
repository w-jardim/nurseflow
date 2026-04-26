import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ModalidadeCurso, PapelUsuario, Prisma, StatusCurso } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarAulaCursoDto } from './dto/criar-aula-curso.dto';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { CriarInscricaoCursoDto } from './dto/criar-inscricao-curso.dto';
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

  async criarInscricao(profissionalId: string, cursoId: string, dados: CriarInscricaoCursoDto) {
    await this.obterCursoDoTenant(profissionalId, cursoId);

    const aluno = await this.prisma.aluno.findFirst({
      where: {
        id: dados.alunoId,
        profissionalId,
        excluidoEm: null,
      },
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        usuarioId: true,
      },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado.');
    }

    const inscricaoExistente = await this.prisma.inscricaoCurso.findFirst({
      where: {
        cursoId,
        alunoId: dados.alunoId,
      },
      select: {
        id: true,
      },
    });

    if (inscricaoExistente) {
      throw new ConflictException('Aluno já está inscrito neste curso.');
    }

    const acessoAluno = await this.garantirAcessoAluno(profissionalId, aluno);

    try {
      const inscricao = await this.prisma.inscricaoCurso.create({
        data: {
          profissionalId,
          cursoId,
          alunoId: dados.alunoId,
        },
        select: {
          id: true,
          cursoId: true,
          alunoId: true,
          criadoEm: true,
          aluno: {
            select: {
              nome: true,
              sobrenome: true,
              email: true,
            },
          },
        },
      });

      return {
        ...inscricao,
        acessoAluno,
      };
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('Aluno já está inscrito neste curso.');
      }

      throw erro;
    }
  }

  listarCursosDoAluno(usuarioId: string) {
    return this.prisma.inscricaoCurso.findMany({
      where: {
        aluno: {
          usuarioId,
          excluidoEm: null,
        },
        curso: {
          status: StatusCurso.PUBLICADO,
          excluidoEm: null,
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
      select: {
        id: true,
        criadoEm: true,
        concluidoEm: true,
        curso: {
          select: {
            id: true,
            titulo: true,
            slug: true,
            descricao: true,
            modalidade: true,
            precoCentavos: true,
            status: true,
            publicadoEm: true,
            criadoEm: true,
            profissional: {
              select: {
                nomePublico: true,
              },
            },
            _count: {
              select: {
                modulos: true,
              },
            },
          },
        },
      },
    });
  }

  async obterCursoDoAluno(usuarioId: string, cursoId: string) {
    const inscricao = await this.prisma.inscricaoCurso.findFirst({
      where: {
        cursoId,
        aluno: {
          usuarioId,
          excluidoEm: null,
        },
        curso: {
          status: StatusCurso.PUBLICADO,
          excluidoEm: null,
        },
      },
      select: {
        id: true,
        criadoEm: true,
        concluidoEm: true,
        curso: {
          select: {
            id: true,
            titulo: true,
            slug: true,
            descricao: true,
            modalidade: true,
            precoCentavos: true,
            status: true,
            publicadoEm: true,
            criadoEm: true,
            profissional: {
              select: {
                nomePublico: true,
              },
            },
            modulos: {
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
            },
          },
        },
      },
    });

    if (!inscricao) {
      throw new NotFoundException('Curso não encontrado para este aluno.');
    }

    return inscricao;
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

  private async garantirAcessoAluno(
    profissionalId: string,
    aluno: {
      id: string;
      nome: string;
      sobrenome: string | null;
      email: string;
      usuarioId: string | null;
    },
  ) {
    if (aluno.usuarioId) {
      return null;
    }

    const senhaTemporaria = randomBytes(6).toString('base64url');
    const senhaHash = await bcrypt.hash(senhaTemporaria, 12);

    try {
      const usuario = await this.prisma.usuario.create({
        data: {
          nome: [aluno.nome, aluno.sobrenome].filter(Boolean).join(' '),
          email: aluno.email.trim().toLowerCase(),
          senhaHash,
          papel: PapelUsuario.ALUNO,
          profissionalId,
        },
        select: {
          id: true,
          email: true,
        },
      });

      await this.prisma.aluno.update({
        where: {
          id: aluno.id,
        },
        data: {
          usuarioId: usuario.id,
        },
      });

      return {
        email: usuario.email,
        senhaTemporaria,
        criadoAgora: true,
      };
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('E-mail do aluno já possui usuário de acesso.');
      }

      throw erro;
    }
  }
}
