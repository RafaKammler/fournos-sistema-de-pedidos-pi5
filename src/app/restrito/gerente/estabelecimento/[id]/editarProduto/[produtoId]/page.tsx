import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProdutoForm } from "@/components/produto-form"

export default async function EditarProdutoGerentePage({
                                                           params
                                                       }: {
    params: Promise<{ id: string; produtoId: string }>
}) {
    // 1. Desestrutura os parâmetros da URL (Next.js 15+)
    const { id, produtoId } = await params
    const estabelecimentoId = parseInt(id)
    const idDoProduto = parseInt(produtoId)

    // 2. Validação de Sessão
    const session = await getSession()
    if (!session || session.perfil !== "GERENTE") {
        redirect("/home")
    }

    const usuarioId = parseInt(session.sub as string)

    // 3. Trava de segurança 1: Garante que a loja pertence a este Gerente
    const estabelecimento = await prisma.estabelecimento.findFirst({
        where: { id: estabelecimentoId, gerente: { usuarioId: usuarioId } }
    })

    if (!estabelecimento) {
        redirect("/restrito/gerente")
    }

    // 4. Trava de segurança 2: Busca o produto e garante que ele pertence a esta loja
    const produto = await prisma.produto.findFirst({
        where: {
            id: idDoProduto,
            estabelecimentoId: estabelecimentoId
        }
    })

    // Se o produto não existir ou for de outra loja, volta para o cardápio
    if (!produto) {
        redirect(`/restrito/gerente/estabelecimento/${estabelecimentoId}/produtos`)
    }

    // 5. Renderiza o formulário com os dados preenchidos e a rota de retorno correta
    return (
        <ProdutoForm
            produto={produto}
            estabelecimentoId={id}
            returnUrl={`/restrito/gerente/estabelecimento/${estabelecimentoId}/produtos`}
        />
    )
}