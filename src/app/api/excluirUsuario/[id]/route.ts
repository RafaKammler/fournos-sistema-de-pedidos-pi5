import { NextResponse } from "next/server"
import { UsuarioService } from "@/services/usuario.service"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const usuarioId = parseInt(id)

        if (isNaN(usuarioId)) {
            return NextResponse.json({ message: "ID inválido." }, { status: 400 })
        }

        await UsuarioService.excluir(usuarioId)

        return NextResponse.json({ message: "Usuário excluído." }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Erro ao excluir o usuário." }, { status: 400 })
    }
}