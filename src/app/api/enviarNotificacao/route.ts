import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { titulo, mensagem, tipo, estabelecimentoId } = body

        if (!titulo || !mensagem || !tipo || !estabelecimentoId) {
            return NextResponse.json({ message: "Preencha todos os campos obrigatórios." }, { status: 400 })
        }

        if (estabelecimentoId === "TODOS") {
            const estabelecimentos = await prisma.estabelecimento.findMany({ select: { id: true } })

            if (estabelecimentos.length === 0) {
                return NextResponse.json({ message: "Nenhum estabelecimento cadastrado para receber notificações." }, { status: 400 })
            }

            const notificacoes = estabelecimentos.map(est => ({
                titulo,
                mensagem,
                tipo,
                estabelecimentoId: est.id
            }))

            await prisma.notificacao.createMany({
                data: notificacoes
            })
        } else {
            await prisma.notificacao.create({
                data: {
                    titulo,
                    mensagem,
                    tipo,
                    estabelecimentoId: parseInt(estabelecimentoId)
                }
            })
        }

        return NextResponse.json({ message: "Notificação enviada com sucesso!" }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Erro ao enviar notificação." }, { status: 500 })
    }
}