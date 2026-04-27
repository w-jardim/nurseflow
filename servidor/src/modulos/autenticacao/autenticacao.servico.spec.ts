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
    expect(prismaServico.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'monique@example.com' },
    });
    expect(prismaServico.usuario.update).toHaveBeenCalledWith({
      where: { id: usuarioSeguro.id },
      data: { ultimoAcessoEm: expect.any(Date) },
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
});
