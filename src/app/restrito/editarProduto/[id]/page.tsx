import { ProdutoForm } from "@/components/produto-form"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const produtoId = parseInt(id)

    if (isNaN(produtoId)) redirect("/restrito/admin")

    const produto = await prisma.produto.findUnique({ where: { id: produtoId } })
    if (!produto) redirect("/restrito/admin")

    return <ProdutoForm produto={produto} estabelecimentoId={produto.estabelecimentoId.toString()} />
}