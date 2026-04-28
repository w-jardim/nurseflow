CREATE TABLE "refresh_tokens" (
  "id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "token_hash" VARCHAR(128) NOT NULL,
  "expira_em" TIMESTAMP(3) NOT NULL,
  "revogado_em" TIMESTAMP(3),
  "substituido_por" UUID,
  "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX "refresh_tokens_usuario_id_revogado_em_idx" ON "refresh_tokens"("usuario_id", "revogado_em");
CREATE INDEX "refresh_tokens_expira_em_idx" ON "refresh_tokens"("expira_em");

ALTER TABLE "refresh_tokens"
ADD CONSTRAINT "refresh_tokens_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
