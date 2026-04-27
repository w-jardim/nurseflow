import { Module } from '@nestjs/common';
import { ConsultasControlador } from './consultas.controlador';
import { ConsultasServico } from './consultas.servico';

@Module({
  controllers: [ConsultasControlador],
  providers: [ConsultasServico],
})
export class ConsultasModulo {}
