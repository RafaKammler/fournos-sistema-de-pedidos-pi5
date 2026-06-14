import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { UsuarioForm } from "@/components/usuario-form"

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const usuarioId = parseInt(id)

    if (isNaN(usuarioId)) {
        redirect("/restrito/admin")
    }

    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: { gerente: true }
    })

    if (!usuario) {
        redirect("/restrito/admin")
    }

    const estabelecimentos = await prisma.estabelecimento.findMany({
        select: { id: true, nome: true, cnpj: true }
    })

    return <UsuarioForm usuario={usuario} estabelecimentos={estabelecimentos} />
}