import { Module } from '@nestjs/common';
import { ConsultoriasControlador } from './consultorias.controlador';
import { ConsultoriasServico } from './consultorias.servico';

@Module({
  controllers: [ConsultoriasControlador],
  providers: [ConsultoriasServico],
})
export class ConsultoriasModulo {}
