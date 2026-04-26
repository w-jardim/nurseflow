-- CreateEnum
CREATE TYPE "ModalidadeConsultoria" AS ENUM ('ONLINE', 'PRESENCIAL');

-- CreateEnum
CREATE TYPE "ModalidadeCurso" AS ENUM ('ONLINE', 'PRESENCIAL');

-- CreateEnum
CREATE TYPE "OrigemInteresse" AS ENUM ('PERFIL', 'CURSO', 'CONSULTORIA');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('SUPER_ADMIN', 'PROFISSIONAL', 'ALUNO', 'PACIENTE');

-- CreateEnum
CREATE TYPE "PlanoProfissional" AS ENUM ('GRATUITO', 'PRO', 'STANDARD');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'INADIMPLENTE', 'CANCELADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "StatusConsulta" AS ENUM ('AGENDADA', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "StatusCurso" AS ENUM ('RASCUNHO', 'PUBLICADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'ESTORNADO');

-- CreateTable
CREATE TABLE "alunos" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "usuario_id" UUID,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(24),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "excluido_em" TIMESTAMP(3),
    "cpf" VARCHAR(11),
    "sobrenome" VARCHAR(120),

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "plano" "PlanoProfissional" NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "mercado_pago_referencia" TEXT,
    "proxima_cobranca_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "cancelado_em" TIMESTAMP(3),

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aulas_curso" (
    "id" UUID NOT NULL,
    "modulo_id" UUID NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "descricao" TEXT,
    "video_referencia" TEXT,
    "duracao_segundos" INTEGER,
    "ordem" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aulas_curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes_pagina" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "cor_primaria" VARCHAR(16) NOT NULL DEFAULT '#0f766e',
    "cor_destaque" VARCHAR(16) NOT NULL DEFAULT '#2563eb',
    "logo_url" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pagina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "inicio_em" TIMESTAMP(3) NOT NULL,
    "fim_em" TIMESTAMP(3) NOT NULL,
    "status" "StatusConsulta" NOT NULL DEFAULT 'AGENDADA',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultorias" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "descricao" TEXT,
    "modalidade" "ModalidadeConsultoria" NOT NULL DEFAULT 'ONLINE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "preco_centavos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "consultorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "preco_centavos" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusCurso" NOT NULL DEFAULT 'RASCUNHO',
    "publicado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "excluido_em" TIMESTAMP(3),
    "modalidade" "ModalidadeCurso" NOT NULL DEFAULT 'ONLINE',

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscricoes_curso" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "curso_id" UUID NOT NULL,
    "aluno_id" UUID NOT NULL,
    "transacao_id" UUID,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido_em" TIMESTAMP(3),

    CONSTRAINT "inscricoes_curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interesses_publicos" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "curso_id" UUID,
    "consultoria_id" UUID,
    "origem" "OrigemInteresse" NOT NULL DEFAULT 'PERFIL',
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(24),
    "mensagem" TEXT,
    "visualizado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interesses_publicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" UUID NOT NULL,
    "profissional_id" UUID,
    "usuario_id" UUID,
    "acao" VARCHAR(120) NOT NULL,
    "entidade" VARCHAR(120),
    "entidade_id" VARCHAR(80),
    "ip" VARCHAR(64),
    "metadados" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulos_curso" (
    "id" UUID NOT NULL,
    "curso_id" UUID NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "ordem" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modulos_curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "usuario_id" UUID,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255),
    "telefone" VARCHAR(24),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "excluido_em" TIMESTAMP(3),
    "cpf" VARCHAR(11),
    "sobrenome" VARCHAR(120),
    "bairro" VARCHAR(80),
    "cep" VARCHAR(8),
    "cidade" VARCHAR(80),
    "complemento" VARCHAR(80),
    "logradouro" VARCHAR(160),
    "numero" VARCHAR(20),
    "uf" VARCHAR(2),

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profissionais" (
    "id" UUID NOT NULL,
    "usuario_dono_id" UUID NOT NULL,
    "nome_publico" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "subdominio" VARCHAR(80),
    "bio" TEXT,
    "documento" VARCHAR(32),
    "conselho" VARCHAR(40),
    "telefone" VARCHAR(24),
    "plano" "PlanoProfissional" NOT NULL DEFAULT 'GRATUITO',
    "status_assinatura" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "excluido_em" TIMESTAMP(3),

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progressos_aula" (
    "id" UUID NOT NULL,
    "inscricao_id" UUID NOT NULL,
    "aula_id" UUID NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progressos_aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "taxa_plataforma_centavos" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "mercado_pago_referencia" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL,
    "profissional_id" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acesso_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "excluido_em" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alunos_profissional_id_cpf_key" ON "alunos"("profissional_id" ASC, "cpf" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "alunos_profissional_id_email_key" ON "alunos"("profissional_id" ASC, "email" ASC);

