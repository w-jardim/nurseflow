import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CriarAlunoDto } from './dto/criar-aluno.dto';

@Injectable()
export class AlunosServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.aluno.findMany({
      where: {
        profissionalId,
        excluidoEm: null,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        criadoEm: true,
      },
    });
  }

  async criar(profissionalId: string, dados: CriarAlunoDto) {
    try {
      return await this.prisma.aluno.create({
        data: {
          profissionalId,
          nome: dados.nome.trim(),
          email: dados.email.trim().toLowerCase(),
          telefone: dados.telefone?.trim() || null,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          criadoEm: true,
        },
      });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('Este aluno já está cadastrado para o profissional.');
      }

      throw erro;
    }
  }
}
