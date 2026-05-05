import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const secretKey = process.env.JWT_SECRET || "chave-secreta-fallback"
const key = new TextEncoder().encode(secretKey)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, senha } = body ?? {}

        if (!email || !senha) {
            return NextResponse.json({ message: "Email e senha são obrigatórios." }, { status: 400 })
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email }
        })

        if (!usuario) {
            return NextResponse.json({ message: "Credenciais inválidas." }, { status: 401 })
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha)

        if (!senhaValida) {
            return NextResponse.json({ message: "Credenciais inválidas." }, { status: 401 })
        }

        const token = await new SignJWT({
            sub: usuario.id.toString(),
            perfil: usuario.perfil
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(key)

        const response = NextResponse.json(
            { message: "Login realizado com sucesso!", perfil: usuario.perfil },
            { status: 200 }
        )

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24,
            path: "/"
        })

        return response

    } catch (error) {
        console.error("Erro no login:", error)
        return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 })
    }
}