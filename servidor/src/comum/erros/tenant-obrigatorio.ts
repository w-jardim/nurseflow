import { ForbiddenException } from '@nestjs/common';
import type { UsuarioAutenticado } from '../tipos/requisicao-autenticada';

export function obterTenantObrigatorio(usuario: UsuarioAutenticado) {
  if (!usuario.profissionalId) {
    throw new ForbiddenException('Usuário sem tenant profissional vinculado.');
  }

  return usuario.profissionalId;
}
