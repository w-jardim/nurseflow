import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import { Papeis } from '../../comum/decoradores/papeis.decorador';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import { PapeisGuarda } from '../../comum/guardas/papeis.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AuditoriaServico } from '../auditoria/auditoria.servico';
import { ConsultasServico } from './consultas.servico';
import { CriarConsultaDto } from './dto/criar-consulta.dto';

@Controller('consultas')
@UseGuards(JwtAuthGuarda, PapeisGuarda)
@Papeis(PapelUsuario.PROFISSIONAL)
export class ConsultasControlador {
  constructor(
    private readonly consultasServico: ConsultasServico,
    private readonly auditoriaServico: AuditoriaServico,
  ) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.consultasServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  async criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarConsultaDto) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const consulta = await this.consultasServico.criar(profissionalId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'consulta.criada',
      entidade: 'Consulta',
      entidadeId: consulta.id,
      metadados: {
        status: consulta.status,
      },
    });

    return consulta;
  }
}
