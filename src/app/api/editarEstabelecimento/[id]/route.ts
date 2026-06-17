import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"
import { getSession } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1. Validação de Sessão e Permissões
        const session = await getSession()
        if (!session || (session.perfil !== "ADMIN" && session.perfil !== "GERENTE")) {
            return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 })
        }

        const usuarioId = parseInt(session.sub as string)
        const { id } = await params
        const estabelecimentoId = parseInt(id)

        // 2. Trava de segurança: Se for GERENTE, verificar se a loja é dele
        if (session.perfil === "GERENTE") {
            const estDoGerente = await prisma.estabelecimento.findFirst({
                where: { id: estabelecimentoId, gerente: { usuarioId: usuarioId } }
            })
            if (!estDoGerente) {
                return NextResponse.json({ message: "Acesso negado a este estabelecimento." }, { status: 403 })
            }
        }

        // 3. Capturar os dados enviados pelo formulário
        const formData = await req.formData()
        const nome = formData.get("nome") as string
        const descricao = formData.get("descricao") as string
        const categoria = formData.get("categoria") as string;
        let cnpj = formData.get("cnpj") as string | null
        const telefone = formData.get("telefone") as string
        const imagem = formData.get("imagem") as File | null
        const cep = formData.get("cep") as string | null

        if (!nome || !descricao || !telefone) {
            return NextResponse.json({ message: "Campos obrigatórios faltando." }, { status: 400 })
        }

        // 4. Lógica de segurança do CNPJ
        if (session.perfil === "GERENTE") {
            // Ignoramos qualquer CNPJ enviado pelo Gerente, garantindo que não será alterado
            cnpj = null
        } else if (session.perfil === "ADMIN" && cnpj) {
            // Apenas o Admin pode tentar alterar o CNPJ, então checamos se já existe
            const cnpjExistente = await prisma.estabelecimento.findFirst({
                where: { cnpj, NOT: { id: estabelecimentoId } }
            })

            if (cnpjExistente) {
                return NextResponse.json({ message: "Este CNPJ já está cadastrado em outro estabelecimento." }, { status: 400 })
            }
        }

        // 5. Upload da nova Imagem (se houver)
        let caminhoImagem = undefined

        if (imagem && typeof imagem !== 'string') {
            const bytes = await imagem.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const fileName = `${Date.now()}-${imagem.name.replace(/\s+/g, '_')}`
            const uploadDir = path.join(process.cwd(), "public", "uploads")
            const filepath = path.join(uploadDir, fileName)

            await writeFile(filepath, buffer)
            caminhoImagem = `/uploads/${fileName}`
        }

        // 6. Preparar os dados para atualizar
        const updateData: any = {
            nome,
            descricao,
            categoria: categoria as any,
            telefone,
            cep: cep || undefined, // Apenas atualiza se não for nulo
            ...(caminhoImagem && { caminhoImagem }) // Só atualiza a imagem se uma nova for enviada
        }

        // Só atualiza o CNPJ no banco se for o ADMIN fazendo a edição
        if (session.perfil === "ADMIN" && cnpj) {
            updateData.cnpj = cnpj
        }

        // 7. Salvar as alterações no banco de dados
        const estabelecimento = await prisma.estabelecimento.update({
            where: { id: estabelecimentoId },
            data: updateData
        })

        return NextResponse.json({ message: "Estabelecimento atualizado com sucesso", estabelecimento }, { status: 200 })

    } catch (error: any) {
        console.error("Erro na API editarEstabelecimento:", error)
        return NextResponse.json({ message: "Erro interno no servidor ao tentar salvar as alterações." }, { status: 500 })
    }
}