import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { TenantInterceptor } from './tenant.interceptor';

describe('TenantInterceptor', () => {
  let interceptor: TenantInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantInterceptor],
    }).compile();

    interceptor = module.get<TenantInterceptor>(TenantInterceptor);
  });

  it('deve ser definido', () => {
    expect(interceptor).toBeDefined();
  });

  it('deve injetar tenant_id na requisição a partir do JWT', () => {
    const tenantId = '123e4567-e89b-12d3-a456-426614174000';
    const usuarioId = '223e4567-e89b-12d3-a456-426614174001';

    const mockRequest = {
      usuario: {
        sub: usuarioId,
        profissionalId: tenantId,
        email: 'teste@example.com',
        papel: 'PROFISSIONAL',
      },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockNext = {
      handle: () => 'resultado',
    };

    interceptor.intercept(mockExecutionContext, mockNext);

    expect(mockRequest).toHaveProperty('tenantId', tenantId);
  });

  it('deve preservar dados originais da requisição', () => {
    const tenantId = '123e4567-e89b-12d3-a456-426614174000';

    const mockRequest = {
      usuario: {
        sub: 'user-id',
        profissionalId: tenantId,
        email: 'teste@example.com',
      },
      body: { nome: 'Teste' },
      query: { page: '1' },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockNext = {
      handle: () => 'resultado',
    };

    interceptor.intercept(mockExecutionContext, mockNext);

    expect(mockRequest.body).toEqual({ nome: 'Teste' });
    expect(mockRequest.query).toEqual({ page: '1' });
    expect(mockRequest.usuario).toBeDefined();
  });

  it('deve funcionar com múltiplas requisições diferentes', () => {
    const tenants = [
      '111e4567-e89b-12d3-a456-426614174000',
      '222e4567-e89b-12d3-a456-426614174000',
      '333e4567-e89b-12d3-a456-426614174000',
    ];

    tenants.forEach((tenantId) => {
      const mockRequest = {
        usuario: {
          profissionalId: tenantId,
          email: `user${tenantId}@example.com`,
        },
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockNext = {
        handle: () => 'resultado',
      };

      interceptor.intercept(mockExecutionContext, mockNext);

      expect(mockRequest).toHaveProperty('tenantId', tenantId);
    });
  });
});
