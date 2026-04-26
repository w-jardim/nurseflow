import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AutenticacaoServico } from './autenticacao.servico';
import { PrismaServico } from '../../comum/prisma/prisma.servico';

describe('AutenticacaoServico', () => {
  let servico: AutenticacaoServico;
  let prismaServico: PrismaServico;
  let jwtServico: JwtService;

  const mockedPrismaServico = {
    usuario: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    profissional: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockedJwtServico = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacaoServico,
        {
          provide: PrismaServico,
          useValue: mockedPrismaServico,
        },
        {
          provide: JwtService,
          useValue: mockedJwtServico,
        },
      ],
    }).compile();

    servico = module.get<AutenticacaoServico>(AutenticacaoServico);
    prismaServico = module.get<PrismaServico>(PrismaServico);
    jwtServico = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cadastroProfissional', () => {
    it('deve registrar um novo profissional com sucesso', async () => {
      const dadosCadastro = {
        nome: 'Monique Silva',
        email: 'monique@example.com',
        senha: 'Senha@123',
        nomePublico: 'Monique Enfermeira',
      };

      const usuarioCriado = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nome: dadosCadastro.nome,
        email: dadosCadastro.email,
        papel: 'PROFISSIONAL',
        profissionalId: '223e4567-e89b-12d3-a456-426614174000',
      };

      const profissionalCriado = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        usuarioDonoId: usuarioCriado.id,
        nomePublico: dadosCadastro.nomePublico,
        slug: 'monique-enfermeira',
        plano: 'GRATUITO',
      };

      mockedPrismaServico.usuario.create.mockResolvedValue(usuarioCriado);
      mockedPrismaServico.profissional.create.mockResolvedValue(profissionalCriado);
      mockedJwtServico.sign.mockReturnValue('token-jwt');

      const resultado = await servico.cadastroProfissional(dadosCadastro);

      expect(resultado).toHaveProperty('acessoToken');
      expect(resultado).toHaveProperty('usuario');
      expect(resultado.usuario.email).toBe(dadosCadastro.email);
      expect(mockedPrismaServico.usuario.create).toHaveBeenCalled();
      expect(mockedPrismaServico.profissional.create).toHaveBeenCalled();
    });

    it('deve rejeitar email duplicado', async () => {
      const dadosCadastro = {
        nome: 'Outro Profissional',
        email: 'existente@example.com',
        senha: 'Senha@123',
        nomePublico: 'Outro Nome',
      };

      mockedPrismaServico.usuario.create.mockRejectedValue(
        new Error('Email já existe'),
      );

      await expect(servico.cadastroProfissional(dadosCadastro)).rejects.toThrow();
    });

    it('deve validar força da senha', async () => {
      const dadosCadastro = {
        nome: 'Test User',
        email: 'test@example.com',
        senha: '123', // Senha fraca
        nomePublico: 'Test',
      };

      await expect(servico.cadastroProfissional(dadosCadastro)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const credenciais = {
        email: 'monique@example.com',
        senha: 'Senha@123',
      };

      const usuarioEncontrado = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: credenciais.email,
        senhaHash: '$2b$12$...',
        papel: 'PROFISSIONAL',
        profissionalId: '223e4567-e89b-12d3-a456-426614174000',
      };

      mockedPrismaServico.usuario.findUnique.mockResolvedValue(
        usuarioEncontrado,
      );
      mockedJwtServico.sign.mockReturnValue('token-jwt');

      const resultado = await servico.login(credenciais);

      expect(resultado).toHaveProperty('acessoToken');
      expect(resultado).toHaveProperty('usuario');
      expect(mockedPrismaServico.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: credenciais.email },
      });
    });

    it('deve rejeitar credenciais inválidas', async () => {
      const credenciais = {
        email: 'inexistente@example.com',
        senha: 'Senha@123',
      };

      mockedPrismaServico.usuario.findUnique.mockResolvedValue(null);

      await expect(servico.login(credenciais)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });

    it('deve rejeitar senha incorreta', async () => {
      const credenciais = {
        email: 'monique@example.com',
        senha: 'SenhaErrada123',
      };

      const usuarioEncontrado = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: credenciais.email,
        senhaHash: '$2b$12$...',
        papel: 'PROFISSIONAL',
        profissionalId: '223e4567-e89b-12d3-a456-426614174000',
      };

      mockedPrismaServico.usuario.findUnique.mockResolvedValue(
        usuarioEncontrado,
      );

      await expect(servico.login(credenciais)).rejects.toThrow(
        'Senha incorreta',
      );
    });
  });

  describe('validarToken', () => {
    it('deve validar token JWT válido', async () => {
      const token = 'token-jwt-valido';
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'monique@example.com',
        papel: 'PROFISSIONAL',
      };

      mockedJwtServico.verify.mockReturnValue(payload);

      const resultado = servico.validarToken(token);

      expect(resultado).toEqual(payload);
    });

    it('deve rejeitar token inválido', () => {
      const token = 'token-invalido';

      mockedJwtServico.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      expect(() => servico.validarToken(token)).toThrow('Token inválido');
    });
  });
});
