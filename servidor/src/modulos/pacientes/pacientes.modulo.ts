import { Module } from '@nestjs/common';
import { PacientesControlador } from './pacientes.controlador';
import { PacientesServico } from './pacientes.servico';

@Module({
  controllers: [PacientesControlador],
  providers: [PacientesServico],
})
export class PacientesModulo {}
