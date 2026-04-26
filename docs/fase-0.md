# Fase 0 - Fundacao

Objetivo: preparar a base tecnica do NurseFlow para desenvolvimento incremental.

## Entregas

- Monorepo com Turborepo e npm workspaces
- Frontend React com Vite, TypeScript e TailwindCSS
- Backend NestJS com Prisma
- Pacote compartilhado para tipos e validadores
- PostgreSQL e Redis via Docker Compose
- Schema Prisma inicial com multi-tenant
- CI base com instalacao, Prisma generate, typecheck, lint e build

## Proximas tarefas

- Criar primeira migration Prisma
- Implementar autenticacao JWT
- Adicionar RBAC e isolamento por tenant
- Criar CRUD inicial de profissionais, alunos e pacientes
