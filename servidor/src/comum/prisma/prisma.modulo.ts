import { Global, Module } from '@nestjs/common';
import { PrismaServico } from './prisma.servico';

@Global()
@Module({
  providers: [PrismaServico],
  exports: [PrismaServico],
})
export class PrismaModulo {}
