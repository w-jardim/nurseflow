import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AutenticacaoServico } from './autenticacao.servico';
import { CadastroProfissionalDto } from './dto/cadastro-profissional.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacao')
export class AutenticacaoControlador {
  constructor(private readonly autenticacaoServico: AutenticacaoServico) {}

  @Post('cadastro-profissional')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  cadastrarProfissional(@Body() dados: CadastroProfissionalDto) {
    return this.autenticacaoServico.cadastrarProfissional(dados);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  entrar(@Body() dados: LoginDto) {
    return this.autenticacaoServico.entrar(dados);
  }

  @Get('me')
  @UseGuards(JwtAuthGuarda)
  buscarSessao(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.autenticacaoServico.buscarSessao(usuario.sub);
  }
}
