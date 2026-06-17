import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EstabelecimentoForm } from "@/components/estabelecimento-form"

export default async function PerfilEstabelecimentoPage({
                                                            params
                                                        }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const estabelecimentoId = parseInt(id)

    // 1. Validação de Sessão
    const session = await getSession()
    if (!session || session.perfil !== "GERENTE") {
        redirect("/home")
    }

    const usuarioId = parseInt(session.sub as string)

    // 2. Trava de segurança: Garante que a loja pertence a este Gerente
    const establishment = await prisma.estabelecimento.findFirst({
        where: { id: estabelecimentoId, gerente: { usuarioId: usuarioId } }
    })

    if (!establishment) {
        redirect("/restrito/gerente")
    }

    // A Navbar agora renderiza sozinha dentro do componente abaixo
    return (
        <EstabelecimentoForm
            estabelecimento={establishment}
            returnUrl="/restrito/gerente"
            isGerente={true}
            perfil={session.perfil as string}
        />
    )
}