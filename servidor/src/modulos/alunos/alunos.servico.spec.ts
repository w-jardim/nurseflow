import { Test, TestingModule } from '@nestjs/testing';
import { AlunosServico } from './alunos.servico';
import { PrismaServico } from '../../comum/prisma/prisma.servico';

describe('AlunosServico', () => {
  let servico: AlunosServico;
  let prismaServico: PrismaServico;

  const tenantId = '123e4567-e89b-12d3-a456-426614174000';

  const mockedPrismaServico = {
    aluno: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlunosServico,
        {
          provide: PrismaServico,
          useValue: mockedPrismaServico,
        },
      ],
    }).compile();

    servico = module.get<AlunosServico>(AlunosServico);
    prismaServico = module.get<PrismaServico>(PrismaServico);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('deve criar um aluno com sucesso', async () => {
      const dadosAluno = {
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '11999999999',
        endereco: 'Rua A, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310100',
      };

      const alunoCriado = {
        id: 'aluno-id-123',
        profissionalId: tenantId,
        ...dadosAluno,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockedPrismaServico.aluno.create.mockResolvedValue(alunoCriado);

      const resultado = await servico.criar(tenantId, dadosAluno);

      expect(resultado).toEqual(alunoCriado);
      expect(mockedPrismaServico.aluno.create).toHaveBeenCalledWith({
        data: {
          ...dadosAluno,
          profissionalId: tenantId,
        },
      });
    });

    it('deve validar email duplicado dentro do mesmo tenant', async () => {
      const dadosAluno = {
        nome: 'Maria',
        email: 'maria@example.com',
        telefone: '11988888888',
      };

      mockedPrismaServico.aluno.create.mockRejectedValue(
        new Error('Email já existe'),
      );

      await expect(servico.criar(tenantId, dadosAluno)).rejects.toThrow();
    });
  });

  describe('listar', () => {
    it('deve listar alunos do tenant correto', async () => {
      const alunos = [
        {
          id: 'aluno-1',
          profissionalId: tenantId,
          nome: 'Aluno 1',
          email: 'aluno1@example.com',
        },
        {
          id: 'aluno-2',
          profissionalId: tenantId,
          nome: 'Aluno 2',
          email: 'aluno2@example.com',
        },
      ];

      mockedPrismaServico.aluno.findMany.mockResolvedValue(alunos);

      const resultado = await servico.listar(tenantId);

      expect(resultado).toEqual(alunos);
      expect(resultado).toHaveLength(2);
      expect(mockedPrismaServico.aluno.findMany).toHaveBeenCalledWith({
        where: {
          profissionalId: tenantId,
        },
      });
    });

    it('não deve retornar alunos de outro tenant', async () => {
      const outroTenant = '223e4567-e89b-12d3-a456-426614174001';

      mockedPrismaServico.aluno.findMany.mockResolvedValue([]);

      const resultado = await servico.listar(outroTenant);

      expect(resultado).toEqual([]);
      expect(mockedPrismaServico.aluno.findMany).toHaveBeenCalledWith({
        where: {
          profissionalId: outroTenant,
        },
      });
    });

    it('deve retornar lista vazia quando não há alunos', async () => {
      mockedPrismaServico.aluno.findMany.mockResolvedValue([]);

      const resultado = await servico.listar(tenantId);

      expect(resultado).toEqual([]);
      expect(resultado).toHaveLength(0);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar aluno pelo ID dentro do mesmo tenant', async () => {
      const alunoId = 'aluno-id-123';
      const aluno = {
        id: alunoId,
        profissionalId: tenantId,
        nome: 'João',
        email: 'joao@example.com',
      };

      mockedPrismaServico.aluno.findUnique.mockResolvedValue(aluno);

      const resultado = await servico.buscarPorId(tenantId, alunoId);

      expect(resultado).toEqual(aluno);
      expect(mockedPrismaServico.aluno.findUnique).toHaveBeenCalledWith({
        where: {
          id: alunoId,
        },
      });
    });

    it('deve rejeitar acesso a aluno de outro tenant', async () => {
      const alunoId = 'aluno-id-123';
      const outroTenant = '223e4567-e89b-12d3-a456-426614174001';

      const aluno = {
        id: alunoId,
        profissionalId: outroTenant,
        nome: 'João',
        email: 'joao@example.com',
      };

      mockedPrismaServico.aluno.findUnique.mockResolvedValue(aluno);

      await expect(
        servico.buscarPorId(tenantId, alunoId),
      ).rejects.toThrow('Acesso negado');
    });

    it('deve retornar null quando aluno não existe', async () => {
      mockedPrismaServico.aluno.findUnique.mockResolvedValue(null);

      const resultado = await servico.buscarPorId(tenantId, 'inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar aluno com sucesso', async () => {
      const alunoId = 'aluno-id-123';
      const dadosAtualizacao = {
        nome: 'João Silva Atualizado',
        telefone: '11987654321',
      };

      const alunoAtualizado = {
        id: alunoId,
        profissionalId: tenantId,
        ...dadosAtualizacao,
      };

      mockedPrismaServico.aluno.update.mockResolvedValue(alunoAtualizado);

      const resultado = await servico.atualizar(
        tenantId,
        alunoId,
        dadosAtualizacao,
      );

      expect(resultado).toEqual(alunoAtualizado);
      expect(mockedPrismaServico.aluno.update).toHaveBeenCalledWith({
        where: {
          id: alunoId,
        },
        data: dadosAtualizacao,
      });
    });
  });

  describe('deletar', () => {
    it('deve deletar aluno com sucesso', async () => {
      const alunoId = 'aluno-id-123';

      mockedPrismaServico.aluno.delete.mockResolvedValue({
        id: alunoId,
        profissionalId: tenantId,
      });

      await servico.deletar(tenantId, alunoId);

      expect(mockedPrismaServico.aluno.delete).toHaveBeenCalledWith({
        where: {
          id: alunoId,
        },
      });
    });
  });

  describe('isolamento por tenant', () => {
    it('deve garantir que alunos sejam isolados por tenant', async () => {
      const tenant1 = '111e4567-e89b-12d3-a456-426614174000';
      const tenant2 = '222e4567-e89b-12d3-a456-426614174000';

      const alunosTenant1 = [
        { id: '1', profissionalId: tenant1, nome: 'Aluno T1' },
      ];
      const alunosTenant2 = [
        { id: '2', profissionalId: tenant2, nome: 'Aluno T2' },
      ];

      // Simular listagem do tenant 1
      mockedPrismaServico.aluno.findMany.mockResolvedValueOnce(alunosTenant1);
      const resultT1 = await servico.listar(tenant1);

      // Simular listagem do tenant 2
      mockedPrismaServico.aluno.findMany.mockResolvedValueOnce(alunosTenant2);
      const resultT2 = await servico.listar(tenant2);

      expect(resultT1).toEqual(alunosTenant1);
      expect(resultT2).toEqual(alunosTenant2);
      expect(resultT1[0].profissionalId).not.toBe(
        resultT2[0].profissionalId,
      );
    });
  });
});
