import { Module } from '@nestjs/common';
import { AgendamentosControlador } from './agendamentos.controlador';
import { AgendamentosServico } from './agendamentos.servico';

@Module({
  controllers: [AgendamentosControlador],
  providers: [AgendamentosServico],
})
export class AgendamentosModulo {}
