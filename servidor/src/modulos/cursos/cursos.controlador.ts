import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import { Papeis } from '../../comum/decoradores/papeis.decorador';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { obterTenantObrigatorio } from '../../comum/erros/tenant-obrigatorio';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import { PapeisGuarda } from '../../comum/guardas/papeis.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AuditoriaServico } from '../auditoria/auditoria.servico';
import { CursosServico } from './cursos.servico';
import { CriarAulaCursoDto } from './dto/criar-aula-curso.dto';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { CriarModuloCursoDto } from './dto/criar-modulo-curso.dto';

@Controller('cursos')
@UseGuards(JwtAuthGuarda, PapeisGuarda)
@Papeis(PapelUsuario.PROFISSIONAL)
export class CursosControlador {
  constructor(
    private readonly cursosServico: CursosServico,
    private readonly auditoriaServico: AuditoriaServico,
  ) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.cursosServico.listar(obterTenantObrigatorio(usuario));
  }

  @Post()
  async criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarCursoDto) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const curso = await this.cursosServico.criar(profissionalId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'curso.criado',
      entidade: 'Curso',
      entidadeId: curso.id,
      metadados: {
        status: curso.status,
        modalidade: curso.modalidade,
      },
    });

    return curso;
  }

  @Get(':cursoId/modulos')
  listarModulos(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('cursoId') cursoId: string) {
    return this.cursosServico.listarModulos(obterTenantObrigatorio(usuario), cursoId);
  }

  @Post(':cursoId/modulos')
  async criarModulo(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('cursoId') cursoId: string,
    @Body() dados: CriarModuloCursoDto,
  ) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const modulo = await this.cursosServico.criarModulo(profissionalId, cursoId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'curso.modulo_criado',
      entidade: 'ModuloCurso',
      entidadeId: modulo.id,
      metadados: {
        cursoId,
      },
    });

    return modulo;
  }

  @Post(':cursoId/modulos/:moduloId/aulas')
  async criarAula(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('cursoId') cursoId: string,
    @Param('moduloId') moduloId: string,
    @Body() dados: CriarAulaCursoDto,
  ) {
    const profissionalId = obterTenantObrigatorio(usuario);
    const aula = await this.cursosServico.criarAula(profissionalId, cursoId, moduloId, dados);

    await this.auditoriaServico.registrar({
      profissionalId,
      usuarioId: usuario.sub,
      acao: 'curso.aula_criada',
      entidade: 'AulaCurso',
      entidadeId: aula.id,
      metadados: {
        cursoId,
        moduloId,
      },
    });

    return aula;
  }
}
