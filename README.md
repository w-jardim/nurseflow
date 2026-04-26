# NurseFlow

Plataforma SaaS para profissionais de saude criarem paginas publicas, venderem cursos, gerenciarem alunos/pacientes e organizarem atendimentos.

## Stack

- Frontend: React 18, TypeScript, Vite, TailwindCSS
- Backend: Node.js 20, NestJS, Prisma
- Banco: PostgreSQL 16
- Cache: Redis 7
- Monorepo: Turborepo + npm workspaces

## Estrutura

```text
nurseflow/
├── aplicacao/           # Frontend React
├── servidor/            # Backend NestJS
├── compartilhado/       # Tipos, validadores e constantes
├── docker/              # Dockerfiles
├── infraestrutura/      # Nginx e deploy
├── docs/                # Documentacao
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Como rodar localmente

```bash
npm install
cp .env.exemplo .env
docker compose up -d postgres redis
npm run prisma:generate
npm run dev
```

Servicos:

- Web: http://localhost:5173
- API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Scripts principais

```bash
npm run dev              # inicia aplicacao e servidor
npm run build            # build de todos os pacotes
npm run lint             # lint de todos os pacotes
npm run typecheck        # checagem TypeScript
npm run prisma:generate  # gera Prisma Client
npm run prisma:migrate   # executa migrations locais
```

## Status

Fase 0 iniciada:

- Monorepo configurado
- Aplicacao React base criada
- Servidor NestJS base criado
- Pacote compartilhado criado
- Docker Compose com PostgreSQL e Redis
- Schema Prisma inicial
- CI base no GitHub Actions
