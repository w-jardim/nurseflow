import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PapelUsuario } from '@prisma/client';
import { CHAVE_PAPEIS } from '../decoradores/papeis.decorador';
import type { RequisicaoAutenticada } from '../tipos/requisicao-autenticada';

@Injectable()
export class PapeisGuarda implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const papeisPermitidos =
      this.reflector.getAllAndOverride<PapelUsuario[]>(CHAVE_PAPEIS, [
        contexto.getHandler(),
        contexto.getClass(),
      ]) ?? [];

    if (papeisPermitidos.length === 0) {
      return true;
    }

    const requisicao = contexto.switchToHttp().getRequest<RequisicaoAutenticada>();
    const usuario = requisicao.usuario ?? requisicao.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário autenticado não encontrado na requisição.');
    }

    if (!papeisPermitidos.includes(usuario.papel)) {
      throw new ForbiddenException('Usuário sem permissão para acessar este recurso.');
    }

    return true;
  }
}
