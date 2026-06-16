import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nome, preco, estabelecimentoId } = body

        if (!nome || isNaN(preco) || !estabelecimentoId) {
            return NextResponse.json({ message: "Dados inválidos ou incompletos." }, { status: 400 })
        }

        const complemento = await prisma.complemento.create({
            data: {
                nome,
                preco,
                estabelecimentoId
            }
        })

        return NextResponse.json({ message: "Complemento criado com sucesso", complemento }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 })
    }
}