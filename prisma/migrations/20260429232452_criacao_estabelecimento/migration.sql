/*
  Warnings:

  - Changed the type of `perfil` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('A', 'U', 'G');

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "perfil",
ADD COLUMN     "perfil" "Perfil" NOT NULL;

-- CreateTable
CREATE TABLE "Gerente" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "estabelecimentoId" INTEGER,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gerente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estabelecimento" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "caminhoImagem" TEXT NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estabelecimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gerente_usuarioId_key" ON "Gerente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Estabelecimento_cnpj_key" ON "Estabelecimento"("cnpj");

-- AddForeignKey
ALTER TABLE "Gerente" ADD CONSTRAINT "Gerente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gerente" ADD CONSTRAINT "Gerente_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "Estabelecimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
