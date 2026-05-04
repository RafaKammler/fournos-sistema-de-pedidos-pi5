/*
  Warnings:

  - Added the required column `cep` to the `Estabelecimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Estabelecimento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Estabelecimento" ADD COLUMN     "cep" TEXT NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL;
