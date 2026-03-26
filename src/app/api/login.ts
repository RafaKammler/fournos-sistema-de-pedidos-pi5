import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request){
    const { email, senha } = await req.json()

    const usuario = await prisma.Usuario.findUnique({
        where: { email },
    })

    if(!usuario || usuario.senha !== senha){
        return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    return NextResponse.json({ message: "Login OK", usuario })
}