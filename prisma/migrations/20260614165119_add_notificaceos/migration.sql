-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('AVISO', 'INFORMATIVA');

-- CreateEnum
CREATE TYPE "StatusNotificacao" AS ENUM ('NAO_LIDA', 'LIDA');

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL DEFAULT 'INFORMATIVA',
    "status" "StatusNotificacao" NOT NULL DEFAULT 'NAO_LIDA',
    "estabelecimentoId" INTEGER NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "Estabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
