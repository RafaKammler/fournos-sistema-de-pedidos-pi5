import { NextResponse } from "next/server"
import { UsuarioService } from "@/services/usuario.service"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const usuarioId = parseInt(id)
        const body = await req.json()

        await UsuarioService.atualizar(usuarioId, body)

        return NextResponse.json({ message: "Usuário atualizado" }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Erro interno no servidor." }, { status: 400 })
    }
}