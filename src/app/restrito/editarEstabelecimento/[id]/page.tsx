import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EstabelecimentoForm } from "@/components/estabelecimento-form"

export default async function EditarEstabelecimentoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const estabelecimentoId = parseInt(id)

    if (isNaN(estabelecimentoId)) {
        redirect("/restrito/admin")
    }

    const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: estabelecimentoId }
    })

    if (!estabelecimento) {
        redirect("/restrito/admin")
    }

    return <EstabelecimentoForm estabelecimento={estabelecimento} />
}