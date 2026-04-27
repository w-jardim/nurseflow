-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'CONFIRMADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "solicitacoes_agendamento" (
    "id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(24),
    "data_desejada" DATE NOT NULL,
    "horario_desejado" VARCHAR(10),
    "observacoes" VARCHAR(1000),
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solicitacoes_agendamento_profissional_id_criado_em_idx" ON "solicitacoes_agendamento"("profissional_id", "criado_em");

-- AddForeignKey
ALTER TABLE "solicitacoes_agendamento" ADD CONSTRAINT "solicitacoes_agendamento_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
