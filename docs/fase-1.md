# Fase 1 - MVP inicial

Objetivo: transformar a fundação técnica em uma plataforma utilizável por profissionais.

## Sprint 03 - Autenticação e Multi-Tenant

Primeira fatia implementada:

- Cadastro de profissional com criação automática de tenant
- Login com JWT de curta duração
- Endpoint autenticado para consultar a sessão atual
- Base para guards, contexto de usuário e tenant por requisição
- Telas frontend para login, cadastro e painel autenticado

## Endpoints

```http
POST /autenticacao/cadastro-profissional
POST /autenticacao/login
GET /autenticacao/me
```

## Rotas frontend

```text
/autenticacao/login
/autenticacao/cadastro
/painel
```

## Proximas fatias

- Refresh token persistido em Redis
- 2FA para Super Admin
- Decorador de papéis e RBAC em rotas
- CRUD de alunos e pacientes filtrado por `profissionalId`
