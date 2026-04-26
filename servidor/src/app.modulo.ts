import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppControlador } from './app.controlador';
import { PrismaModulo } from './comum/prisma/prisma.modulo';
import { TenantInterceptor } from './comum/interceptadores/tenant.interceptor';
import { AdminModulo } from './modulos/admin/admin.modulo';
import { AlunosModulo } from './modulos/alunos/alunos.modulo';
import { AuditoriaModulo } from './modulos/auditoria/auditoria.modulo';
import { AutenticacaoModulo } from './modulos/autenticacao/autenticacao.modulo';
import { ConsultoriasModulo } from './modulos/consultorias/consultorias.modulo';
import { ConsultasModulo } from './modulos/consultas/consultas.modulo';
import { CursosModulo } from './modulos/cursos/cursos.modulo';
import { InteressesModulo } from './modulos/interesses/interesses.modulo';
import { PacientesModulo } from './modulos/pacientes/pacientes.modulo';
import { PagamentosModulo } from './modulos/pagamentos/pagamentos.modulo';
import { ProfissionaisModulo } from './modulos/profissionais/profissionais.modulo';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
    ]),
    PrismaModulo,
    AuditoriaModulo,
    AutenticacaoModulo,
    AlunosModulo,
    PacientesModulo,
    CursosModulo,
    ConsultoriasModulo,
    ConsultasModulo,
    ProfissionaisModulo,
    InteressesModulo,
    PagamentosModulo,
    AdminModulo,
  ],
  controllers: [AppControlador],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModulo {}
