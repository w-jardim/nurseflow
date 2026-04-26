import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PapelUsuario, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaServico } from '../../comum/prisma/prisma.servico';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { CadastroProfissionalDto } from './dto/cadastro-profissional.dto';
import { LoginDto } from './dto/login.dto';

const CAMPOS_USUARIO_SEGURO = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  profissionalId: true,
  ativo: true,
  criadoEm: true,
} satisfies Prisma.UsuarioSelect;

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

        return {
          usuario: usuarioAtualizado,
          profissional,
        };
      });

      return {
        usuario: resultado.usuario,
        profissional: resultado.profissional,
        acesso: this.gerarToken(resultado.usuario),
      };
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('E-mail ou slug ja esta em uso.');
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
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const senhaValida = await bcrypt.compare(dados.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcessoEm: new Date() },
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
      usuario: usuarioSeguro,
      acesso: this.gerarToken(usuarioSeguro),
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

  private gerarToken(usuario: {
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
      tipo: 'Bearer',
      expiraEmSegundos: 900,
    };
  }
}
