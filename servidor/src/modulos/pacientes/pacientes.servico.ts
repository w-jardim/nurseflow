import { Injectable } from '@nestjs/common';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
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
        email: true,
        telefone: true,
        criadoEm: true,
      },
    });
  }

  criar(profissionalId: string, dados: CriarPacienteDto) {
    return this.prisma.paciente.create({
      data: {
        profissionalId,
        nome: dados.nome.trim(),
        email: dados.email?.trim().toLowerCase() || null,
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
  }
}
