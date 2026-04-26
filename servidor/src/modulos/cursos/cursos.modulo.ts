import { Module } from '@nestjs/common';
import { CursosControlador } from './cursos.controlador';
import { CursosServico } from './cursos.servico';

@Module({
  controllers: [CursosControlador],
  providers: [CursosServico],
})
export class CursosModulo {}
