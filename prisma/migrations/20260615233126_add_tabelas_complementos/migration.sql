-- CreateTable
CREATE TABLE "Complemento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "estabelecimentoId" INTEGER NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Complemento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoComplemento" (
    "produtoId" INTEGER NOT NULL,
    "complementoId" INTEGER NOT NULL,

    CONSTRAINT "ProdutoComplemento_pkey" PRIMARY KEY ("produtoId","complementoId")
);

-- AddForeignKey
ALTER TABLE "Complemento" ADD CONSTRAINT "Complemento_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "Estabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoComplemento" ADD CONSTRAINT "ProdutoComplemento_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoComplemento" ADD CONSTRAINT "ProdutoComplemento_complementoId_fkey" FOREIGN KEY ("complementoId") REFERENCES "Complemento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
