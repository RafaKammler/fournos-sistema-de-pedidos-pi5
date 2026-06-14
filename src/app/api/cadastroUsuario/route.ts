import { NextResponse } from "next/server"
import { UsuarioService } from "@/services/usuario.service"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const usuario = await UsuarioService.criar(body)

        return NextResponse.json({ message: "Usuário criado", usuario: { id: usuario.id } }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Erro interno no servidor." }, { status: 400 })
    }
}