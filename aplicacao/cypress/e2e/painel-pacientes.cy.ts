describe('Painel - Gerenciamento de Pacientes', () => {
  beforeEach(() => {
    cy.visit('/autenticacao/login');
    cy.get('input[name="email"]').type('monique@example.com');
    cy.get('input[name="senha"]').type('SenhaForte@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/painel');

    cy.contains('Pacientes').click();
    cy.url().should('include', '/painel/pacientes');
  });

  describe('Listagem de Pacientes', () => {
    it('deve exibir tabela de pacientes', () => {
      cy.get('table').should('be.visible');
      cy.contains('Nome').should('be.visible');
      cy.contains('Telefone').should('be.visible');
    });

    it('deve exibir botão para adicionar paciente', () => {
      cy.contains('Novo Paciente').should('be.visible');
    });

    it('deve pesquisar paciente por nome', () => {
      cy.get('input[placeholder="Pesquisar paciente"]').type('Maria');
      cy.get('table tbody tr').should('contain', 'Maria');
    });
  });

  describe('Criar Novo Paciente', () => {
    beforeEach(() => {
      cy.contains('Novo Paciente').click();
    });

    it('deve exibir formulário de novo paciente', () => {
      cy.get('form').should('be.visible');
      cy.contains('Nome Completo').should('be.visible');
      cy.contains('CPF').should('be.visible');
      cy.contains('Telefone').should('be.visible');
    });

    it('deve validar CPF', () => {
      cy.get('input[name="cpf"]').type('000.000.000-00');
      cy.get('input[name="cpf"]').blur();
      cy.contains('CPF inválido').should('exist');
    });

    it('deve criar paciente com dados válidos', () => {
      const cpf = '123.456.789-00';

      cy.get('input[name="nome"]').type('Maria Silva');
      cy.get('input[name="cpf"]').type(cpf);
      cy.get('input[name="telefone"]').type('11987654321');
      cy.get('input[name="endereco"]').type('Rua B, 456');
      cy.get('input[name="cidade"]').type('São Paulo');
      cy.get('input[name="estado"]').type('SP');
      cy.get('input[name="cep"]').type('01310100');

      cy.get('button[type="submit"]').click();

      cy.contains('Paciente cadastrado com sucesso').should('be.visible');
      cy.get('table tbody').should('contain', 'Maria Silva');
    });

    it('deve formatar CPF automaticamente', () => {
      cy.get('input[name="cpf"]').type('12345678900');
      cy.get('input[name="cpf"]').should('have.value', '123.456.789-00');
    });
  });

  describe('Editar Paciente', () => {
    it('deve atualizar dados do paciente', () => {
      cy.get('table tbody tr').first().click();

      cy.get('input[name="nome"]').clear().type('Nome Atualizado');
      cy.get('button[type="submit"]').click();

      cy.contains('Paciente atualizado com sucesso').should('be.visible');
    });
  });

  describe('Agendamentos do Paciente', () => {
    it('deve exibir agendamentos do paciente', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-agendamentos"]').click();
      });

      cy.contains('Agendamentos').should('be.visible');
      cy.get('table').should('be.visible');
    });

    it('deve criar novo agendamento', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-agendamentos"]').click();
      });

      cy.contains('Novo Agendamento').click();

      cy.get('input[name="dataAtendimento"]').type('2026-05-01');
      cy.get('input[name="horarioAtendimento"]').type('14:00');
      cy.get('textarea[name="descricao"]').type('Consulta de acompanhamento');

      cy.get('button[type="submit"]').click();

      cy.contains('Agendamento criado com sucesso').should('be.visible');
    });
  });

  describe('Isolamento por Tenant', () => {
    it('deve exibir apenas pacientes do profissional autenticado', () => {
      cy.intercept('GET', '/api/pacientes', (req) => {
        expect(req.headers).to.have.property('Authorization');
        req.continue();
      }).as('listarPacientes');

      cy.visit('/painel/pacientes');
      cy.wait('@listarPacientes');
    });
  });
});
