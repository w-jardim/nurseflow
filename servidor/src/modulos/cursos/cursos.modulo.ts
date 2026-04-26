import { Module } from '@nestjs/common';
import { CursosControlador } from './cursos.controlador';
import { CursosServico } from './cursos.servico';
import { PortalAlunoCursosControlador } from './portal-aluno-cursos.controlador';

@Module({
  controllers: [CursosControlador, PortalAlunoCursosControlador],
  providers: [CursosServico],
})
export class CursosModulo {}
