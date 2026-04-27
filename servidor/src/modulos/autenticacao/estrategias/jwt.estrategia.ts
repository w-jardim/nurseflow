import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaServico } from '../../../comum/prisma/prisma.servico';
import type { UsuarioAutenticado } from '../../../comum/tipos/requisicao-autenticada';

@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configuracao: ConfigService,
    private readonly prisma: PrismaServico,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuracao.get<string>('JWT_SEGREDO', 'segredo-local-dev'),
    });
  }

  async validate(payload: UsuarioAutenticado): Promise<UsuarioAutenticado> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        papel: true,
        profissionalId: true,
        ativo: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Sessão inválida.');
    }

    return {
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
      profissionalId: usuario.profissionalId,
    };
  }
}
