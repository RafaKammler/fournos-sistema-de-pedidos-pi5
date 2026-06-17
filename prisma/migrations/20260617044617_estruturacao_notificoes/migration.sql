-- AlterTable
ALTER TABLE "Notificacao" ADD COLUMN     "usuarioId" INTEGER,
ALTER COLUMN "estabelecimentoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
