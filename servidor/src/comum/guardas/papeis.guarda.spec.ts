import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PapelUsuario } from '@prisma/client';
import { PapeisGuarda } from './papeis.guarda';

describe('PapeisGuarda', () => {
  let reflector: Pick<Reflector, 'getAllAndOverride'>;
  let guarda: PapeisGuarda;

  function criarContexto(usuario?: { papel?: PapelUsuario | string | null }) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ usuario }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guarda = new PapeisGuarda(reflector as Reflector);
  });

  it('permite rota sem restrição de papel', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guarda.canActivate(criarContexto())).toBe(true);
  });

  it('permite usuário com papel exigido', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([PapelUsuario.PROFISSIONAL]);

    expect(guarda.canActivate(criarContexto({ papel: PapelUsuario.PROFISSIONAL }))).toBe(true);
  });

  it('permite múltiplos papéis configurados', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([PapelUsuario.PROFISSIONAL, PapelUsuario.ALUNO]);

    expect(guarda.canActivate(criarContexto({ papel: PapelUsuario.ALUNO }))).toBe(true);
  });

  it('bloqueia usuário sem papel permitido', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([PapelUsuario.SUPER_ADMIN]);

    expect(() => guarda.canActivate(criarContexto({ papel: PapelUsuario.PROFISSIONAL }))).toThrow(
      ForbiddenException,
    );
  });

  it('bloqueia requisição autenticada ausente', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([PapelUsuario.PROFISSIONAL]);

    expect(() => guarda.canActivate(criarContexto())).toThrow(ForbiddenException);
  });
});
