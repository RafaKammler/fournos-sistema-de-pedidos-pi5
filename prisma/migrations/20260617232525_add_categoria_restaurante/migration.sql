-- CreateEnum
CREATE TYPE "CategoriaEstabelecimento" AS ENUM ('LANCHES', 'REFEICOES', 'SALGADOS', 'DOCES', 'BEBIDAS', 'SAUDAVEL');

-- AlterTable
ALTER TABLE "Estabelecimento" ADD COLUMN     "categoria" "CategoriaEstabelecimento" NOT NULL DEFAULT 'LANCHES';
