import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { AlunosServico } from './alunos.servico';

describe('AlunosServico', () => {
  let servico: AlunosServico;

  const prismaServico = {
    aluno: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const profissionalId = '123e4567-e89b-12d3-a456-426614174000';
  const selectAluno = {
    id: true,
    nome: true,
    sobrenome: true,
    email: true,
    cpf: true,
    telefone: true,
    criadoEm: true,
  };

  beforeEach(() => {
    servico = new AlunosServico(prismaServico as unknown as PrismaServico);
    jest.clearAllMocks();
  });

  it('lista alunos ativos do profissional', async () => {
    const alunos = [{ id: 'aluno-1', nome: 'João', sobrenome: 'Silva' }];
    prismaServico.aluno.findMany.mockResolvedValue(alunos);

    await expect(servico.listar(profissionalId)).resolves.toEqual(alunos);

    expect(prismaServico.aluno.findMany).toHaveBeenCalledWith({
      where: { profissionalId, excluidoEm: null },
      orderBy: { criadoEm: 'desc' },
      select: selectAluno,
    });
  });

  it('cria aluno com dados normalizados', async () => {
    const alunoCriado = {
      id: 'aluno-1',
      nome: 'João',
      sobrenome: 'Silva',
      email: 'joao@example.com',
      cpf: '39053344705',
      telefone: '11999999999',
    };
    prismaServico.aluno.create.mockResolvedValue(alunoCriado);

    await expect(
      servico.criar(profissionalId, {
        nome: ' João ',
        sobrenome: ' Silva ',
        email: ' JOAO@EXAMPLE.COM ',
        cpf: '39053344705',
        telefone: ' 11999999999 ',
      }),
    ).resolves.toEqual(alunoCriado);

    expect(prismaServico.aluno.create).toHaveBeenCalledWith({
      data: {
        profissionalId,
        nome: 'João',
        sobrenome: 'Silva',
        email: 'joao@example.com',
        cpf: '39053344705',
        telefone: '11999999999',
      },
      select: selectAluno,
    });
  });

  it('rejeita CPF inválido antes de persistir', async () => {
    await expect(
      servico.criar(profissionalId, {
        nome: 'João',
        sobrenome: 'Silva',
        email: 'joao@example.com',
        cpf: '12345678901',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prismaServico.aluno.create).not.toHaveBeenCalled();
  });

  it('converte conflito de índice único em mensagem de negócio', async () => {
    prismaServico.aluno.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.19.1',
      }),
    );

    await expect(
      servico.criar(profissionalId, {
        nome: 'João',
        sobrenome: 'Silva',
        email: 'joao@example.com',
        cpf: '39053344705',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
