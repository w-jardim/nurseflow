# Fase 1 - MVP inicial

Objetivo: transformar a fundação técnica em uma plataforma utilizável por profissionais.

## Sprint 03 - Autenticação e Multi-Tenant

Primeira fatia implementada:

- Cadastro de profissional com criação automática de tenant
- Login com JWT de curta duração
- Endpoint autenticado para consultar a sessão atual
- Base para guards, contexto de usuário e tenant por requisição
- Telas frontend para login, cadastro e painel autenticado
- CRUD inicial de alunos e pacientes com isolamento por tenant
- CRUD inicial de cursos com isolamento por tenant
- Estrutura inicial de cursos com módulos e aulas
- Modalidade de curso
- Consultorias como produtos avulsos, separadas de cursos e sem vínculo obrigatório com alunos ou pacientes
- Perfil público do profissional
- Página pública inicial com cursos publicados e consultorias
- Formulário público de interesse sem criação automática de aluno ou paciente
- Listagem de interesses recebidos no painel do profissional
- Agenda inicial de atendimentos vinculada a pacientes do profissional
- Trilha de auditoria básica para ações do profissional

## Endpoints

```http
POST /autenticacao/cadastro-profissional
POST /autenticacao/login
GET /autenticacao/me
GET /alunos
POST /alunos
GET /pacientes
POST /pacientes
GET /cursos
POST /cursos
GET /cursos/:cursoId/modulos
POST /cursos/:cursoId/modulos
POST /cursos/:cursoId/modulos/:moduloId/aulas
GET /consultorias
POST /consultorias
GET /profissionais/me
PUT /profissionais/me
GET /publico/profissionais/:slug
POST /publico/profissionais/:slug/interesses
GET /interesses
GET /consultas
POST /consultas
GET /auditoria
```

## Rotas frontend

```text
/autenticacao/login
/autenticacao/cadastro
/painel
/:slug
```

## Proximas fatias

- Refresh token persistido em Redis
- 2FA para Super Admin
- Decorador de papéis e RBAC em rotas
- Recuperação de senha
- Melhorias de auditoria com filtros e detalhes de segurança
