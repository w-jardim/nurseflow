import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsuarioAtual } from '../../comum/decoradores/usuario-atual.decorador';
import { JwtAuthGuarda } from '../../comum/guardas/jwt-auth.guarda';
import type { UsuarioAutenticado } from '../../comum/tipos/requisicao-autenticada';
import { AutenticacaoServico } from './autenticacao.servico';
import { CadastroProfissionalDto } from './dto/cadastro-profissional.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { SairDto } from './dto/sair.dto';

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

  @Post('recuperar-senha')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  recuperarSenha(@Body() dados: RecuperarSenhaDto) {
    return this.autenticacaoServico.recuperarSenha(dados);
  }

  @Post('redefinir-senha')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  redefinirSenha(@Body() dados: RedefinirSenhaDto) {
    return this.autenticacaoServico.redefinirSenha(dados);
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  renovarSessao(@Body() dados: RefreshTokenDto) {
    return this.autenticacaoServico.renovarSessao(dados);
  }

  @Post('sair')
  sair(@Body() dados: SairDto) {
    return this.autenticacaoServico.sair(dados);
  }

  @Get('me')
  @UseGuards(JwtAuthGuarda)
  buscarSessao(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.autenticacaoServico.buscarSessao(usuario.sub);
  }
}
