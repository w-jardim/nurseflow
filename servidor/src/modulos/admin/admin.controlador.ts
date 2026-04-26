import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import { Papeis } from '../../comum/decoradores/papeis.decorador';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import { PapeisGuarda } from '../../comum/guardas/papeis.guarda';
import { AdminServico } from './admin.servico';

@Controller('admin')
@UseGuards(JwtAuthGuarda, PapeisGuarda)
@Papeis(PapelUsuario.SUPER_ADMIN)
export class AdminControlador {
  constructor(private readonly adminServico: AdminServico) {}

  @Get('metricas')
  buscarMetricas() {
    return this.adminServico.buscarMetricas();
  }

  @Get('profissionais')
  listarProfissionais(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number,
  ) {
    return this.adminServico.listarProfissionais(pagina, Math.min(limite, 100));
  }

  @Get('profissionais/:id')
  buscarProfissional(@Param('id') id: string) {
    return this.adminServico.buscarProfissional(id);
  }
}
