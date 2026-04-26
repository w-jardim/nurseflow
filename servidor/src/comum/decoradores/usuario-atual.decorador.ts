import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequisicaoAutenticada, UsuarioAutenticado } from '../tipos/requisicao-autenticada';

export const UsuarioAtual = createParamDecorator(
  (_dado: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
    const requisicao = contexto.switchToHttp().getRequest<RequisicaoAutenticada>();
    return requisicao.usuario ?? requisicao.user;
  },
);
