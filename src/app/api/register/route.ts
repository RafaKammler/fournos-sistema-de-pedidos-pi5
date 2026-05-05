import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nome, email, senha, perfil } = body ?? {}

        if (!nome || !email || !senha || !perfil) {
            return NextResponse.json(
                { message: "Todos os campos são obrigatórios." },
                { status: 400 }
            )
        }

        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email }
        })

        if (usuarioExistente) {
            return NextResponse.json(
                { message: "Este email já está registado. Tente fazer login." },
                { status: 409 }
            )
        }

        const hashed = await bcrypt.hash(senha, 10)

        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: hashed,
                perfil,
            },
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
                dataCadastro: true,
            },
        })

        return NextResponse.json(
            { message: "Conta criada com sucesso!", usuario },
            { status: 201 }
        )

    } catch (error) {
        console.error("Erro interno ao registar utilizador:", error)
        return NextResponse.json(
            { message: "Ocorreu um erro interno no servidor. Tente novamente mais tarde." },
            { status: 500 }
        )
    }
}