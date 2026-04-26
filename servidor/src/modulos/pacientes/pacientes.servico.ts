import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { cepValido } from '../../comum/validadores/cep';
import { cpfValido } from '../../comum/validadores/cpf';
import { CriarPacienteDto } from './dto/criar-paciente.dto';

@Injectable()
export class PacientesServico {
  constructor(private readonly prisma: PrismaServico) {}

  listar(profissionalId: string) {
    return this.prisma.paciente.findMany({
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
        cpf: true,
        email: true,
        telefone: true,
        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        uf: true,
        criadoEm: true,
      },
    });
  }

  async criar(profissionalId: string, dados: CriarPacienteDto) {
    if (!cpfValido(dados.cpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    if (dados.cep && !cepValido(dados.cep)) {
      throw new BadRequestException('CEP inválido.');
    }

    try {
      return await this.prisma.paciente.create({
        data: {
          profissionalId,
          nome: dados.nome.trim(),
          sobrenome: dados.sobrenome.trim(),
          cpf: dados.cpf,
          email: dados.email?.trim().toLowerCase() || null,
          telefone: dados.telefone?.trim() || null,
          cep: dados.cep || null,
          logradouro: dados.logradouro?.trim() || null,
          numero: dados.numero?.trim() || null,
          complemento: dados.complemento?.trim() || null,
          bairro: dados.bairro?.trim() || null,
          cidade: dados.cidade?.trim() || null,
          uf: dados.uf || null,
        },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          cpf: true,
          email: true,
          telefone: true,
          cep: true,
          logradouro: true,
          numero: true,
          complemento: true,
          bairro: true,
          cidade: true,
          uf: true,
          criadoEm: true,
        },
      });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('CPF já cadastrado para este profissional.');
      }

      throw erro;
    }
  }
}
