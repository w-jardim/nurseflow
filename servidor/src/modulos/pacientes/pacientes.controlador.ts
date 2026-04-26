import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { CriarPacienteDto } from './dto/criar-paciente.dto';
import { PacientesServico } from './pacientes.servico';

@Controller('pacientes')
@UseGuards(JwtAuthGuarda)
export class PacientesControlador {
  constructor(private readonly pacientesServico: PacientesServico) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.pacientesServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarPacienteDto) {
    return this.pacientesServico.criar(obterTenantObrigatorio(usuario), dados);
  }
}
