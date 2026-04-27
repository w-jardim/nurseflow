import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import { Papeis } from '../../comum/decoradores/papeis.decorador';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import { PapeisGuarda } from '../../comum/guardas/papeis.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AuditoriaServico } from '../auditoria/auditoria.servico';
import { AtualizarPerfilProfissionalDto } from './dto/atualizar-perfil-profissional.dto';
import { ProfissionaisServico } from './profissionais.servico';

@Controller()
export class ProfissionaisControlador {
  constructor(
    private readonly profissionaisServico: ProfissionaisServico,
    private readonly auditoriaServico: AuditoriaServico,
  ) {}

  @Get('profissionais/me')
  @UseGuards(JwtAuthGuarda, PapeisGuarda)
  @Papeis(PapelUsuario.PROFISSIONAL)
  buscarMeuPerfil(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.profissionaisServico.buscarPerfilPrivado(obterTenantObrigatorio(usuario));
  }

  @Put('profissionais/me')
  @UseGuards(JwtAuthGuarda, PapeisGuarda)
  @Papeis(PapelUsuario.PROFISSIONAL)
  async atualizarMeuPerfil(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dados: AtualizarPerfilProfissionalDto,
  ) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const perfil = await this.profissionaisServico.atualizarPerfil(profissionalId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'profissional.perfil_atualizado',
      entidade: 'Profissional',
      entidadeId: perfil.id,
    });

    return perfil;
  }

  @Get('publico/profissionais/:slug')
  buscarPaginaPublica(@Param('slug') slug: string) {
    return this.profissionaisServico.buscarPaginaPublica(slug);
  }
}
