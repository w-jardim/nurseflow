import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TenantInterceptor } from './tenant.interceptor';

describe('TenantInterceptor', () => {
  const interceptor = new TenantInterceptor();

  function criarContexto(requisicao: Record<string, unknown>) {
    return {
      switchToHttp: () => ({
        getRequest: () => requisicao,
      }),
    } as unknown as ExecutionContext;
  }

  const proximo: CallHandler = {
    handle: jest.fn(() => of('ok')),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normaliza request.user para request.usuario', () => {
    const usuario = {
      sub: 'usuario-id',
      profissionalId: 'profissional-id',
      email: 'teste@example.com',
      papel: 'PROFISSIONAL',
    };
    const requisicao = { user: usuario };

    interceptor.intercept(criarContexto(requisicao), proximo);

    expect(requisicao).toHaveProperty('usuario', usuario);
    expect(proximo.handle).toHaveBeenCalledTimes(1);
  });

  it('preserva request.usuario quando já existe', () => {
    const usuario = {
      sub: 'usuario-id',
      profissionalId: 'profissional-id',
      email: 'teste@example.com',
      papel: 'PROFISSIONAL',
    };
    const requisicao = {
      usuario,
      body: { nome: 'Teste' },
      query: { pagina: '1' },
    };

    interceptor.intercept(criarContexto(requisicao), proximo);

    expect(requisicao.usuario).toBe(usuario);
    expect(requisicao.body).toEqual({ nome: 'Teste' });
    expect(requisicao.query).toEqual({ pagina: '1' });
  });
});
