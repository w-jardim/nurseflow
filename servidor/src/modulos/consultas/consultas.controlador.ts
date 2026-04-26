import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { ConsultasServico } from './consultas.servico';
import { CriarConsultaDto } from './dto/criar-consulta.dto';

@Controller('consultas')
@UseGuards(JwtAuthGuarda)
export class ConsultasControlador {
  constructor(private readonly consultasServico: ConsultasServico) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.consultasServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarConsultaDto) {
    return this.consultasServico.criar(obterTenantObrigatorio(usuario), dados);
  }
}
