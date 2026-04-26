import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AutenticacaoControlador } from './autenticacao.controlador';
import { AutenticacaoServico } from './autenticacao.servico';
import { JwtEstrategia } from './estrategias/jwt.estrategia';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configuracao: ConfigService) => ({
        secret: configuracao.get<string>('JWT_SEGREDO', 'segredo-local-dev'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [AutenticacaoControlador],
  providers: [AutenticacaoServico, JwtEstrategia],
})
export class AutenticacaoModulo {}
