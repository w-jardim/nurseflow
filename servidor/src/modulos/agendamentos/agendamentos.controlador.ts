import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import { Papeis } from '../../comum/decoradores/papeis.decorador';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import { PapeisGuarda } from '../../comum/guardas/papeis.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AgendamentosServico } from './agendamentos.servico';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';

@Controller()
export class AgendamentosControlador {
  constructor(private readonly agendamentosServico: AgendamentosServico) {}

  @Get('agendamentos')
  @UseGuards(JwtAuthGuarda, PapeisGuarda)
  @Papeis(PapelUsuario.PROFISSIONAL)
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.agendamentosServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post('publico/profissionais/:slug/agendamentos')
  criarPublico(@Param('slug') slug: string, @Body() dados: CriarSolicitacaoDto) {
    return this.agendamentosServico.criarPublico(slug, dados);
  }

  @Patch('agendamentos/:id')
  @UseGuards(JwtAuthGuarda, PapeisGuarda)
  @Papeis(PapelUsuario.PROFISSIONAL)
  atualizarStatus(
    @Param('id') id: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dados: AtualizarStatusDto,
  ) {
    return this.agendamentosServico.atualizarStatus(id, obterTenantObrigatorio(usuario), dados);
  }
}
