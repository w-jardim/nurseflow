import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
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
      return false;
    }

    return papeisPermitidos.includes(usuario.papel);
  }
}
