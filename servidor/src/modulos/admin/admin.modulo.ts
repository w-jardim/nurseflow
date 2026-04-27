import { Module } from '@nestjs/common';
import { PrismaModulo } from '../../comum/prisma/prisma.modulo';
import { AdminControlador } from './admin.controlador';
import { AdminServico } from './admin.servico';

@Module({
  imports: [PrismaModulo],
  controllers: [AdminControlador],
  providers: [AdminServico],
})
export class AdminModulo {}
