import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { produtoId, complementoId } = await req.json()

        if (!produtoId || !complementoId) {
            return NextResponse.json({ message: "IDs inválidos." }, { status: 400 })
        }

        await prisma.produtoComplemento.create({
            data: {
                produtoId,
                complementoId
            }
        })

        return NextResponse.json({ message: "Vinculado com sucesso" }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Erro ao vincular complemento." }, { status: 500 })
    }
}