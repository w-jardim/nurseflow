import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { PapelGuarda } from './papeis.guarda';
import { Reflector } from '@nestjs/core';

describe('PapelGuarda - RBAC', () => {
  let guarda: PapelGuarda;
  let reflector: Reflector;

  const mockExecutionContext = (usuario: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        usuario,
      }),
    }),
    getHandler: jest.fn(),
  } as unknown as ExecutionContext);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PapelGuarda,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guarda = module.get<PapelGuarda>(PapelGuarda);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('Controle de Papéis (RBAC)', () => {
    it('deve permitir acesso para PROFISSIONAL em rota PROFISSIONAL', () => {
      const usuario = {
        id: '123',
        papel: 'PROFISSIONAL',
        profissionalId: '456',
      };

      (reflector.get as jest.Mock).mockReturnValue(['PROFISSIONAL']);
      const context = mockExecutionContext(usuario);

      const resultado = guarda.canActivate(context);

      expect(resultado).toBe(true);
    });

    it('deve rejeitar acesso para ALUNO em rota PROFISSIONAL', () => {
      const usuario = {
        id: '123',
        papel: 'ALUNO',
      };

      (reflector.get as jest.Mock).mockReturnValue(['PROFISSIONAL']);
      const context = mockExecutionContext(usuario);

      const resultado = guarda.canActivate(context);

      expect(resultado).toBe(false);
    });

    it('deve permitir acesso para SUPER_ADMIN em qualquer rota', () => {
      const usuario = {
        id: '123',
        papel: 'SUPER_ADMIN',
      };

      (reflector.get as jest.Mock).mockReturnValue(['PROFISSIONAL']);
      const context = mockExecutionContext(usuario);

      const resultado = guarda.canActivate(context);

      expect(resultado).toBe(true);
    });

    it('deve permitir múltiplos papéis', () => {
      const usuarioProf = {
        id: '123',
        papel: 'PROFISSIONAL',
      };

      const usuarioAluno = {
        id: '456',
        papel: 'ALUNO',
      };

      (reflector.get as jest.Mock).mockReturnValue([
        'PROFISSIONAL',
        'ALUNO',
      ]);

      const contextProf = mockExecutionContext(usuarioProf);
      const contextAluno = mockExecutionContext(usuarioAluno);

      expect(guarda.canActivate(contextProf)).toBe(true);
      expect(guarda.canActivate(contextAluno)).toBe(true);
    });
  });

  describe('Proteção de Rotas', () => {
    it('deve bloquear acesso anônimo', () => {
      const usuario = null;

      (reflector.get as jest.Mock).mockReturnValue(['PROFISSIONAL']);
      const context = mockExecutionContext(usuario);

      const resultado = guarda.canActivate(context);

      expect(resultado).toBe(false);
    });

    it('deve bloquear acesso de usuário sem papel definido', () => {
      const usuario = {
        id: '123',
        papel: null,
      };

      (reflector.get as jest.Mock).mockReturnValue(['PROFISSIONAL']);
      const context = mockExecutionContext(usuario);

      const resultado = guarda.canActivate(context);

      expect(resultado).toBe(false);
    });

    it('deve bloquear papel desconhecido', () => {
      const usuario = {
        id: '123',
        papel: 'PAPEL_INVALIDO',
      };

      (reflector.get as jest.Mock).mockReturnValue(['PROFISSIONAL']);
      const context = mockExecutionContext(usuario);

      const resultado = guarda.canActivate(context);

      expect(resultado).toBe(false);
    });
  });

  describe('Hierarquia de Papéis', () => {
    it('SUPER_ADMIN pode acessar rotas de PROFISSIONAL', () => {
      const usuario = {
        id: '123',
        papel: 'SUPER_ADMIN',
      };

      (reflector.get as jest.Mock).mockReturnValue(['PROFISSIONAL']);
      const context = mockExecutionContext(usuario);

      expect(guarda.canActivate(context)).toBe(true);
    });

    it('SUPER_ADMIN pode acessar rotas de ALUNO', () => {
      const usuario = {
        id: '123',
        papel: 'SUPER_ADMIN',
      };

      (reflector.get as jest.Mock).mockReturnValue(['ALUNO']);
      const context = mockExecutionContext(usuario);

      expect(guarda.canActivate(context)).toBe(true);
    });

    it('PROFISSIONAL não pode acessar rotas de SUPER_ADMIN', () => {
      const usuario = {
        id: '123',
        papel: 'PROFISSIONAL',
      };

      (reflector.get as jest.Mock).mockReturnValue(['SUPER_ADMIN']);
      const context = mockExecutionContext(usuario);

      expect(guarda.canActivate(context)).toBe(false);
    });
  });

  describe('Rotas Públicas', () => {
    it('deve permitir rotas sem restrição de papel', () => {
      const usuario = {
        id: '123',
        papel: 'ALUNO',
      };

      // Simular rota pública (sem decorador @Papéis)
      (reflector.get as jest.Mock).mockReturnValue(undefined);
      const context = mockExecutionContext(usuario);

      const resultado = guarda.canActivate(context);

      // Sem restrição de papel, deveria permitir
      expect(resultado).toBe(true);
    });
  });

  describe('Validação de Combinações de Papéis', () => {
    it('deve validar PROFISSIONAL + ALUNO incorretamente', () => {
      const usuario = {
        id: '123',
        papel: 'PROFISSIONAL', // Apenas um papel por usuário
      };

      (reflector.get as jest.Mock).mockReturnValue(['PROFISSIONAL', 'ALUNO']);
      const context = mockExecutionContext(usuario);

      // Usuário é PROFISSIONAL, pode acessar rota que exige [PROFISSIONAL, ALUNO]
      expect(guarda.canActivate(context)).toBe(true);
    });
  });

  describe('Segurança de Redirecionamento', () => {
    it('deve manter segurança ao rejeitar acesso', () => {
      const usuario = {
        id: '123',
        papel: 'ALUNO',
      };

      (reflector.get as jest.Mock).mockReturnValue(['SUPER_ADMIN']);
      const context = mockExecutionContext(usuario);

      const resultado = guarda.canActivate(context);

      // Deve rejeitar silenciosamente (sem expor detalhes)
      expect(resultado).toBe(false);
    });
  });
});
