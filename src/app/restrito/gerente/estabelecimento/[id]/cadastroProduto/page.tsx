import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProdutoForm } from "@/components/produto-form"

export default async function CadastroProdutoGerentePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const estabelecimentoId = parseInt(id)

    // 1. Validação do utilizador
    const session = await getSession()
    if (!session || session.perfil !== "GERENTE") {
        redirect("/home")
    }

    const usuarioId = parseInt(session.sub as string)

    // 2. Trava de segurança: garantir que a loja pertence a este Gerente
    const estabelecimento = await prisma.estabelecimento.findFirst({
        where: { id: estabelecimentoId, gerente: { usuarioId: usuarioId } }
    })

    if (!estabelecimento) {
        redirect("/restrito/gerente")
    }

    // 3. Renderiza o formulário com o redirecionamento correto para o painel do Gerente
    return (
        <ProdutoForm
            estabelecimentoId={id}
            returnUrl={`/restrito/gerente/estabelecimento/${estabelecimentoId}/produtos`}
        />
    )
}