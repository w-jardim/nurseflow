import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import { Papeis } from '../../comum/decoradores/papeis.decorador';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import { PapeisGuarda } from '../../comum/guardas/papeis.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { CursosServico } from './cursos.servico';
import { AtualizarProgressoAulaDto } from './dto/atualizar-progresso-aula.dto';

@Controller('aluno/cursos')
@UseGuards(JwtAuthGuarda, PapeisGuarda)
@Papeis(PapelUsuario.ALUNO)
export class PortalAlunoCursosControlador {
  constructor(private readonly cursosServico: CursosServico) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.cursosServico.listarCursosDoAluno(usuario.sub);
  }

  @Get(':cursoId')
  obter(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('cursoId') cursoId: string) {
    return this.cursosServico.obterCursoDoAluno(usuario.sub, cursoId);
  }

  @Patch(':cursoId/aulas/:aulaId/progresso')
  atualizarProgressoAula(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('cursoId') cursoId: string,
    @Param('aulaId') aulaId: string,
    @Body() dados: AtualizarProgressoAulaDto,
  ) {
    return this.cursosServico.atualizarProgressoAulaDoAluno(
      usuario.sub,
      cursoId,
      aulaId,
      dados.concluida,
    );
  }
}
