import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AuditoriaServico } from '../auditoria/auditoria.servico';
import { CriarPacienteDto } from './dto/criar-paciente.dto';
import { PacientesServico } from './pacientes.servico';

@Controller('pacientes')
@UseGuards(JwtAuthGuarda)
export class PacientesControlador {
  constructor(
    private readonly pacientesServico: PacientesServico,
    private readonly auditoriaServico: AuditoriaServico,
  ) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.pacientesServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  async criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarPacienteDto) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const paciente = await this.pacientesServico.criar(profissionalId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'paciente.criado',
      entidade: 'Paciente',
      entidadeId: paciente.id,
    });

    return paciente;
  }
}
