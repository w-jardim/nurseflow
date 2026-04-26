# Fase 1 - MVP inicial

Objetivo: transformar a fundacao tecnica em uma plataforma utilizavel por profissionais.

## Sprint 03 - Autenticacao e Multi-Tenant

Primeira fatia implementada:

- Cadastro de profissional com criacao automatica de tenant
- Login com JWT de curta duracao
- Endpoint autenticado para consultar a sessao atual
- Base para guards, contexto de usuario e tenant por requisicao

## Endpoints

```http
POST /autenticacao/cadastro-profissional
POST /autenticacao/login
GET /autenticacao/me
```

## Proximas fatias

- Refresh token persistido em Redis
- 2FA para Super Admin
- Decorador de papeis e RBAC em rotas
- CRUD de alunos e pacientes filtrado por `profissionalId`
