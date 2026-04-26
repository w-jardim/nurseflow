import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AuditoriaServico } from './auditoria.servico';

@Controller('auditoria')
@UseGuards(JwtAuthGuarda)
export class AuditoriaControlador {
  constructor(private readonly auditoriaServico: AuditoriaServico) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.auditoriaServico.listar(obterTenantObrigatorio(usuario));
  }
}
