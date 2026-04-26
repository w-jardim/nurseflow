import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AuditoriaServico } from '../auditoria/auditoria.servico';
import { AlunosServico } from './alunos.servico';
import { CriarAlunoDto } from './dto/criar-aluno.dto';

@Controller('alunos')
@UseGuards(JwtAuthGuarda)
export class AlunosControlador {
  constructor(
    private readonly alunosServico: AlunosServico,
    private readonly auditoriaServico: AuditoriaServico,
  ) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.alunosServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  async criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarAlunoDto) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const aluno = await this.alunosServico.criar(profissionalId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'aluno.criado',
      entidade: 'Aluno',
      entidadeId: aluno.id,
    });

    return aluno;
  }
}
