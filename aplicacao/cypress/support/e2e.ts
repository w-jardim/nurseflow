// Cypress E2E Support file
// https://docs.cypress.io/guides/tooling/plugins-guide

// Adicionar comandos customizados para testes comuns
Cypress.Commands.add('login', (email: string, senha: string) => {
  cy.visit('/autenticacao/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="senha"]').type(senha);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/painel');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="menu-usuario"]').click();
  cy.contains('Sair').click();
  cy.url().should('eq', 'http://localhost:5173/');
});

Cypress.Commands.add('createAluno', (aluno: any) => {
  cy.contains('Alunos').click();
  cy.contains('Novo Aluno').click();

  cy.get('input[name="nome"]').type(aluno.nome);
  cy.get('input[name="email"]').type(aluno.email);
  cy.get('input[name="telefone"]').type(aluno.telefone || '11999999999');

  if (aluno.endereco) {
    cy.get('input[name="endereco"]').type(aluno.endereco);
  }

  cy.get('button[type="submit"]').click();
  cy.contains('Aluno cadastrado com sucesso').should('be.visible');
});

// Ignorar erros de consola que são esperados
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar erros de ResizeObserver (comum em testes)
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }
  // Permitir que outros erros falhem o teste
  return true;
});

// Hook para antes de cada teste
beforeEach(() => {
  // Limpar localStorage antes de cada teste
  cy.clearLocalStorage();
});

// Hook para após cada teste
afterEach(() => {
  // Capturar logs de erro do console
  cy.on('fail', (error) => {
    console.log('Teste falhou:', error.message);
  });
});
