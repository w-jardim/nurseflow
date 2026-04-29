# Copilot Instructions — NurseFlow

## Idioma

Responda sempre em português do Brasil.

## Contexto do projeto

Este repositório é o projeto NurseFlow.

O NurseFlow deve ser tratado como um sistema SaaS para gestão operacional, administrativa e financeira de serviços ligados à enfermagem, saúde domiciliar, escalas, atendimentos, clientes, profissionais e fluxos internos.

## Regras obrigatórias

- Antes de sugerir alteração, entenda a estrutura do projeto.
- Preserve o padrão existente.
- Não faça refatoração agressiva sem necessidade.
- Não altere contratos públicos da API sem avisar.
- Não remova validações de autenticação ou autorização.
- Não exponha secrets, tokens, senhas ou conteúdo de arquivos .env.
- Não sugira commit de .env.
- Evite código hardcoded.
- Priorize soluções modulares, testáveis e compatíveis com SaaS multi-tenant.

## Backend

- Preserve regras de autenticação e autorização.
- Valide DTOs, inputs e regras de negócio.
- Preserve compatibilidade com Prisma, migrations e banco existente.
- Não faça alteração destrutiva em schema sem alertar.
- Ao criar endpoint, respeite o padrão dos módulos existentes.

## Frontend

- Preserve padrão visual e estrutura de páginas existente.
- Reutilize componentes existentes.
- Não duplique lógica sem necessidade.
- Preserve rotas já existentes.
- Priorize UX clara, responsiva e profissional.

## Validação

Quando sugerir ou aplicar alterações, considere executar:

```bash
npm run lint
npm run typecheck
npm test
npm run build
