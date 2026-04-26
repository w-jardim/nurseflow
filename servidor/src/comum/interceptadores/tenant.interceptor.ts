import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { RequisicaoAutenticada } from '../tipos/requisicao-autenticada';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(contexto: ExecutionContext, proximo: CallHandler) {
    const requisicao = contexto.switchToHttp().getRequest<RequisicaoAutenticada>();
    const usuario = requisicao.usuario ?? requisicao.user;

    if (usuario) {
      requisicao.usuario = usuario;
    }

    return proximo.handle();
  }
}
