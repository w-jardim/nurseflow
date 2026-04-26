import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AuditoriaServico } from '../auditoria/auditoria.servico';
import { ConsultoriasServico } from './consultorias.servico';
import { CriarConsultoriaDto } from './dto/criar-consultoria.dto';

@Controller('consultorias')
@UseGuards(JwtAuthGuarda)
export class ConsultoriasControlador {
  constructor(
    private readonly consultoriasServico: ConsultoriasServico,
    private readonly auditoriaServico: AuditoriaServico,
  ) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.consultoriasServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  async criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarConsultoriaDto) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const consultoria = await this.consultoriasServico.criar(profissionalId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'consultoria.criada',
      entidade: 'Consultoria',
      entidadeId: consultoria.id,
      metadados: {
        modalidade: consultoria.modalidade,
      },
    });

    return consultoria;
  }
}
