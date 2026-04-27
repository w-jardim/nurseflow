import type { PapelUsuario } from '@prisma/client';
import type { Request } from 'express';

export type UsuarioAutenticado = {
  sub: string;
  email: string;
  papel: PapelUsuario;
  profissionalId: string | null;
};

export type RequisicaoAutenticada = Request & {
  usuario: UsuarioAutenticado;
  user?: UsuarioAutenticado;
};
