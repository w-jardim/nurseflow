ALTER TYPE "OrigemInteresse" ADD VALUE 'SERVICO';

CREATE TABLE "servicos" (
  "id" UUID NOT NULL,
  "profissional_id" UUID NOT NULL,
  "titulo" VARCHAR(160) NOT NULL,
  "descricao" TEXT,
  "preco_centavos" INTEGER NOT NULL DEFAULT 0,
  "exibir_preco" BOOLEAN NOT NULL DEFAULT true,
  "publicado" BOOLEAN NOT NULL DEFAULT true,
  "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em" TIMESTAMP(3) NOT NULL,
  "excluido_em" TIMESTAMP(3),

  CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "servicos"
ADD CONSTRAINT "servicos_profissional_id_fkey"
FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "servicos_profissional_id_publicado_idx" ON "servicos"("profissional_id", "publicado");

ALTER TABLE "interesses_publicos" ADD COLUMN "servico_id" UUID;

ALTER TABLE "interesses_publicos"
ADD CONSTRAINT "interesses_publicos_servico_id_fkey"
FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "interesses_publicos_servico_id_idx" ON "interesses_publicos"("servico_id");
