import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { email, senha } = await req.json()

        if (!email || !senha) {
            return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email },
        })

        if (!usuario) {
            return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

        if (!senhaCorreta) {
            return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
        }

        const { senha: _, ...usuarioSemSenha } = usuario

        return NextResponse.json(
            {
                message: "Login bem-sucedido",
                usuario: usuarioSemSenha
            },
            { status: 200 }
        )

    } catch (error) {
        console.error("Erro na API de login:", error)
        return NextResponse.json(
            { error: "Erro interno no servidor." },
            { status: 500 }
        )
    }
}