import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const estabelecimentoId = parseInt(id)

        if (isNaN(estabelecimentoId)) {
            return NextResponse.json({ message: "ID inválido." }, { status: 400 })
        }

        await prisma.estabelecimento.delete({
            where: { id: estabelecimentoId }
        })

        return NextResponse.json({ message: "Estabelecimento excluído com sucesso." }, { status: 200 })
    } catch (error: any) {
        if (error.code === 'P2003') {
            return NextResponse.json(
                { message: "Não é possível excluir. Existem pedidos registados para este estabelecimento." },
                { status: 400 }
            )
        }

        console.error(error);
        return NextResponse.json({ message: "Erro interno ao tentar excluir." }, { status: 500 })
    }
}