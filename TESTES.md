# 🧪 Documentação de Testes - NurseFlow

Este documento descreve como executar os testes unitários e E2E do projeto NurseFlow.

## 📋 Sumário

- [Testes Unitários (Jest)](#testes-unitários-jest)
- [Testes E2E (Cypress)](#testes-e2e-cypress)
- [Rodar Todos os Testes](#rodar-todos-os-testes)
- [Cobertura de Testes](#cobertura-de-testes)
- [Boas Práticas](#boas-práticas)

---

## 🧪 Testes Unitários (Jest)

### Configuração

Jest foi configurado no servidor NestJS para testar:
- Serviços (autenticação, CRUD, validações)
- Interceptadores (tenant isolation)
- DTOs (validação de dados)
- Guardas (autenticação e autorização)

### Instalação

```bash
cd servidor
npm install --save-dev jest @types/jest ts-jest @nestjs/testing
```

### Scripts Disponíveis

```bash
# Rodar testes uma vez
npm run test

# Rodar testes em modo watch (reinicia ao salvar arquivo)
npm run test:watch

# Gerar relatório de cobertura
npm run test:cov

# Rodar um arquivo específico
npm run test -- autenticacao.servico.spec.ts

# Rodar testes com padrão específico
npm run test -- --testPathPattern=alunos
```

### Estrutura de Testes

```
servidor/src/
├── modulos/
│   ├── autenticacao/
│   │   └── autenticacao.servico.spec.ts    ← Testes de autenticação
│   ├── alunos/
│   │   ├── alunos.servico.spec.ts           ← Testes de CRUD alunos
│   │   └── dto/
│   │       └── criar-aluno.dto.spec.ts      ← Testes de validação
│   └── ...
├── comum/
│   └── interceptadores/
│       └── tenant.interceptor.spec.ts      ← Testes de isolamento
└── ...
```

### Exemplo de Teste

```typescript
describe('AutenticacaoServico', () => {
  it('deve fazer login com credenciais válidas', async () => {
    const credenciais = {
      email: 'monique@example.com',
      senha: 'Senha@123',
    };

    const resultado = await servico.login(credenciais);

    expect(resultado).toHaveProperty('acessoToken');
    expect(resultado.usuario.email).toBe(credenciais.email);
  });
});
```

### Cobrir Novos Módulos

Ao criar um novo módulo, crie seu arquivo `.spec.ts`:

```bash
# Exemplo: novo módulo de pagamentos
touch servidor/src/modulos/pagamentos/pagamentos.servico.spec.ts
```

Use como template os arquivos existentes em:
- `servidor/src/modulos/autenticacao/autenticacao.servico.spec.ts`
- `servidor/src/modulos/alunos/alunos.servico.spec.ts`

---

## 🎭 Testes E2E (Cypress)

### Configuração

Cypress foi instalado no frontend React para testar:
- Fluxos completos (login, cadastro, CRUD)
- Interações do usuário (cliques, digitação, navegação)
- Isolamento por tenant
- Validações de formulário

### Instalação

```bash
cd aplicacao
npm install --save-dev cypress @testing-library/react @testing-library/jest-dom
```

### Scripts Disponíveis

```bash
# Abrir Cypress Test Runner (interface gráfica)
npm run cypress:open

# Rodar testes E2E em modo headless (sem UI)
npm run cypress:run

# Abrir Cypress em modo E2E (mais simples)
npm run e2e:watch

# Rodar E2E em CI/CD
npm run e2e
```

### Estrutura de Testes

```
aplicacao/
├── cypress/
│   ├── e2e/
│   │   ├── autenticacao.cy.ts              ← Testes de login/cadastro
│   │   ├── painel-alunos.cy.ts             ← Testes de CRUD alunos
│   │   └── ...
│   ├── support/
│   │   └── e2e.ts                          ← Comandos customizados
│   └── cypress.config.ts                   ← Configuração
└── ...
```

### Exemplo de Teste E2E

```typescript
describe('Autenticação', () => {
  it('deve fazer login com credenciais válidas', () => {
    cy.visit('/autenticacao/login');
    cy.get('input[name="email"]').type('monique@example.com');
    cy.get('input[name="senha"]').type('SenhaForte@123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/painel');
    cy.contains('Bem-vindo').should('be.visible');
  });
});
```

### Comandos Customizados

```typescript
// Usar em testes
cy.login('monique@example.com', 'SenhaForte@123');
cy.logout();
cy.createAluno({ nome: 'João', email: 'joao@example.com' });
```

### Escrever Novo Teste E2E

1. Criar arquivo em `aplicacao/cypress/e2e/feature.cy.ts`
2. Estrutura básica:

```typescript
describe('Minha Feature', () => {
  beforeEach(() => {
    cy.login('monique@example.com', 'SenhaForte@123');
    cy.visit('/painel/minha-feature');
  });

  it('deve fazer algo', () => {
    cy.get('[data-testid="elemento"]').click();
    cy.contains('Resultado esperado').should('be.visible');
  });
});
```

---

## 🚀 Rodar Todos os Testes

### Localmente (Desenvolvimento)

```bash
# Terminal 1: Iniciar aplicação
npm run dev

# Terminal 2: Iniciar servidor
npm run dev

# Terminal 3: Rodar testes unitários
cd servidor && npm run test:watch

# Terminal 4: Rodar testes E2E
cd aplicacao && npm run e2e:watch
```

### Em CI/CD (Produção)

```bash
# Arquivo: .github/workflows/ci.yml
npm run test              # Jest unitários
npm run e2e              # Cypress E2E
npm run lint             # ESLint
npm run typecheck        # TypeScript
```

---

## 📊 Cobertura de Testes

### Meta de Cobertura

```
Função:    80%+ ✅
Branch:    75%+ ✅
Linha:     80%+ ✅
Statement: 80%+ ✅
```

### Gerar Relatório

```bash
cd servidor
npm run test:cov

# Relatório em HTML
open coverage/index.html
```

### Interpretar Relatório

```
Exemplo de saída:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 File      | % Stmts | % Branches | % Funcs | % Lines |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Serviços  | 85%     | 80%        | 90%     | 85%     | ✅
 Guards    | 75%     | 70%        | 80%     | 75%     | ⚠️
 DTOs      | 95%     | 100%       | 100%    | 95%     | ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verde (✅) = Acima da meta
Amarelo (⚠️) = Próximo da meta
Vermelho (❌) = Abaixo da meta
```

---

## 📝 Boas Práticas

### Ao Escrever Testes Unitários

1. **Um conceito por teste**
   ```typescript
   // ❌ Não faça
   it('deve criar aluno e salvar no banco', () => { ... });

   // ✅ Faça
   it('deve criar aluno com sucesso', () => { ... });
   it('deve persistir aluno no banco de dados', () => { ... });
   ```

2. **Use nomes descritivos**
   ```typescript
   // ❌ Não
   it('test', () => { ... });

   // ✅ Sim
   it('deve validar email duplicado dentro do mesmo tenant', () => { ... });
   ```

3. **AAA Pattern: Arrange → Act → Assert**
   ```typescript
   it('deve fazer login', async () => {
     // Arrange
     const credenciais = { email: 'x@y.com', senha: 'Pass@123' };

     // Act
     const resultado = await servico.login(credenciais);

     // Assert
     expect(resultado).toHaveProperty('acessoToken');
   });
   ```

### Ao Escrever Testes E2E

1. **Teste o fluxo do usuário**
   ```typescript
   // ❌ Testar diretamente API
   it('API retorna aluno', () => { ... });

   // ✅ Teste UI
   it('deve exibir aluno na lista após criar', () => { ... });
   ```

2. **Use data-testid para elementos críticos**
   ```typescript
   // No código:
   <button data-testid="btn-deletar">Deletar</button>

   // No teste:
   cy.get('[data-testid="btn-deletar"]').click();
   ```

3. **Não teste implementação, teste comportamento**
   ```typescript
   // ❌ Não
   it('deve chamar servico.criar()', () => {
     expect(servico.criar).toHaveBeenCalled();
   });

   // ✅ Sim
   it('deve exibir aluno na lista após criar', () => {
     cy.contains('Novo Aluno').click();
     cy.get('input[name="nome"]').type('João');
     cy.get('button[type="submit"]').click();
     cy.get('table tbody').should('contain', 'João');
   });
   ```

---

## 🐛 Troubleshooting

### Testes falhando no CI/CD mas passando localmente

```bash
# Limpar node_modules e instalar novamente
rm -rf node_modules package-lock.json
npm install

# Rodar testes em modo CI (sem watch)
npm run test
```

### Cypress não consegue conectar ao servidor

```bash
# Verificar se servidor está rodando
curl http://localhost:3000/saude

# Ajeitar baseUrl em cypress.config.ts
baseUrl: 'http://localhost:5173'
```

### Testes lentos

```typescript
// Aumentar timeout
cy.visit('/painel', { timeout: 10000 });
cy.get('table tbody tr', { timeout: 10000 }).should('exist');
```

---

## 📚 Recursos

- [Jest Docs](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Cypress Docs](https://docs.cypress.io/)
- [Testing Library](https://testing-library.com/)

---

**Status:** ✅ Testes implementados e documentados

**Próximos passos:**
1. Adicionar testes para módulos de pagamento (Fase 2)
2. Aumentar cobertura para 85%+ (todos os módulos)
3. Implementar testes de performance (E2E)
4. Setup CI/CD com testes automáticos

