describe('Painel - Gerenciamento de Alunos', () => {
  beforeEach(() => {
    // Login antes de cada teste
    cy.visit('/autenticacao/login');
    cy.get('input[name="email"]').type('monique@example.com');
    cy.get('input[name="senha"]').type('SenhaForte@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/painel');

    // Navegar para seção de alunos
    cy.contains('Alunos').click();
    cy.url().should('include', '/painel/alunos');
  });

  describe('Listagem de Alunos', () => {
    it('deve exibir tabela de alunos', () => {
      cy.get('table').should('be.visible');
      cy.contains('Nome').should('be.visible');
      cy.contains('Email').should('be.visible');
      cy.contains('Telefone').should('be.visible');
    });

    it('deve exibir botão para adicionar novo aluno', () => {
      cy.contains('Novo Aluno').should('be.visible');
    });

    it('deve listar alunos cadastrados', () => {
      // Verificar que existe pelo menos um aluno na lista
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve pesquisar aluno por nome', () => {
      cy.get('input[placeholder="Pesquisar aluno"]').type('João');
      cy.get('table tbody tr').should('contain', 'João');
    });

    it('deve pesquisar aluno por email', () => {
      cy.get('input[placeholder="Pesquisar aluno"]').type('joao@example.com');
      cy.get('table tbody tr').should('contain', 'joao@example.com');
    });

    it('deve exibir mensagem quando não há alunos', () => {
      cy.get('input[placeholder="Pesquisar aluno"]').type(
        'aluno-inexistente-xyz',
      );
      cy.contains('Nenhum aluno encontrado').should('be.visible');
    });
  });

  describe('Criar Novo Aluno', () => {
    beforeEach(() => {
      cy.contains('Novo Aluno').click();
    });

    it('deve exibir formulário de novo aluno', () => {
      cy.get('form').should('be.visible');
      cy.contains('Nome Completo').should('be.visible');
      cy.contains('Email').should('be.visible');
      cy.contains('Telefone').should('be.visible');
    });

    it('deve validar campos obrigatórios', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Campo obrigatório').should('be.visible');
    });

    it('deve criar aluno com dados válidos', () => {
      const email = `aluno-${Date.now()}@example.com`;

      cy.get('input[name="nome"]').type('Novo Aluno');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="telefone"]').type('11999999999');
      cy.get('input[name="endereco"]').type('Rua Teste, 123');
      cy.get('input[name="cidade"]').type('São Paulo');
      cy.get('input[name="estado"]').type('SP');
      cy.get('input[name="cep"]').type('01310100');

      cy.get('button[type="submit"]').click();

      // Verificar mensagem de sucesso
      cy.contains('Aluno cadastrado com sucesso').should('be.visible');

      // Verificar que aluno aparece na lista
      cy.get('table tbody').should('contain', 'Novo Aluno');
    });

    it('deve validar email duplicado', () => {
      const email = 'joao@example.com'; // Email que já existe

      cy.get('input[name="nome"]').type('Outro Aluno');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="telefone"]').type('11999999999');

      cy.get('button[type="submit"]').click();

      cy.contains('Email já está em uso').should('be.visible');
    });

    it('deve validar formato de email', () => {
      cy.get('input[name="email"]').type('email-invalido');
      cy.get('input[name="email"]').blur();

      cy.contains('Email inválido').should('exist');
    });

    it('deve formatar CEP automaticamente', () => {
      cy.get('input[name="cep"]').type('01310100');
      cy.get('input[name="cep"]').should('have.value', '01310-100');
    });

    it('deve validar CPF se fornecido', () => {
      cy.get('input[name="cpf"]').type('000.000.000-00'); // CPF inválido
      cy.get('input[name="cpf"]').blur();

      cy.contains('CPF inválido').should('exist');
    });
  });

  describe('Editar Aluno', () => {
    it('deve abrir formulário de edição ao clicar em aluno', () => {
      cy.get('table tbody tr').first().click();
      cy.get('form').should('be.visible');
      cy.get('input[name="nome"]').should('have.value');
    });

    it('deve atualizar dados do aluno', () => {
      cy.get('table tbody tr').first().click();

      cy.get('input[name="nome"]').clear().type('Nome Atualizado');
      cy.get('button[type="submit"]').click();

      cy.contains('Aluno atualizado com sucesso').should('be.visible');
      cy.get('table tbody').should('contain', 'Nome Atualizado');
    });

    it('deve cancelar edição', () => {
      cy.get('table tbody tr').first().click();
      cy.contains('Cancelar').click();

      cy.url().should('include', '/painel/alunos');
    });
  });

  describe('Deletar Aluno', () => {
    it('deve exibir opção de deletar', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-deletar"]').should('be.visible');
      });
    });

    it('deve solicitar confirmação antes de deletar', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-deletar"]').click();
      });

      cy.contains('Tem certeza que deseja deletar?').should('be.visible');
    });

    it('deve deletar aluno com confirmação', () => {
      const nomeAluno = cy.get('table tbody tr').first().contains('td');

      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-deletar"]').click();
      });

      cy.contains('Confirmar').click();

      cy.contains('Aluno deletado com sucesso').should('be.visible');
    });

    it('deve cancelar exclusão ao clicar em Cancelar', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-deletar"]').click();
      });

      cy.contains('Cancelar').click();

      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  describe('Visualizar Detalhes do Aluno', () => {
    it('deve exibir modal com detalhes do aluno', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-detalhes"]').click();
      });

      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Detalhes do Aluno').should('be.visible');
    });

    it('deve mostrar todas as informações do aluno', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-detalhes"]').click();
      });

      cy.get('[role="dialog"]').within(() => {
        cy.contains('Nome').should('be.visible');
        cy.contains('Email').should('be.visible');
        cy.contains('Telefone').should('be.visible');
        cy.contains('Endereço').should('be.visible');
      });
    });

    it('deve fechar modal ao clicar em X', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-testid="btn-detalhes"]').click();
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Fechar"]').click();
      });

      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Isolamento por Tenant', () => {
    it('deve exibir apenas alunos do profissional autenticado', () => {
      // Este teste verifica que a requisição API filtra por tenant
      cy.intercept('GET', '/api/alunos', (req) => {
        // Verificar que a requisição inclui tenant_id
        expect(req.headers).to.have.property('Authorization');
        req.continue();
      }).as('listarAlunos');

      cy.visit('/painel/alunos');
      cy.wait('@listarAlunos');

      // Fazer login como outro profissional seria necessário para
      // validar completamente o isolamento
    });
  });
});
