import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import { Papeis } from '../../comum/decoradores/papeis.decorador';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import { PapeisGuarda } from '../../comum/guardas/papeis.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { CriarAssinaturaDto } from './dto/criar-assinatura.dto';
import { PagamentosServico } from './pagamentos.servico';

@Controller('pagamentos')
@UseGuards(JwtAuthGuarda, PapeisGuarda)
@Papeis(PapelUsuario.PROFISSIONAL)
export class PagamentosControlador {
  constructor(private readonly pagamentosServico: PagamentosServico) {}

  @Post('assinatura')
  criarAssinatura(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dados: CriarAssinaturaDto,
  ) {
    if (!usuario.profissionalId) throw new ForbiddenException();
    return this.pagamentosServico.criarAssinatura(usuario.profissionalId, dados.plano);
  }

  @Get('assinatura')
  buscarAssinatura(@UsuarioAtual() usuario: UsuarioAutenticado) {
    if (!usuario.profissionalId) throw new ForbiddenException();
    return this.pagamentosServico.buscarAssinatura(usuario.profissionalId);
  }

}
