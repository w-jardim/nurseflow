import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AlunosServico } from './alunos.servico';
import { CriarAlunoDto } from './dto/criar-aluno.dto';

@Controller('alunos')
@UseGuards(JwtAuthGuarda)
export class AlunosControlador {
  constructor(private readonly alunosServico: AlunosServico) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.alunosServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarAlunoDto) {
    return this.alunosServico.criar(obterTenantObrigatorio(usuario), dados);
  }
}
