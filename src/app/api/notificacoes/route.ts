import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { StatusNotificacao } from "@prisma/client"

const secretKey = process.env.JWT_SECRET || "chave-secreta-fallback"
const key = new TextEncoder().encode(secretKey)

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) return NextResponse.json({ message: "Não autorizado" }, { status: 401 })

        const { payload } = await jwtVerify(token, key)
        const usuarioId = parseInt(payload.sub as string)
        const perfil = payload.perfil as string

        let whereClause: any = { status: StatusNotificacao.NAO_LIDA }

        // Se for gerente, busca notificações dele E das lojas dele
        if (perfil === 'GERENTE') {
            const gerente = await prisma.gerente.findUnique({
                where: { usuarioId }, include: { estabelecimentos: true }
            })
            const estIds = gerente?.estabelecimentos.map(e => e.id) || []
            whereClause.OR = [
                { usuarioId: usuarioId },
                { estabelecimentoId: { in: estIds } }
            ]
        } else {
            whereClause.usuarioId = usuarioId
        }

        const notificacoes = await prisma.notificacao.findMany({
            where: whereClause,
            orderBy: { dataCriacao: 'desc' },
            take: 5
        })

        return NextResponse.json(notificacoes)
    } catch (error) {
        return NextResponse.json({ message: "Erro ao buscar notificações" }, { status: 500 })
    }
}

export async function PUT() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) return NextResponse.json({ message: "Não autorizado" }, { status: 401 })

        const { payload } = await jwtVerify(token, key)
        const usuarioId = parseInt(payload.sub as string)
        const perfil = payload.perfil as string

        let whereClause: any = { status: StatusNotificacao.NAO_LIDA }

        if (perfil === 'GERENTE') {
            const gerente = await prisma.gerente.findUnique({
                where: { usuarioId }, include: { estabelecimentos: true }
            })
            const estIds = gerente?.estabelecimentos.map(e => e.id) || []
            whereClause.OR = [
                { usuarioId: usuarioId },
                { estabelecimentoId: { in: estIds } }
            ]
        } else {
            whereClause.usuarioId = usuarioId
        }

        await prisma.notificacao.updateMany({
            where: whereClause,
            data: { status: StatusNotificacao.LIDA }
        })

        return NextResponse.json({ message: "Notificações lidas" })
    } catch (error) {
        return NextResponse.json({ message: "Erro ao atualizar notificações" }, { status: 500 })
    }
}