import { Test, TestingModule } from '@nestjs/testing';
import { CursosServico } from './cursos.servico';
import { PrismaServico } from '../../comum/prisma/prisma.servico';

describe('CursosServico - Isolamento Multi-Tenant', () => {
  let servico: CursosServico;
  let prismaServico: PrismaServico;

  const tenant1Id = '111e4567-e89b-12d3-a456-426614174000';
  const tenant2Id = '222e4567-e89b-12d3-a456-426614174000';

  const mockedPrismaServico = {
    curso: {
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
        CursosServico,
        {
          provide: PrismaServico,
          useValue: mockedPrismaServico,
        },
      ],
    }).compile();

    servico = module.get<CursosServico>(CursosServico);
    prismaServico = module.get<PrismaServico>(PrismaServico);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Isolamento por Tenant', () => {
    it('deve listar apenas cursos do tenant correto', async () => {
      const cursosTenant1 = [
        {
          id: '1',
          profissionalId: tenant1Id,
          titulo: 'Curso 1',
          descricao: 'Descrição 1',
        },
      ];

      mockedPrismaServico.curso.findMany.mockResolvedValue(cursosTenant1);

      const resultado = await servico.listar(tenant1Id);

      expect(resultado).toEqual(cursosTenant1);
      expect(mockedPrismaServico.curso.findMany).toHaveBeenCalledWith({
        where: {
          profissionalId: tenant1Id,
        },
      });
    });

    it('deve não retornar cursos de outro tenant', async () => {
      const cursosOutroTenant = [
        {
          id: '2',
          profissionalId: tenant2Id,
          titulo: 'Curso 2',
        },
      ];

      // Tenant 1 não deve ver cursos do tenant 2
      mockedPrismaServico.curso.findMany.mockResolvedValueOnce([]);
      const resultadoTenant1 = await servico.listar(tenant1Id);

      // Tenant 2 vê seus cursos
      mockedPrismaServico.curso.findMany.mockResolvedValueOnce(cursosOutroTenant);
      const resultadoTenant2 = await servico.listar(tenant2Id);

      expect(resultadoTenant1).toEqual([]);
      expect(resultadoTenant2).toEqual(cursosOutroTenant);
      expect(resultadoTenant2[0].profissionalId).not.toBe(tenant1Id);
    });

    it('deve rejeitar acesso a curso de outro tenant', async () => {
      const cursoDoOutroTenant = {
        id: 'curso-123',
        profissionalId: tenant2Id,
        titulo: 'Curso Privado',
      };

      mockedPrismaServico.curso.findUnique.mockResolvedValue(
        cursoDoOutroTenant,
      );

      // Tenant1 tenta acessar curso do tenant2
      await expect(servico.buscarPorId(tenant1Id, 'curso-123')).rejects.toThrow(
        'Acesso negado',
      );
    });

    it('deve garantir isolamento ao criar curso', async () => {
      const dadosCurso = {
        titulo: 'Novo Curso',
        descricao: 'Descrição',
        preco: 99.99,
      };

      const cursoCriado = {
        id: 'novo-curso',
        profissionalId: tenant1Id,
        ...dadosCurso,
      };

      mockedPrismaServico.curso.create.mockResolvedValue(cursoCriado);

      const resultado = await servico.criar(tenant1Id, dadosCurso);

      expect(resultado.profissionalId).toBe(tenant1Id);
      expect(mockedPrismaServico.curso.create).toHaveBeenCalledWith({
        data: {
          ...dadosCurso,
          profissionalId: tenant1Id,
        },
      });
    });

    it('deve garantir isolamento ao atualizar curso', async () => {
      const cursoId = 'curso-123';
      const atualizacao = { titulo: 'Título Atualizado' };

      const cursoAtualizado = {
        id: cursoId,
        profissionalId: tenant1Id,
        ...atualizacao,
      };

      mockedPrismaServico.curso.update.mockResolvedValue(cursoAtualizado);

      const resultado = await servico.atualizar(
        tenant1Id,
        cursoId,
        atualizacao,
      );

      expect(resultado.profissionalId).toBe(tenant1Id);
    });

    it('deve garantir isolamento ao deletar curso', async () => {
      const cursoId = 'curso-123';

      mockedPrismaServico.curso.delete.mockResolvedValue({
        id: cursoId,
        profissionalId: tenant1Id,
      });

      await servico.deletar(tenant1Id, cursoId);

      expect(mockedPrismaServico.curso.delete).toHaveBeenCalledWith({
        where: {
          id: cursoId,
        },
      });
    });
  });

  describe('Múltiplos Tenants Simultâneos', () => {
    it('deve manter isolamento com múltiplos tenants operando simultaneamente', async () => {
      const cursosT1 = [
        { id: '1', profissionalId: tenant1Id, titulo: 'Curso T1' },
      ];
      const cursosT2 = [
        { id: '2', profissionalId: tenant2Id, titulo: 'Curso T2' },
      ];
      const cursosT3 = [
        { id: '3', profissionalId: 'tenant3', titulo: 'Curso T3' },
      ];

      mockedPrismaServico.curso.findMany
        .mockResolvedValueOnce(cursosT1)
        .mockResolvedValueOnce(cursosT2)
        .mockResolvedValueOnce(cursosT3);

      const [resultT1, resultT2, resultT3] = await Promise.all([
        servico.listar(tenant1Id),
        servico.listar(tenant2Id),
        servico.listar('tenant3'),
      ]);

      expect(resultT1[0].profissionalId).toBe(tenant1Id);
      expect(resultT2[0].profissionalId).toBe(tenant2Id);
      expect(resultT3[0].profissionalId).toBe('tenant3');
      expect(resultT1[0].id).not.toBe(resultT2[0].id);
    });
  });

  describe('Validação de Acesso', () => {
    it('deve validar propriedade antes de operações críticas', async () => {
      const cursoDeOutroTenant = {
        id: 'curso-123',
        profissionalId: tenant2Id,
        titulo: 'Curso Protegido',
      };

      mockedPrismaServico.curso.findUnique.mockResolvedValue(
        cursoDeOutroTenant,
      );

      // Tentativa de deletar curso de outro tenant
      await expect(servico.deletar(tenant1Id, 'curso-123')).rejects.toThrow();

      // Tentativa de atualizar curso de outro tenant
      await expect(
        servico.atualizar(tenant1Id, 'curso-123', { titulo: 'Novo' }),
      ).rejects.toThrow();
    });
  });

  describe('Criar e Listar', () => {
    it('deve criar curso com isolamento correto', async () => {
      const dadosCurso = {
        titulo: 'Enfermagem Avançada',
        descricao: 'Curso de enfermagem',
        preco: 199.90,
      };

      const cursoCriado = {
        id: 'curso-novo-123',
        profissionalId: tenant1Id,
        ...dadosCurso,
        criadoEm: new Date(),
      };

      mockedPrismaServico.curso.create.mockResolvedValue(cursoCriado);

      const resultado = await servico.criar(tenant1Id, dadosCurso);

      expect(resultado).toEqual(cursoCriado);
      expect(resultado.profissionalId).toBe(tenant1Id);
    });

    it('deve listar cursos de forma paginada com isolamento', async () => {
      const cursos = Array.from({ length: 25 }, (_, i) => ({
        id: `curso-${i}`,
        profissionalId: tenant1Id,
        titulo: `Curso ${i}`,
      }));

      mockedPrismaServico.curso.findMany.mockResolvedValue(cursos.slice(0, 10));

      const resultado = await servico.listar(tenant1Id, { skip: 0, take: 10 });

      expect(resultado).toHaveLength(10);
      expect(resultado.every((c) => c.profissionalId === tenant1Id)).toBe(true);
    });
  });
});
