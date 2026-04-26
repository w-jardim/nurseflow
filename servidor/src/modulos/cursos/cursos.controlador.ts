import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { CursosServico } from './cursos.servico';
import { CriarAulaCursoDto } from './dto/criar-aula-curso.dto';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { CriarModuloCursoDto } from './dto/criar-modulo-curso.dto';

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

  @Get(':cursoId/modulos')
  listarModulos(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('cursoId') cursoId: string) {
    return this.cursosServico.listarModulos(obterTenantObrigatorio(usuario), cursoId);
  }

  @Post(':cursoId/modulos')
  criarModulo(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('cursoId') cursoId: string,
    @Body() dados: CriarModuloCursoDto,
  ) {
    return this.cursosServico.criarModulo(obterTenantObrigatorio(usuario), cursoId, dados);
  }

  @Post(':cursoId/modulos/:moduloId/aulas')
  criarAula(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('cursoId') cursoId: string,
    @Param('moduloId') moduloId: string,
    @Body() dados: CriarAulaCursoDto,
  ) {
    return this.cursosServico.criarAula(obterTenantObrigatorio(usuario), cursoId, moduloId, dados);
  }
}
