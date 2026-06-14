import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const produtoId = parseInt(id)

        if (isNaN(produtoId)) {
            return NextResponse.json({ message: "ID inválido." }, { status: 400 })
        }

        await prisma.produto.delete({ where: { id: produtoId } })
        return NextResponse.json({ message: "Produto excluído com sucesso." }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Erro interno ao tentar excluir." }, { status: 500 })
    }
}