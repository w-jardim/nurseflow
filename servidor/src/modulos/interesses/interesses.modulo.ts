import { Module } from '@nestjs/common';
import { InteressesControlador } from './interesses.controlador';
import { InteressesServico } from './interesses.servico';

@Module({
  controllers: [InteressesControlador],
  providers: [InteressesServico],
})
export class InteressesModulo {}
