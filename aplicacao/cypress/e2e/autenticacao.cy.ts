describe('Autenticação - Fluxo Completo', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Página Inicial', () => {
    it('deve carregar a página inicial', () => {
      cy.contains('NurseFlow').should('be.visible');
      cy.url().should('eq', 'http://localhost:5173/');
    });

    it('deve ter botões de login e cadastro', () => {
      cy.contains('Login').should('be.visible');
      cy.contains('Cadastro').should('be.visible');
    });
  });

  describe('Cadastro de Profissional', () => {
    beforeEach(() => {
      cy.visit('/autenticacao/cadastro');
    });

    it('deve exibir formulário de cadastro', () => {
      cy.get('form').should('be.visible');
      cy.contains('Nome Completo').should('be.visible');
      cy.contains('Email').should('be.visible');
      cy.contains('Senha').should('be.visible');
      cy.contains('Nome Público').should('be.visible');
    });

    it('deve validar campos obrigatórios', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Campo obrigatório').should('be.visible');
    });

    it('deve validar formato de email', () => {
      cy.get('input[type="email"]').type('email-invalido');
      cy.get('input[type="email"]').blur();
      cy.contains('Email inválido').should('exist');
    });

    it('deve validar força da senha', () => {
      cy.get('input[name="senha"]').type('123');
      cy.get('input[name="senha"]').blur();
      cy.contains('Senha fraca').should('exist');
    });

    it('deve cadastrar profissional com dados válidos', () => {
      const email = `teste-${Date.now()}@example.com`;

      cy.get('input[name="nome"]').type('Teste Profissional');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="senha"]').type('SenhaForte@123');
      cy.get('input[name="nomePublico"]').type('Teste Nome Público');

      cy.get('button[type="submit"]').click();

      // Aguardar redirecionamento após cadastro bem-sucedido
      cy.url().should('include', '/painel');
      cy.contains('Bem-vindo').should('be.visible');
    });

    it('deve mostrar erro ao tentar cadastrar com email duplicado', () => {
      const email = 'duplicado@example.com';

      // Primeiro cadastro
      cy.get('input[name="nome"]').type('Profissional 1');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="senha"]').type('SenhaForte@123');
      cy.get('input[name="nomePublico"]').type('Profissional 1');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/painel');

      // Fazer logout
      cy.get('[data-testid="menu-usuario"]').click();
      cy.contains('Sair').click();

      // Tentar cadastrar novamente com mesmo email
      cy.visit('/autenticacao/cadastro');
      cy.get('input[name="nome"]').type('Profissional 2');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="senha"]').type('SenhaForte@123');
      cy.get('input[name="nomePublico"]').type('Profissional 2');
      cy.get('button[type="submit"]').click();

      cy.contains('Email já existe').should('be.visible');
    });
  });

  describe('Login de Profissional', () => {
    beforeEach(() => {
      cy.visit('/autenticacao/login');
    });

    it('deve exibir formulário de login', () => {
      cy.get('form').should('be.visible');
      cy.contains('Email').should('be.visible');
      cy.contains('Senha').should('be.visible');
    });

    it('deve validar campos obrigatórios', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Campo obrigatório').should('be.visible');
    });

    it('deve fazer login com credenciais válidas', () => {
      // Pré-requisito: profissional já registrado
      cy.get('input[name="email"]').type('monique@example.com');
      cy.get('input[name="senha"]').type('SenhaForte@123');

      cy.get('button[type="submit"]').click();

      // Verificar redirecionamento
      cy.url().should('include', '/painel');
      cy.contains('Painel do Profissional').should('be.visible');
    });

    it('deve mostrar erro com email incorreto', () => {
      cy.get('input[name="email"]').type('inexistente@example.com');
      cy.get('input[name="senha"]').type('SenhaForte@123');

      cy.get('button[type="submit"]').click();

      cy.contains('Email ou senha incorretos').should('be.visible');
    });

    it('deve mostrar erro com senha incorreta', () => {
      cy.get('input[name="email"]').type('monique@example.com');
      cy.get('input[name="senha"]').type('SenhaErrada@123');

      cy.get('button[type="submit"]').click();

      cy.contains('Email ou senha incorretos').should('be.visible');
    });

    it('deve ter link para página de cadastro', () => {
      cy.contains('Não tem conta?').should('be.visible');
      cy.contains('Cadastre-se aqui').click();
      cy.url().should('include', '/autenticacao/cadastro');
    });
  });

  describe('Sessão Autenticada', () => {
    beforeEach(() => {
      // Login antes dos testes
      cy.visit('/autenticacao/login');
      cy.get('input[name="email"]').type('monique@example.com');
      cy.get('input[name="senha"]').type('SenhaForte@123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/painel');
    });

    it('deve manter sessão autenticada ao navegar', () => {
      cy.visit('/painel');
      cy.url().should('include', '/painel');
    });

    it('deve redirecionar para login quando acessar página protegida sem autenticação', () => {
      // Fazer logout
      cy.get('[data-testid="menu-usuario"]').click();
      cy.contains('Sair').click();

      // Tentar acessar página protegida
      cy.visit('/painel');
      cy.url().should('include', '/autenticacao/login');
    });

    it('deve fazer logout com sucesso', () => {
      cy.get('[data-testid="menu-usuario"]').click();
      cy.contains('Sair').click();

      cy.url().should('eq', 'http://localhost:5173/');
      cy.contains('NurseFlow').should('be.visible');
    });
  });

  describe('Recuperação de Senha', () => {
    it('deve ter link para recuperação de senha', () => {
      cy.visit('/autenticacao/login');
      cy.contains('Esqueceu a senha?').click();
      cy.url().should('include', '/autenticacao/recuperar-senha');
    });

    it('deve exibir formulário de recuperação de senha', () => {
      cy.visit('/autenticacao/recuperar-senha');
      cy.get('input[name="email"]').should('be.visible');
      cy.contains('Enviar Link').should('be.visible');
    });
  });
});
