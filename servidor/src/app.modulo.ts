import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppControlador } from './app.controlador';
import { PrismaModulo } from './comum/prisma/prisma.modulo';
import { TenantInterceptor } from './comum/interceptadores/tenant.interceptor';
import { AutenticacaoModulo } from './modulos/autenticacao/autenticacao.modulo';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModulo,
    AutenticacaoModulo,
  ],
  controllers: [AppControlador],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModulo {}
