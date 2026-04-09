// typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
        const body = await req.json()
        const { nome, email, senha, perfil } = body ?? {}

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

        return NextResponse.json({ message: "User created", usuario }, { status: 201 })
}
