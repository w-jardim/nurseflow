import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppControlador } from './app.controlador';
import { PrismaModulo } from './comum/prisma/prisma.modulo';
import { TenantInterceptor } from './comum/interceptadores/tenant.interceptor';
import { AlunosModulo } from './modulos/alunos/alunos.modulo';
import { AutenticacaoModulo } from './modulos/autenticacao/autenticacao.modulo';
import { ConsultoriasModulo } from './modulos/consultorias/consultorias.modulo';
import { CursosModulo } from './modulos/cursos/cursos.modulo';
import { PacientesModulo } from './modulos/pacientes/pacientes.modulo';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModulo,
    AutenticacaoModulo,
    AlunosModulo,
    PacientesModulo,
    CursosModulo,
    ConsultoriasModulo,
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
