import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PapelUsuario, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { CadastroProfissionalDto } from './dto/cadastro-profissional.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SairDto } from './dto/sair.dto';

const TOKEN_ACESSO_EXPIRA_EM_SEGUNDOS = 900;
const REFRESH_TOKEN_EXPIRA_EM_SEGUNDOS = 2_592_000;

const CAMPOS_USUARIO_SEGURO = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  profissionalId: true,
  ativo: true,
  criadoEm: true,
} satisfies Prisma.UsuarioSelect;

type UsuarioSeguro = Prisma.UsuarioGetPayload<{
  select: typeof CAMPOS_USUARIO_SEGURO;
}>;

type TokenAcessoResposta = {
  token: string;
  tipo: 'Bearer';
  expiraEmSegundos: number;
};

type RefreshTokenResposta = {
  token: string;
  expiraEmSegundos: number;
};

type RefreshTokenGerado = RefreshTokenResposta & {
  tokenHash: string;
  expiraEm: Date;
};

type RespostaAutenticacao = {
  usuario: UsuarioSeguro;
  acesso: TokenAcessoResposta;
  refreshToken: RefreshTokenResposta;
};

@Injectable()
export class AutenticacaoServico {
  constructor(
    private readonly prisma: PrismaServico,
    private readonly jwtService: JwtService,
  ) {}

  async cadastrarProfissional(dados: CadastroProfissionalDto) {
    const email = dados.email.trim().toLowerCase();
    const slug = dados.slug.trim().toLowerCase();
    const senhaHash = await bcrypt.hash(dados.senha, 12);
    const refreshToken = this.gerarRefreshToken();

    try {
      const resultado = await this.prisma.$transaction(async (transacao) => {
        const usuario = await transacao.usuario.create({
          data: {
            nome: dados.nome.trim(),
            email,
            senhaHash,
            papel: PapelUsuario.PROFISSIONAL,
          },
          select: CAMPOS_USUARIO_SEGURO,
        });

        const profissional = await transacao.profissional.create({
          data: {
            usuarioDonoId: usuario.id,
            nomePublico: dados.nome.trim(),
            slug,
          },
        });

        const usuarioAtualizado = await transacao.usuario.update({
          where: { id: usuario.id },
          data: {
            profissionalId: profissional.id,
          },
          select: CAMPOS_USUARIO_SEGURO,
        });

        await transacao.configuracaoPagina.create({
          data: {
            profissionalId: profissional.id,
          },
        });

        await transacao.refreshToken.create({
          data: {
            usuarioId: usuarioAtualizado.id,
            tokenHash: refreshToken.tokenHash,
            expiraEm: refreshToken.expiraEm,
          },
        });

        return {
          usuario: usuarioAtualizado,
          profissional,
        };
      });

      return {
        profissional: resultado.profissional,
        ...this.montarRespostaAutenticacao(resultado.usuario, refreshToken),
      };
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('E-mail ou endereço da página já está em uso.');
      }

      throw erro;
    }
  }

  async entrar(dados: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email: dados.email.trim().toLowerCase(),
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaValida = await bcrypt.compare(dados.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcessoEm: new Date() },
    });

    const refreshToken = this.gerarRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: refreshToken.tokenHash,
        expiraEm: refreshToken.expiraEm,
      },
    });

    const usuarioSeguro = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      profissionalId: usuario.profissionalId,
      ativo: usuario.ativo,
      criadoEm: usuario.criadoEm,
    };

    return {
      ...this.montarRespostaAutenticacao(usuarioSeguro, refreshToken),
    };
  }

  async buscarSessao(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      select: CAMPOS_USUARIO_SEGURO,
    });

    return {
      usuario,
    };
  }

  async renovarSessao(dados: RefreshTokenDto) {
    const tokenHash = this.gerarHashRefreshToken(dados.refreshToken);

    return this.prisma.$transaction(async (transacao) => {
      const refreshTokenAtual = await transacao.refreshToken.findUnique({
        where: { tokenHash },
        include: {
          usuario: {
            select: CAMPOS_USUARIO_SEGURO,
          },
        },
      });

      if (!refreshTokenAtual || refreshTokenAtual.revogadoEm || refreshTokenAtual.expiraEm <= new Date()) {
        throw new UnauthorizedException('Refresh token inválido.');
      }

      const novoRefreshToken = this.gerarRefreshToken();

      const refreshTokenCriado = await transacao.refreshToken.create({
        data: {
          usuarioId: refreshTokenAtual.usuarioId,
          tokenHash: novoRefreshToken.tokenHash,
          expiraEm: novoRefreshToken.expiraEm,
        },
      });

      await transacao.refreshToken.update({
        where: { id: refreshTokenAtual.id },
        data: {
          revogadoEm: new Date(),
          substituidoPor: refreshTokenCriado.id,
        },
      });

      return this.montarRespostaAutenticacao(refreshTokenAtual.usuario, novoRefreshToken);
    });
  }

  async sair(dados: SairDto) {
    const tokenHash = this.gerarHashRefreshToken(dados.refreshToken);

    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (refreshToken && !refreshToken.revogadoEm) {
      await this.prisma.refreshToken.update({
        where: { id: refreshToken.id },
        data: {
          revogadoEm: new Date(),
        },
      });
    }

    return {
      sucesso: true as const,
    };
  }

  private montarRespostaAutenticacao(
    usuario: UsuarioSeguro,
    refreshToken: RefreshTokenGerado,
  ): RespostaAutenticacao {
    return {
      usuario,
      acesso: this.gerarTokenAcesso(usuario),
      refreshToken: {
        token: refreshToken.token,
        expiraEmSegundos: refreshToken.expiraEmSegundos,
      },
    };
  }

  private gerarTokenAcesso(usuario: {
    id: string;
    email: string;
    papel: PapelUsuario;
    profissionalId: string | null;
  }) {
    const payload: UsuarioAutenticado = {
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
      profissionalId: usuario.profissionalId,
    };

    return {
      token: this.jwtService.sign(payload),
      tipo: 'Bearer' as const,
      expiraEmSegundos: TOKEN_ACESSO_EXPIRA_EM_SEGUNDOS,
    };
  }

  private gerarRefreshToken(): RefreshTokenGerado {
    const token = this.gerarRefreshTokenAleatorioSeguro();
    const tokenHash = this.gerarHashRefreshToken(token);
    const expiraEm = this.calcularExpiracaoRefreshToken();

    return {
      token,
      tokenHash,
      expiraEm,
      expiraEmSegundos: REFRESH_TOKEN_EXPIRA_EM_SEGUNDOS,
    };
  }

  private gerarRefreshTokenAleatorioSeguro(): string {
    return randomBytes(48).toString('base64url');
  }

  private gerarHashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private calcularExpiracaoRefreshToken(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_EXPIRA_EM_SEGUNDOS * 1000);
  }
}
