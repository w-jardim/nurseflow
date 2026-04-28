import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PapelUsuario, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import { AutenticacaoServico } from './autenticacao.servico';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AutenticacaoServico', () => {
  let servico: AutenticacaoServico;

  const prismaServico = {
    $transaction: jest.fn(),
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtServico = {
    sign: jest.fn(),
  };

  const usuarioSeguro = {
    id: 'usuario-id',
    nome: 'Monique Silva',
    email: 'monique@example.com',
    papel: PapelUsuario.PROFISSIONAL,
    profissionalId: 'profissional-id',
    ativo: true,
    criadoEm: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    servico = new AutenticacaoServico(
      prismaServico as unknown as PrismaServico,
      jwtServico as unknown as JwtService,
    );
    jest.clearAllMocks();
    jest.mocked(bcrypt.hash).mockResolvedValue('senha-hash' as never);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jwtServico.sign.mockReturnValue('token-jwt');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('cadastra profissional e cria configuração inicial em transação', async () => {
    const profissional = {
      id: 'profissional-id',
      usuarioDonoId: 'usuario-id',
      nomePublico: 'Monique Silva',
      slug: 'monique',
    };
    const transacao = {
      usuario: {
        create: jest.fn().mockResolvedValue({ ...usuarioSeguro, profissionalId: null }),
        update: jest.fn().mockResolvedValue(usuarioSeguro),
      },
      profissional: {
        create: jest.fn().mockResolvedValue(profissional),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'refresh-token-id' }),
      },
      configuracaoPagina: {
        create: jest.fn().mockResolvedValue({ id: 'config-id' }),
      },
    };
    prismaServico.$transaction.mockImplementation((callback) => callback(transacao));

    const resultado = await servico.cadastrarProfissional({
      nome: ' Monique Silva ',
      email: ' MONIQUE@EXAMPLE.COM ',
      senha: 'Senha@123',
      slug: ' MONIQUE ',
    });

    expect(resultado).toEqual({
      usuario: usuarioSeguro,
      profissional,
      acesso: {
        token: 'token-jwt',
        tipo: 'Bearer',
        expiraEmSegundos: 900,
      },
      refreshToken: {
        token: expect.any(String),
        expiraEmSegundos: 2592000,
      },
    });
    expect(transacao.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nome: 'Monique Silva',
          email: 'monique@example.com',
          senhaHash: 'senha-hash',
          papel: PapelUsuario.PROFISSIONAL,
        }),
      }),
    );
    expect(transacao.profissional.create).toHaveBeenCalledWith({
      data: {
        usuarioDonoId: 'usuario-id',
        nomePublico: 'Monique Silva',
        slug: 'monique',
      },
    });
    expect(transacao.refreshToken.create).toHaveBeenCalledWith({
      data: {
        usuarioId: usuarioSeguro.id,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiraEm: expect.any(Date),
      },
    });
  });

  it('converte conflito de email ou slug em ConflictException', async () => {
    prismaServico.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.19.1',
      }),
    );

    await expect(
      servico.cadastrarProfissional({
        nome: 'Monique Silva',
        email: 'monique@example.com',
        senha: 'Senha@123',
        slug: 'monique',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('entra com credenciais válidas', async () => {
    prismaServico.usuario.findUnique.mockResolvedValue({
      ...usuarioSeguro,
      senhaHash: 'senha-hash',
    });
    prismaServico.usuario.update.mockResolvedValue(usuarioSeguro);

    const resultado = await servico.entrar({
      email: ' MONIQUE@EXAMPLE.COM ',
      senha: 'Senha@123',
    });

    expect(resultado.usuario).toEqual(usuarioSeguro);
    expect(resultado.acesso.token).toBe('token-jwt');
    expect(resultado.refreshToken).toEqual({
      token: expect.any(String),
      expiraEmSegundos: 2592000,
    });
    expect(prismaServico.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'monique@example.com' },
    });
    expect(prismaServico.usuario.update).toHaveBeenCalledWith({
      where: { id: usuarioSeguro.id },
      data: { ultimoAcessoEm: expect.any(Date) },
    });
    expect(prismaServico.refreshToken.create).toHaveBeenCalledWith({
      data: {
        usuarioId: usuarioSeguro.id,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiraEm: expect.any(Date),
      },
    });
  });

  it('bloqueia credenciais inválidas sem revelar motivo', async () => {
    prismaServico.usuario.findUnique.mockResolvedValue(null);

    await expect(
      servico.entrar({ email: 'inexistente@example.com', senha: 'Senha@123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('busca sessão segura pelo id do usuário', async () => {
    prismaServico.usuario.findUniqueOrThrow.mockResolvedValue(usuarioSeguro);

    await expect(servico.buscarSessao(usuarioSeguro.id)).resolves.toEqual({
      usuario: usuarioSeguro,
    });
  });

  it('renova a sessão com rotação de refresh token', async () => {
    const refreshTokenAtual = {
      id: 'refresh-token-atual-id',
      usuarioId: usuarioSeguro.id,
      tokenHash: 'hash-antigo',
      expiraEm: new Date('2026-12-01T00:00:00.000Z'),
      revogadoEm: null,
      substituidoPor: null,
      criadoEm: new Date('2026-01-01T00:00:00.000Z'),
      usuario: usuarioSeguro,
    };
    const transacao = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue(refreshTokenAtual),
        create: jest.fn().mockResolvedValue({ id: 'refresh-token-novo-id' }),
        update: jest.fn().mockResolvedValue({ id: refreshTokenAtual.id }),
      },
    };
    prismaServico.$transaction.mockImplementation((callback) => callback(transacao));

    const resultado = await servico.renovarSessao({
      refreshToken: 'refresh-token-puro-valido',
    });

    expect(resultado).toEqual({
      usuario: usuarioSeguro,
      acesso: {
        token: 'token-jwt',
        tipo: 'Bearer',
        expiraEmSegundos: 900,
      },
      refreshToken: {
        token: expect.any(String),
        expiraEmSegundos: 2592000,
      },
    });
    expect(transacao.refreshToken.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            papel: true,
            profissionalId: true,
            ativo: true,
            criadoEm: true,
          },
        },
      },
    });
    expect(transacao.refreshToken.create).toHaveBeenCalledWith({
      data: {
        usuarioId: usuarioSeguro.id,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiraEm: expect.any(Date),
      },
    });
    expect(transacao.refreshToken.update).toHaveBeenCalledWith({
      where: { id: refreshTokenAtual.id },
      data: {
        revogadoEm: expect.any(Date),
        substituidoPor: 'refresh-token-novo-id',
      },
    });
  });

  it('rejeita refresh token inexistente', async () => {
    const transacao = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    prismaServico.$transaction.mockImplementation((callback) => callback(transacao));

    await expect(
      servico.renovarSessao({
        refreshToken: 'refresh-token-invalido',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita refresh token revogado', async () => {
    const transacao = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'refresh-token-revogado-id',
          usuarioId: usuarioSeguro.id,
          tokenHash: 'hash-revogado',
          expiraEm: new Date('2026-12-01T00:00:00.000Z'),
          revogadoEm: new Date('2026-02-01T00:00:00.000Z'),
          substituidoPor: null,
          criadoEm: new Date('2026-01-01T00:00:00.000Z'),
          usuario: usuarioSeguro,
        }),
      },
    };
    prismaServico.$transaction.mockImplementation((callback) => callback(transacao));

    await expect(
      servico.renovarSessao({
        refreshToken: 'refresh-token-revogado',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita refresh token expirado', async () => {
    const transacao = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'refresh-token-expirado-id',
          usuarioId: usuarioSeguro.id,
          tokenHash: 'hash-expirado',
          expiraEm: new Date('2025-01-01T00:00:00.000Z'),
          revogadoEm: null,
          substituidoPor: null,
          criadoEm: new Date('2024-01-01T00:00:00.000Z'),
          usuario: usuarioSeguro,
        }),
      },
    };
    prismaServico.$transaction.mockImplementation((callback) => callback(transacao));

    await expect(
      servico.renovarSessao({
        refreshToken: 'refresh-token-expirado',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('revoga refresh token ativo ao sair', async () => {
    prismaServico.refreshToken.findUnique.mockResolvedValue({
      id: 'refresh-token-ativo-id',
      usuarioId: usuarioSeguro.id,
      tokenHash: 'hash-ativo',
      expiraEm: new Date('2026-12-01T00:00:00.000Z'),
      revogadoEm: null,
      substituidoPor: null,
      criadoEm: new Date('2026-01-01T00:00:00.000Z'),
    });
    prismaServico.refreshToken.update.mockResolvedValue({
      id: 'refresh-token-ativo-id',
    });

    await expect(
      servico.sair({
        refreshToken: 'refresh-token-ativo',
      }),
    ).resolves.toEqual({ sucesso: true });

    expect(prismaServico.refreshToken.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
    });
    expect(prismaServico.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'refresh-token-ativo-id' },
      data: {
        revogadoEm: expect.any(Date),
      },
    });
  });

  it('retorna sucesso ao sair com refresh token inexistente', async () => {
    prismaServico.refreshToken.findUnique.mockResolvedValue(null);

    await expect(
      servico.sair({
        refreshToken: 'refresh-token-inexistente',
      }),
    ).resolves.toEqual({ sucesso: true });

    expect(prismaServico.refreshToken.update).not.toHaveBeenCalled();
  });

  it('retorna sucesso ao sair com refresh token já revogado', async () => {
    prismaServico.refreshToken.findUnique.mockResolvedValue({
      id: 'refresh-token-revogado-id',
      usuarioId: usuarioSeguro.id,
      tokenHash: 'hash-revogado',
      expiraEm: new Date('2026-12-01T00:00:00.000Z'),
      revogadoEm: new Date('2026-02-01T00:00:00.000Z'),
      substituidoPor: null,
      criadoEm: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(
      servico.sair({
        refreshToken: 'refresh-token-ja-revogado',
      }),
    ).resolves.toEqual({ sucesso: true });

    expect(prismaServico.refreshToken.update).not.toHaveBeenCalled();
  });
});
