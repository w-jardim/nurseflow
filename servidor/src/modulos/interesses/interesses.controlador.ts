import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { CriarInteressePublicoDto } from './dto/criar-interesse-publico.dto';
import { InteressesServico } from './interesses.servico';

@Controller()
export class InteressesControlador {
  constructor(private readonly interessesServico: InteressesServico) {}

  @Get('interesses')
  @UseGuards(JwtAuthGuarda)
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.interessesServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post('publico/profissionais/:slug/interesses')
  criarPublico(@Param('slug') slug: string, @Body() dados: CriarInteressePublicoDto) {
    return this.interessesServico.criarPublico(slug, dados);
  }
}
