import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const nome = formData.get("nome") as string
        const descricao = formData.get("descricao") as string
        const preco = parseFloat(formData.get("preco") as string)
        const disponivel = formData.get("disponivel") === "true"
        const estabelecimentoId = parseInt(formData.get("estabelecimentoId") as string)
        const imagem = formData.get("imagem") as File | null

        if (!nome || !descricao || isNaN(preco) || isNaN(estabelecimentoId)) {
            return NextResponse.json({ message: "Dados inválidos." }, { status: 400 })
        }

        let caminhoImagem = null
        if (imagem) {
            const bytes = await imagem.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const fileName = `prod-${Date.now()}-${imagem.name.replace(/\s+/g, '_')}`
            const filepath = path.join(process.cwd(), "public", "uploads", fileName)
            await writeFile(filepath, buffer)
            caminhoImagem = `/uploads/${fileName}`
        }

        const produto = await prisma.produto.create({
            data: { nome, descricao, preco, disponivel, estabelecimentoId, caminhoImagem }
        })

        return NextResponse.json({ message: "Produto cadastrado", produto }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 })
    }
}