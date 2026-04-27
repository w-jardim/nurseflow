import { Module } from '@nestjs/common';
import { ProfissionaisControlador } from './profissionais.controlador';
import { ProfissionaisServico } from './profissionais.servico';

@Module({
  controllers: [ProfissionaisControlador],
  providers: [ProfissionaisServico],
})
export class ProfissionaisModulo {}
