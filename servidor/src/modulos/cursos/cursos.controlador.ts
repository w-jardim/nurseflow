import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { CursosServico } from './cursos.servico';
import { CriarCursoDto } from './dto/criar-curso.dto';

@Controller('cursos')
@UseGuards(JwtAuthGuarda)
export class CursosControlador {
  constructor(private readonly cursosServico: CursosServico) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.cursosServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarCursoDto) {
    return this.cursosServico.criar(obterTenantObrigatorio(usuario), dados);
  }
}
