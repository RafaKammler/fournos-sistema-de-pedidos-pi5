import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const produtoId = parseInt(id)

        const formData = await req.formData()
        const nome = formData.get("nome") as string
        const descricao = formData.get("descricao") as string
        const preco = parseFloat(formData.get("preco") as string)
        const disponivel = formData.get("disponivel") === "true"
        const imagem = formData.get("imagem") as File | null

        if (!nome || !descricao || isNaN(preco)) {
            return NextResponse.json({ message: "Dados inválidos." }, { status: 400 })
        }

        let caminhoImagem = undefined
        if (imagem) {
            const bytes = await imagem.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const fileName = `prod-${Date.now()}-${imagem.name.replace(/\s+/g, '_')}`
            const filepath = path.join(process.cwd(), "public", "uploads", fileName)
            await writeFile(filepath, buffer)
            caminhoImagem = `/uploads/${fileName}`
        }

        const produto = await prisma.produto.update({
            where: { id: produtoId },
            data: { nome, descricao, preco, disponivel, ...(caminhoImagem && { caminhoImagem }) }
        })

        return NextResponse.json({ message: "Produto atualizado" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 })
    }
}