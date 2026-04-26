import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AtualizarPerfilProfissionalDto } from './dto/atualizar-perfil-profissional.dto';
import { ProfissionaisServico } from './profissionais.servico';

@Controller()
export class ProfissionaisControlador {
  constructor(private readonly profissionaisServico: ProfissionaisServico) {}

  @Get('profissionais/me')
  @UseGuards(JwtAuthGuarda)
  buscarMeuPerfil(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.profissionaisServico.buscarPerfilPrivado(obterTenantObrigatorio(usuario));
  }

  @Put('profissionais/me')
  @UseGuards(JwtAuthGuarda)
  atualizarMeuPerfil(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dados: AtualizarPerfilProfissionalDto,
  ) {
    return this.profissionaisServico.atualizarPerfil(obterTenantObrigatorio(usuario), dados);
  }

  @Get('publico/profissionais/:slug')
  buscarPaginaPublica(@Param('slug') slug: string) {
    return this.profissionaisServico.buscarPaginaPublica(slug);
  }
}
