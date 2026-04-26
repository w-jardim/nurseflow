import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ModalidadeCurso, Prisma, StatusCurso } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { CursosServico } from './cursos.servico';

describe('CursosServico', () => {
  let servico: CursosServico;

  const prismaServico = {
    curso: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    moduloCurso: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    aulaCurso: {
      count: jest.fn(),
      create: jest.fn(),
    },
    aluno: {
      findFirst: jest.fn(),
    },
    inscricaoCurso: {
      create: jest.fn(),
    },
  };

  const profissionalId = '111e4567-e89b-12d3-a456-426614174000';
  const cursoId = 'curso-id';
  const cursoSelect = {
    id: true,
    titulo: true,
    slug: true,
    descricao: true,
    modalidade: true,
    precoCentavos: true,
    status: true,
    publicadoEm: true,
    criadoEm: true,
  };

  beforeEach(() => {
    servico = new CursosServico(prismaServico as unknown as PrismaServico);
    jest.clearAllMocks();
  });

  it('lista cursos ativos do profissional', async () => {
    const cursos = [{ id: cursoId, titulo: 'Urgência e Emergência' }];
    prismaServico.curso.findMany.mockResolvedValue(cursos);

    await expect(servico.listar(profissionalId)).resolves.toEqual(cursos);

    expect(prismaServico.curso.findMany).toHaveBeenCalledWith({
      where: { profissionalId, excluidoEm: null },
      orderBy: { criadoEm: 'desc' },
      select: cursoSelect,
    });
  });

  it('cria curso com dados normalizados e publicadoEm quando publicado', async () => {
    const cursoCriado = {
      id: cursoId,
      titulo: 'Urgência e Emergência',
      slug: 'urgencia',
      status: StatusCurso.PUBLICADO,
    };
    prismaServico.curso.create.mockResolvedValue(cursoCriado);

    await expect(
      servico.criar(profissionalId, {
        titulo: ' Urgência e Emergência ',
        slug: ' URGENCIA ',
        descricao: ' Curso prático ',
        modalidade: ModalidadeCurso.ONLINE,
        precoCentavos: 19990,
        status: StatusCurso.PUBLICADO,
      }),
    ).resolves.toEqual(cursoCriado);

    expect(prismaServico.curso.create).toHaveBeenCalledWith({
      data: {
        profissionalId,
        titulo: 'Urgência e Emergência',
        slug: 'urgencia',
        descricao: 'Curso prático',
        modalidade: ModalidadeCurso.ONLINE,
        precoCentavos: 19990,
        status: StatusCurso.PUBLICADO,
        publicadoEm: expect.any(Date),
      },
      select: cursoSelect,
    });
  });

  it('não permite criar curso já arquivado', async () => {
    await expect(
      servico.criar(profissionalId, {
        titulo: 'Curso',
        slug: 'curso',
        precoCentavos: 0,
        status: StatusCurso.ARQUIVADO,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('converte slug duplicado em ConflictException', async () => {
    prismaServico.curso.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.19.1',
      }),
    );

    await expect(
      servico.criar(profissionalId, {
        titulo: 'Curso',
        slug: 'curso',
        precoCentavos: 0,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('lista módulos após validar curso do tenant', async () => {
    const modulos = [{ id: 'modulo-id', titulo: 'Módulo 1', aulas: [] }];
    prismaServico.curso.findFirst.mockResolvedValue({ id: cursoId });
    prismaServico.moduloCurso.findMany.mockResolvedValue(modulos);

    await expect(servico.listarModulos(profissionalId, cursoId)).resolves.toEqual(modulos);

    expect(prismaServico.curso.findFirst).toHaveBeenCalledWith({
      where: { id: cursoId, profissionalId, excluidoEm: null },
      select: { id: true },
    });
  });

  it('bloqueia módulos de curso inexistente ou de outro tenant', async () => {
    prismaServico.curso.findFirst.mockResolvedValue(null);

    await expect(servico.listarModulos(profissionalId, cursoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('cria módulo na próxima ordem', async () => {
    prismaServico.curso.findFirst.mockResolvedValue({ id: cursoId });
    prismaServico.moduloCurso.count.mockResolvedValue(2);
    prismaServico.moduloCurso.create.mockResolvedValue({ id: 'modulo-id', ordem: 3 });

    await expect(
      servico.criarModulo(profissionalId, cursoId, { titulo: ' Primeiros passos ' }),
    ).resolves.toEqual({ id: 'modulo-id', ordem: 3 });

    expect(prismaServico.moduloCurso.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { cursoId, titulo: 'Primeiros passos', ordem: 3 },
      }),
    );
  });

  it('cria aula validando módulo dentro do curso', async () => {
    prismaServico.curso.findFirst.mockResolvedValue({ id: cursoId });
    prismaServico.moduloCurso.findFirst.mockResolvedValue({ id: 'modulo-id' });
    prismaServico.aulaCurso.count.mockResolvedValue(0);
    prismaServico.aulaCurso.create.mockResolvedValue({ id: 'aula-id', ordem: 1 });

    await expect(
      servico.criarAula(profissionalId, cursoId, 'modulo-id', {
        titulo: ' Aula 1 ',
        descricao: ' Introdução ',
        videoReferencia: ' video-123 ',
        duracaoSegundos: 600,
      }),
    ).resolves.toEqual({ id: 'aula-id', ordem: 1 });

    expect(prismaServico.aulaCurso.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          moduloId: 'modulo-id',
          titulo: 'Aula 1',
          descricao: 'Introdução',
          videoReferencia: 'video-123',
          duracaoSegundos: 600,
          ordem: 1,
        },
      }),
    );
  });

  it('cria inscrição após validar curso e aluno do profissional', async () => {
    const alunoId = '222e4567-e89b-12d3-a456-426614174000';
    const inscricao = {
      id: 'inscricao-id',
      cursoId,
      alunoId,
      criadoEm: new Date(),
      aluno: {
        nome: 'Ana',
        sobrenome: 'Silva',
        email: 'ana@example.com',
      },
    };
    prismaServico.curso.findFirst.mockResolvedValue({ id: cursoId });
    prismaServico.aluno.findFirst.mockResolvedValue({ id: alunoId });
    prismaServico.inscricaoCurso.create.mockResolvedValue(inscricao);

    await expect(servico.criarInscricao(profissionalId, cursoId, { alunoId })).resolves.toEqual(
      inscricao,
    );

    expect(prismaServico.aluno.findFirst).toHaveBeenCalledWith({
      where: { id: alunoId, profissionalId, excluidoEm: null },
      select: { id: true },
    });
    expect(prismaServico.inscricaoCurso.create).toHaveBeenCalledWith({
      data: { profissionalId, cursoId, alunoId },
      select: {
        id: true,
        cursoId: true,
        alunoId: true,
        criadoEm: true,
        aluno: { select: { nome: true, sobrenome: true, email: true } },
      },
    });
  });

  it('bloqueia inscrição de aluno inexistente ou de outro profissional', async () => {
    const alunoId = '222e4567-e89b-12d3-a456-426614174000';
    prismaServico.curso.findFirst.mockResolvedValue({ id: cursoId });
    prismaServico.aluno.findFirst.mockResolvedValue(null);

    await expect(servico.criarInscricao(profissionalId, cursoId, { alunoId })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('converte inscrição duplicada em ConflictException', async () => {
    const alunoId = '222e4567-e89b-12d3-a456-426614174000';
    prismaServico.curso.findFirst.mockResolvedValue({ id: cursoId });
    prismaServico.aluno.findFirst.mockResolvedValue({ id: alunoId });
    prismaServico.inscricaoCurso.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.19.1',
      }),
    );

    await expect(servico.criarInscricao(profissionalId, cursoId, { alunoId })).rejects.toThrow(
      ConflictException,
    );
  });
});
