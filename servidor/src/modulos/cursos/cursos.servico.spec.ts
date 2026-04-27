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
      findFirst: jest.fn(),
    },
    aluno: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    inscricaoCurso: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    usuario: {
      create: jest.fn(),
    },
    progressoAula: {
      upsert: jest.fn(),
      count: jest.fn(),
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
    jest.resetAllMocks();
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
    prismaServico.aluno.findFirst.mockResolvedValue({
      id: alunoId,
      nome: 'Ana',
      sobrenome: 'Silva',
      email: 'ana@example.com',
      usuarioId: 'usuario-id',
    });
    prismaServico.inscricaoCurso.create.mockResolvedValue(inscricao);

    await expect(servico.criarInscricao(profissionalId, cursoId, { alunoId })).resolves.toEqual(
      { ...inscricao, acessoAluno: null },
    );

    expect(prismaServico.aluno.findFirst).toHaveBeenCalledWith({
      where: { id: alunoId, profissionalId, excluidoEm: null },
      select: { id: true, nome: true, sobrenome: true, email: true, usuarioId: true },
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
    prismaServico.aluno.findFirst.mockResolvedValue({
      id: alunoId,
      nome: 'Ana',
      sobrenome: 'Silva',
      email: 'ana@example.com',
      usuarioId: 'usuario-id',
    });
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

  it('bloqueia inscrição duplicada antes de criar usuário do aluno', async () => {
    const alunoId = '222e4567-e89b-12d3-a456-426614174000';
    prismaServico.curso.findFirst.mockResolvedValue({ id: cursoId });
    prismaServico.aluno.findFirst.mockResolvedValue({
      id: alunoId,
      nome: 'Ana',
      sobrenome: 'Silva',
      email: 'ana@example.com',
      usuarioId: null,
    });
    prismaServico.inscricaoCurso.findFirst.mockResolvedValue({ id: 'inscricao-existente' });

    await expect(servico.criarInscricao(profissionalId, cursoId, { alunoId })).rejects.toThrow(
      ConflictException,
    );

    expect(prismaServico.usuario.create).not.toHaveBeenCalled();
    expect(prismaServico.inscricaoCurso.create).not.toHaveBeenCalled();
  });

  it('cria usuário de acesso do aluno ao liberar primeira inscrição', async () => {
    const alunoId = '222e4567-e89b-12d3-a456-426614174000';
    const inscricao = {
      id: 'inscricao-id',
      cursoId,
      alunoId,
      criadoEm: new Date(),
      aluno: {
        nome: 'Ana',
        sobrenome: null,
        email: 'ana@example.com',
      },
    };
    prismaServico.curso.findFirst.mockResolvedValue({ id: cursoId });
    prismaServico.aluno.findFirst.mockResolvedValue({
      id: alunoId,
      nome: 'Ana',
      sobrenome: null,
      email: 'ana@example.com',
      usuarioId: null,
    });
    prismaServico.usuario.create.mockResolvedValue({ id: 'usuario-id', email: 'ana@example.com' });
    prismaServico.aluno.update.mockResolvedValue({ id: alunoId });
    prismaServico.inscricaoCurso.create.mockResolvedValue(inscricao);

    const resultado = await servico.criarInscricao(profissionalId, cursoId, { alunoId });

    expect(resultado.acessoAluno).toEqual({
      email: 'ana@example.com',
      senhaTemporaria: expect.any(String),
      criadoAgora: true,
    });
    expect(prismaServico.usuario.create).toHaveBeenCalledWith({
      data: {
        nome: 'Ana',
        email: 'ana@example.com',
        senhaHash: expect.any(String),
        papel: 'ALUNO',
        profissionalId,
      },
      select: {
        id: true,
        email: true,
      },
    });
    expect(prismaServico.aluno.update).toHaveBeenCalledWith({
      where: { id: alunoId },
      data: { usuarioId: 'usuario-id' },
    });
  });

  it('lista cursos publicados do aluno autenticado', async () => {
    const inscricoes = [{ id: 'inscricao-id', curso: { id: cursoId, titulo: 'Curso' } }];
    prismaServico.inscricaoCurso.findMany.mockResolvedValue(inscricoes);

    await expect(servico.listarCursosDoAluno('usuario-id')).resolves.toEqual(inscricoes);

    expect(prismaServico.inscricaoCurso.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          aluno: { usuarioId: 'usuario-id', excluidoEm: null },
          curso: { status: StatusCurso.PUBLICADO, excluidoEm: null },
        },
      }),
    );
  });

  it('bloqueia conteúdo de curso sem inscrição do aluno', async () => {
    prismaServico.inscricaoCurso.findFirst.mockResolvedValue(null);

    await expect(servico.obterCursoDoAluno('usuario-id', cursoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('marca aula do aluno como concluída e conclui curso quando todas as aulas terminam', async () => {
    const atualizadoEm = new Date();
    const concluidoEm = new Date();
    prismaServico.inscricaoCurso.findFirst.mockResolvedValue({
      id: 'inscricao-id',
      concluidoEm: null,
    });
    prismaServico.aulaCurso.findFirst.mockResolvedValue({ id: 'aula-id' });
    prismaServico.progressoAula.upsert.mockResolvedValue({
      id: 'progresso-id',
      aulaId: 'aula-id',
      concluida: true,
      atualizadoEm,
    });
    prismaServico.aulaCurso.count.mockResolvedValue(2);
    prismaServico.progressoAula.count.mockResolvedValue(2);
    prismaServico.inscricaoCurso.update.mockResolvedValue({ concluidoEm });

    await expect(
      servico.atualizarProgressoAulaDoAluno('usuario-id', cursoId, 'aula-id', true),
    ).resolves.toEqual({
      id: 'progresso-id',
      aulaId: 'aula-id',
      concluida: true,
      atualizadoEm,
      cursoConcluido: true,
      concluidoEm,
    });

    expect(prismaServico.progressoAula.upsert).toHaveBeenCalledWith({
      where: {
        inscricaoId_aulaId: {
          inscricaoId: 'inscricao-id',
          aulaId: 'aula-id',
        },
      },
      update: {
        concluida: true,
      },
      create: {
        inscricaoId: 'inscricao-id',
        aulaId: 'aula-id',
        concluida: true,
      },
      select: {
        id: true,
        aulaId: true,
        concluida: true,
        atualizadoEm: true,
      },
    });
    expect(prismaServico.inscricaoCurso.update).toHaveBeenCalledWith({
      where: {
        id: 'inscricao-id',
      },
      data: {
        concluidoEm: expect.any(Date),
      },
      select: {
        concluidoEm: true,
      },
    });
  });

  it('bloqueia progresso de aula fora do curso inscrito', async () => {
    prismaServico.inscricaoCurso.findFirst.mockResolvedValue({
      id: 'inscricao-id',
      concluidoEm: null,
    });
    prismaServico.aulaCurso.findFirst.mockResolvedValue(null);

    await expect(
      servico.atualizarProgressoAulaDoAluno('usuario-id', cursoId, 'aula-id', true),
    ).rejects.toThrow(NotFoundException);

    expect(prismaServico.progressoAula.upsert).not.toHaveBeenCalled();
  });
});
