import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const estabelecimentoId = parseInt(id)

        const formData = await req.formData()
        const nome = formData.get("nome") as string
        const descricao = formData.get("descricao") as string
        const cnpj = formData.get("cnpj") as string
        const telefone = formData.get("telefone") as string
        const imagem = formData.get("imagem") as File | null
        const cep = formData.get("cep") as string | null

        if (!nome || !descricao || !cnpj || !telefone) {
            return NextResponse.json({ message: "Campos obrigatórios faltando." }, { status: 400 })
        }

        const cnpjExistente = await prisma.estabelecimento.findFirst({
            where: { cnpj, NOT: { id: estabelecimentoId } }
        })

        if (cnpjExistente) {
            return NextResponse.json({ message: "Este CNPJ já está cadastrado em outro estabelecimento." }, { status: 400 })
        }

        let caminhoImagem = undefined

        if (imagem) {
            const bytes = await imagem.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const fileName = `${Date.now()}-${imagem.name.replace(/\s+/g, '_')}`
            const uploadDir = path.join(process.cwd(), "public", "uploads")
            const filepath = path.join(uploadDir, fileName)

            await writeFile(filepath, buffer)
            caminhoImagem = `/uploads/${fileName}`
        }

        const estabelecimento = await prisma.estabelecimento.update({
            where: { id: estabelecimentoId },
            data: {
                nome,
                descricao,
                cnpj,
                telefone,
                cep,
                ...(caminhoImagem && { caminhoImagem })
            }
        })

        return NextResponse.json({ message: "Estabelecimento atualizado com sucesso", estabelecimento }, { status: 200 })

    } catch (error: any) {
        return NextResponse.json({ message: "Erro interno no servidor ao tentar salvar as alterações." }, { status: 500 })
    }
}