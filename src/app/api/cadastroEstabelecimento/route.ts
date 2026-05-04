import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()

        const nome = formData.get("nome") as string
        const descricao = formData.get("descricao") as string
        const cnpj = formData.get("cnpj") as string
        const telefone = formData.get("telefone") as string
        const gerenteEmail = formData.get("gerenteEmail") as string | null
        const imagem = formData.get("imagem") as File | null
        const cep =  formData.get("cep") as String | null

        if (!nome || !descricao || !cnpj || !telefone || !imagem) {
            return NextResponse.json({ message: "Campos obrigatórios faltando, incluindo a imagem." }, { status: 400 })
        }

        const cnpjExistente = await prisma.estabelecimento.findUnique({
            where: { cnpj }
        })

        if (cnpjExistente) {
            return NextResponse.json({ message: "Este CNPJ já está cadastrado no sistema." }, { status: 400 })
        }

        const bytes = await imagem.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const fileName = `${Date.now()}-${imagem.name.replace(/\s+/g, '_')}`

        const uploadDir = path.join(process.cwd(), "public", "uploads")
        const filepath = path.join(uploadDir, fileName)

        await writeFile(filepath, buffer)

        const caminhoImagem = `/uploads/${fileName}`


        let idDoGerenteParaConectar = undefined;

        if (gerenteEmail) {
            const usuario = await prisma.usuario.findUnique({
                where: { email: gerenteEmail },
                include: { gerente: true }
            })

            if (!usuario) {
                return NextResponse.json({ message: `Nenhum usuário encontrado com o email ${gerenteEmail}.` }, { status: 404 })
            }

            if (usuario.gerente) {
                idDoGerenteParaConectar = usuario.gerente.id;
            } else {
                const novoGerente = await prisma.gerente.create({
                    data: { usuarioId: usuario.id }
                });
                idDoGerenteParaConectar = novoGerente.id;
            }
        }

        const estabelecimento = await prisma.estabelecimento.create({
            data: {
                nome,
                descricao,
                cnpj,
                telefone,
                caminhoImagem,
                cep,

                ...(idDoGerenteParaConectar && {
                    gerentes: {
                        connect: { id: idDoGerenteParaConectar }
                    }
                })
            }
        })

        return NextResponse.json(
            { message: "Estabelecimento cadastrado com sucesso", estabelecimento },
            { status: 201 }
        )

    } catch (error: any) {
        console.error("Erro ao cadastrar estabelecimento:", error)
        return NextResponse.json(
            { message: "Erro interno no servidor ao tentar salvar os dados." },
            { status: 500 }
        )
    }
}