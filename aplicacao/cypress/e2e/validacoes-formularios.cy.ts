describe('Validações de Formulários', () => {
  beforeEach(() => {
    cy.visit('/autenticacao/login');
    cy.get('input[name="email"]').type('monique@example.com');
    cy.get('input[name="senha"]').type('SenhaForte@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/painel');
  });

  describe('Validação de Email', () => {
    beforeEach(() => {
      cy.contains('Alunos').click();
      cy.contains('Novo Aluno').click();
    });

    it('deve validar formato de email', () => {
      cy.get('input[name="email"]').type('email-invalido');
      cy.get('input[name="email"]').blur();

      cy.contains('Email inválido').should('exist');
    });

    it('deve validar email com espaços', () => {
      cy.get('input[name="email"]').type('   joao@example.com   ');
      cy.get('input[name="email"]').blur();

      cy.get('input[name="email"]').should('have.value', 'joao@example.com');
    });

    it('deve converter email para minúsculas', () => {
      cy.get('input[name="email"]').type('JOAO@EXAMPLE.COM');
      cy.get('input[name="email"]').blur();

      cy.get('input[name="email"]').should('have.value', 'joao@example.com');
    });

    it('deve validar email vazio', () => {
      cy.get('input[name="email"]').type('{backspace}');
      cy.get('button[type="submit"]').click();

      cy.contains('Campo obrigatório').should('exist');
    });
  });

  describe('Validação de Telefone', () => {
    beforeEach(() => {
      cy.contains('Alunos').click();
      cy.contains('Novo Aluno').click();
    });

    it('deve formatar telefone automaticamente', () => {
      cy.get('input[name="telefone"]').type('11999999999');
      cy.get('input[name="telefone"]').should('have.value', '(11) 99999-9999');
    });

    it('deve rejeitar telefone com caracteres especiais', () => {
      cy.get('input[name="telefone"]').type('11@9999#9999');
      cy.get('input[name="telefone"]').blur();

      cy.contains('Telefone inválido').should('exist');
    });

    it('deve rejeitar telefone com menos de 10 dígitos', () => {
      cy.get('input[name="telefone"]').type('1199999');
      cy.get('input[name="telefone"]').blur();

      cy.contains('Telefone deve ter').should('exist');
    });
  });

  describe('Validação de CEP', () => {
    beforeEach(() => {
      cy.contains('Alunos').click();
      cy.contains('Novo Aluno').click();
    });

    it('deve formatar CEP automaticamente', () => {
      cy.get('input[name="cep"]').type('01310100');
      cy.get('input[name="cep"]').should('have.value', '01310-100');
    });

    it('deve validar CEP com 8 dígitos', () => {
      cy.get('input[name="cep"]').type('0131010');
      cy.get('input[name="cep"]').blur();

      cy.contains('CEP deve ter 8 dígitos').should('exist');
    });

    it('deve buscar endereço por CEP', () => {
      cy.get('input[name="cep"]').type('01310100');
      cy.get('input[name="cep"]').blur();

      // Simular busca de endereço
      cy.get('input[name="endereco"]').should('have.value', 'Avenida Paulista');
      cy.get('input[name="cidade"]').should('have.value', 'São Paulo');
      cy.get('input[name="estado"]').should('have.value', 'SP');
    });
  });

  describe('Validação de CPF', () => {
    beforeEach(() => {
      cy.contains('Pacientes').click();
      cy.contains('Novo Paciente').click();
    });

    it('deve formatar CPF automaticamente', () => {
      cy.get('input[name="cpf"]').type('12345678900');
      cy.get('input[name="cpf"]').should('have.value', '123.456.789-00');
    });

    it('deve validar CPF com números repetidos', () => {
      cy.get('input[name="cpf"]').type('11111111111');
      cy.get('input[name="cpf"]').blur();

      cy.contains('CPF inválido').should('exist');
    });

    it('deve validar dígito verificador do CPF', () => {
      cy.get('input[name="cpf"]').type('000.000.000-00');
      cy.get('input[name="cpf"]').blur();

      cy.contains('CPF inválido').should('exist');
    });

    it('deve aceitar CPF válido', () => {
      const cpfValido = '123.456.789-09'; // CPF válido (exemplo)
      cy.get('input[name="cpf"]').type(cpfValido);
      cy.get('input[name="cpf"]').blur();

      cy.contains('CPF inválido').should('not.exist');
    });
  });

  describe('Validação de Campos Obrigatórios', () => {
    it('deve exigir todos os campos obrigatórios', () => {
      cy.contains('Alunos').click();
      cy.contains('Novo Aluno').click();

      // Tentar submeter sem preencher nada
      cy.get('button[type="submit"]').click();

      cy.contains('Nome é obrigatório').should('exist');
      cy.contains('Email é obrigatório').should('exist');
      cy.contains('Telefone é obrigatório').should('exist');
    });

    it('deve permitir campos opcionais vazios', () => {
      cy.contains('Alunos').click();
      cy.contains('Novo Aluno').click();

      cy.get('input[name="nome"]').type('João Silva');
      cy.get('input[name="email"]').type('joao@example.com');
      cy.get('input[name="telefone"]').type('11999999999');
      // Deixar complementoEndereco vazio (campo opcional)

      cy.get('button[type="submit"]').click();

      // Não deve haver erro de validação
      cy.contains('Campo obrigatório').should('not.exist');
    });
  });

  describe('Validação de Comprimento de Texto', () => {
    beforeEach(() => {
      cy.contains('Alunos').click();
      cy.contains('Novo Aluno').click();
    });

    it('deve validar comprimento máximo do nome', () => {
      const nomeGrande = 'A'.repeat(200);
      cy.get('input[name="nome"]').type(nomeGrande);
      cy.get('input[name="nome"]').blur();

      cy.contains('Nome não pode ter mais de').should('exist');
    });

    it('deve validar comprimento mínimo do nome', () => {
      cy.get('input[name="nome"]').type('A');
      cy.get('input[name="nome"]').blur();

      cy.contains('Nome deve ter no mínimo').should('exist');
    });
  });

  describe('Validação em Tempo Real', () => {
    beforeEach(() => {
      cy.contains('Alunos').click();
      cy.contains('Novo Aluno').click();
    });

    it('deve validar enquanto digita', () => {
      cy.get('input[name="email"]').type('email');
      cy.contains('Email inválido').should('be.visible');

      cy.get('input[name="email"]').type('@example.com');
      cy.contains('Email inválido').should('not.exist');
    });

    it('deve remover mensagem de erro quando corrigir', () => {
      cy.get('input[name="email"]').type('invalido');
      cy.get('input[name="email"]').blur();

      cy.contains('Email inválido').should('be.visible');

      cy.get('input[name="email"]').clear();
      cy.get('input[name="email"]').type('valido@example.com');
      cy.get('input[name="email"]').blur();

      cy.contains('Email inválido').should('not.exist');
    });
  });

  describe('Mensagens de Erro Clara', () => {
    it('deve exibir mensagem clara para email inválido', () => {
      cy.visit('/autenticacao/login');
      cy.get('input[name="email"]').type('invalido');
      cy.get('input[name="email"]').blur();

      cy.contains('Por favor, insira um email válido').should('be.visible');
    });

    it('deve exibir mensagem clara para campo vazio', () => {
      cy.visit('/autenticacao/login');
      cy.get('input[name="email"]').focus();
      cy.get('input[name="email"]').blur();

      cy.contains('Email é obrigatório').should('be.visible');
    });

    it('deve exibir mensagem clara para senha fraca', () => {
      cy.visit('/autenticacao/cadastro');
      cy.get('input[name="senha"]').type('123');
      cy.get('input[name="senha"]').blur();

      cy.contains('A senha deve conter').should('be.visible');
    });
  });
});
