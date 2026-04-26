import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { ConsultoriasServico } from './consultorias.servico';
import { CriarConsultoriaDto } from './dto/criar-consultoria.dto';

@Controller('consultorias')
@UseGuards(JwtAuthGuarda)
export class ConsultoriasControlador {
  constructor(private readonly consultoriasServico: ConsultoriasServico) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.consultoriasServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarConsultoriaDto) {
    return this.consultoriasServico.criar(obterTenantObrigatorio(usuario), dados);
  }
}
