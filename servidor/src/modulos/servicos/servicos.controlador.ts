import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import { Papeis } from '../../comum/decoradores/papeis.decorador';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import { PapeisGuarda } from '../../comum/guardas/papeis.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AuditoriaServico } from '../auditoria/auditoria.servico';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { ServicosServico } from './servicos.servico';

@Controller('servicos')
@UseGuards(JwtAuthGuarda, PapeisGuarda)
@Papeis(PapelUsuario.PROFISSIONAL)
export class ServicosControlador {
  constructor(
    private readonly servicosServico: ServicosServico,
    private readonly auditoriaServico: AuditoriaServico,
  ) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.servicosServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  async criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarServicoDto) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const servico = await this.servicosServico.criar(profissionalId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'servico.criado',
      entidade: 'Servico',
      entidadeId: servico.id,
      metadados: {
        publicado: servico.publicado,
        exibirPreco: servico.exibirPreco,
      },
    });

    return servico;
  }

  @Put(':servicoId')
  async atualizar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('servicoId') servicoId: string,
    @Body() dados: AtualizarServicoDto,
  ) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const servico = await this.servicosServico.atualizar(profissionalId, servicoId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'servico.atualizado',
      entidade: 'Servico',
      entidadeId: servico.id,
      metadados: {
        publicado: servico.publicado,
        exibirPreco: servico.exibirPreco,
      },
    });

    return servico;
  }

  @Delete(':servicoId')
  async excluir(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('servicoId') servicoId: string) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const servico = await this.servicosServico.excluir(profissionalId, servicoId);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'servico.excluido',
      entidade: 'Servico',
      entidadeId: servico.id,
    });

    return { id: servico.id };
  }
}
