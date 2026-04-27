import { Module } from '@nestjs/common';
import { AlunosControlador } from './alunos.controlador';
import { AlunosServico } from './alunos.servico';

@Module({
  controllers: [AlunosControlador],
  providers: [AlunosServico],
})
export class AlunosModulo {}
