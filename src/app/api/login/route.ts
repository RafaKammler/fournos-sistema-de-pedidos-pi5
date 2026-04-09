import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    const { email, senha } = await req.json()

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

    return NextResponse.json({ message: "Login OK", usuario })
}