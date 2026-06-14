import { prisma } from "@/lib/prisma"
import { UsuarioForm } from "@/components/usuario-form"

export default async function CadastroUsuarioPage() {
    const estabelecimentos = await prisma.estabelecimento.findMany({
        select: { id: true, nome: true, cnpj: true }
    })

    return <UsuarioForm estabelecimentos={estabelecimentos} />
}