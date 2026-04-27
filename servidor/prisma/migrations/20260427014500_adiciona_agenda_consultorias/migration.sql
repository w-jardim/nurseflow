ALTER TABLE "consultorias"
ADD COLUMN "inicio_em" TIMESTAMP(3),
ADD COLUMN "fim_em" TIMESTAMP(3),
ADD COLUMN "status" "StatusConsulta" NOT NULL DEFAULT 'AGENDADA',
ADD COLUMN "observacoes" TEXT;

CREATE INDEX "consultorias_profissional_id_inicio_em_idx" ON "consultorias"("profissional_id", "inicio_em");
