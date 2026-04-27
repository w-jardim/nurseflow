-- AlterTable
ALTER TABLE "profissionais" ADD COLUMN     "instrucoes_pagamento" TEXT,
ADD COLUMN     "link_pagamento" VARCHAR(500),
ADD COLUMN     "pix_chave" VARCHAR(160);
