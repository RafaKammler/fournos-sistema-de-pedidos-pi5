import { ProdutoForm } from "@/components/produto-form"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function CadastroProdutoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const estabelecimentoId = parseInt(id)

    if (isNaN(estabelecimentoId)) redirect("/restrito/admin")

    const estabelecimento = await prisma.estabelecimento.findUnique({ where: { id: estabelecimentoId } })
    if (!estabelecimento) redirect("/restrito/admin")

    return <ProdutoForm estabelecimentoId={id} />
}