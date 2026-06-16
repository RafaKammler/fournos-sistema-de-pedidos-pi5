import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { produtoId, complementoId } = await req.json()

        if (!produtoId || !complementoId) {
            return NextResponse.json({ message: "IDs inválidos." }, { status: 400 })
        }

        await prisma.produtoComplemento.delete({
            where: {
                produtoId_complementoId: {
                    produtoId,
                    complementoId
                }
            }
        })

        return NextResponse.json({ message: "Desvinculado com sucesso" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Erro ao desvincular complemento." }, { status: 500 })
    }
}