-- CreateIndex
CREATE INDEX "alunos_profissional_id_nome_idx" ON "alunos"("profissional_id" ASC, "nome" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "alunos_usuario_id_key" ON "alunos"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "assinaturas_profissional_id_status_idx" ON "assinaturas"("profissional_id" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "aulas_curso_modulo_id_ordem_key" ON "aulas_curso"("modulo_id" ASC, "ordem" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_pagina_profissional_id_key" ON "configuracoes_pagina"("profissional_id" ASC);

-- CreateIndex
CREATE INDEX "consultas_profissional_id_inicio_em_idx" ON "consultas"("profissional_id" ASC, "inicio_em" ASC);

-- CreateIndex
CREATE INDEX "consultorias_profissional_id_modalidade_idx" ON "consultorias"("profissional_id" ASC, "modalidade" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "cursos_profissional_id_slug_key" ON "cursos"("profissional_id" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "cursos_profissional_id_status_idx" ON "cursos"("profissional_id" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "inscricoes_curso_curso_id_aluno_id_key" ON "inscricoes_curso"("curso_id" ASC, "aluno_id" ASC);

-- CreateIndex
CREATE INDEX "inscricoes_curso_profissional_id_idx" ON "inscricoes_curso"("profissional_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "inscricoes_curso_transacao_id_key" ON "inscricoes_curso"("transacao_id" ASC);

-- CreateIndex
CREATE INDEX "interesses_publicos_consultoria_id_idx" ON "interesses_publicos"("consultoria_id" ASC);

-- CreateIndex
CREATE INDEX "interesses_publicos_curso_id_idx" ON "interesses_publicos"("curso_id" ASC);

-- CreateIndex
CREATE INDEX "interesses_publicos_profissional_id_criado_em_idx" ON "interesses_publicos"("profissional_id" ASC, "criado_em" ASC);

-- CreateIndex
CREATE INDEX "logs_auditoria_profissional_id_criado_em_idx" ON "logs_auditoria"("profissional_id" ASC, "criado_em" ASC);

-- CreateIndex
CREATE INDEX "logs_auditoria_usuario_id_criado_em_idx" ON "logs_auditoria"("usuario_id" ASC, "criado_em" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_curso_curso_id_ordem_key" ON "modulos_curso"("curso_id" ASC, "ordem" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_profissional_id_cpf_key" ON "pacientes"("profissional_id" ASC, "cpf" ASC);

-- CreateIndex
CREATE INDEX "pacientes_profissional_id_nome_idx" ON "pacientes"("profissional_id" ASC, "nome" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_usuario_id_key" ON "pacientes"("usuario_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_slug_key" ON "profissionais"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_subdominio_key" ON "profissionais"("subdominio" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_usuario_dono_id_key" ON "profissionais"("usuario_dono_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "progressos_aula_inscricao_id_aula_id_key" ON "progressos_aula"("inscricao_id" ASC, "aula_id" ASC);

-- CreateIndex
CREATE INDEX "transacoes_profissional_id_status_idx" ON "transacoes"("profissional_id" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email" ASC);

-- CreateIndex
CREATE INDEX "usuarios_profissional_id_idx" ON "usuarios"("profissional_id" ASC);

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aulas_curso" ADD CONSTRAINT "aulas_curso_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos_curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracoes_pagina" ADD CONSTRAINT "configuracoes_pagina_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultorias" ADD CONSTRAINT "consultorias_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes_curso" ADD CONSTRAINT "inscricoes_curso_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes_curso" ADD CONSTRAINT "inscricoes_curso_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes_curso" ADD CONSTRAINT "inscricoes_curso_transacao_id_fkey" FOREIGN KEY ("transacao_id") REFERENCES "transacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interesses_publicos" ADD CONSTRAINT "interesses_publicos_consultoria_id_fkey" FOREIGN KEY ("consultoria_id") REFERENCES "consultorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interesses_publicos" ADD CONSTRAINT "interesses_publicos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interesses_publicos" ADD CONSTRAINT "interesses_publicos_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos_curso" ADD CONSTRAINT "modulos_curso_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_usuario_dono_id_fkey" FOREIGN KEY ("usuario_dono_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progressos_aula" ADD CONSTRAINT "progressos_aula_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas_curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progressos_aula" ADD CONSTRAINT "progressos_aula_inscricao_id_fkey" FOREIGN KEY ("inscricao_id") REFERENCES "inscricoes_curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
