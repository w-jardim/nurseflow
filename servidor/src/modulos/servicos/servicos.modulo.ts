import { Module } from '@nestjs/common';
import { ServicosControlador } from './servicos.controlador';
import { ServicosServico } from './servicos.servico';

@Module({
  controllers: [ServicosControlador],
  providers: [ServicosServico],
})
export class ServicosModulo {}
