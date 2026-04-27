import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { cpfValido } from '../../comum/validadores/cpf';
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
        sobrenome: true,
        email: true,
        cpf: true,
        telefone: true,
        criadoEm: true,
      },
    });
  }

  async criar(profissionalId: string, dados: CriarAlunoDto) {
    if (!cpfValido(dados.cpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    try {
      return await this.prisma.aluno.create({
        data: {
          profissionalId,
          nome: dados.nome.trim(),
          sobrenome: dados.sobrenome.trim(),
          email: dados.email.trim().toLowerCase(),
          cpf: dados.cpf,
          telefone: dados.telefone?.trim() || null,
        },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          cpf: true,
          telefone: true,
          criadoEm: true,
        },
      });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('E-mail ou CPF já cadastrado para este profissional.');
      }

      throw erro;
    }
  }
}
