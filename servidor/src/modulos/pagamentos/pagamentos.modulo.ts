import { Module } from '@nestjs/common';
import { PrismaModulo } from '../../comum/prisma/prisma.modulo';
import { PagamentosControlador } from './pagamentos.controlador';
import { PagamentosServico } from './pagamentos.servico';
import { WebhookControlador } from './webhook.controlador';

@Module({
  imports: [PrismaModulo],
  controllers: [PagamentosControlador, WebhookControlador],
  providers: [PagamentosServico],
})
export class PagamentosModulo {}
