import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.JWT_SECRET || "chave-secreta-fallback"
const key = new TextEncoder().encode(secretKey)

export async function POST(req: Request) {
    try {
        // 1. Verifica se o usuário cliente está logado (pega o token do cookie)
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) {
            return NextResponse.json({ message: "Você precisa estar logado para fazer um pedido." }, { status: 401 })
        }

        const { payload } = await jwtVerify(token, key)
        const usuarioId = parseInt(payload.sub as string)

        // 2. Recebe os dados do carrinho de compras enviados pelo frontend
        const body = await req.json()
        const { estabelecimentoId, itens, total } = body

        if (!estabelecimentoId || !itens || itens.length === 0) {
            return NextResponse.json({ message: "Carrinho vazio ou estabelecimento não informado." }, { status: 400 })
        }

        // 3. Cria o Pedido e os Itens do Pedido no banco de dados
        // Usamos uma transação embutida do Prisma para garantir que salva tudo ou não salva nada
        const novoPedido = await prisma.pedido.create({
            data: {
                usuarioId: usuarioId,
                estabelecimentoId: parseInt(estabelecimentoId),
                total: parseFloat(total),
                status: 'PENDENTE', // Todo pedido novo nasce como pendente
                itens: {
                    create: itens.map((item: any) => ({
                        produtoId: item.produtoId,
                        quantidade: item.quantidade,
                        precoUn: parseFloat(item.precoUn) // Salvamos o preço do momento da compra
                    }))
                }
            }
        })

        await prisma.notificacao.create({
            data: {
                estabelecimentoId: parseInt(estabelecimentoId),
                titulo: "Novo Pedido!",
                mensagem: `O pedido #${novoPedido.id} acabou de chegar.`
            }
        })

        return NextResponse.json({
            message: "Pedido realizado com sucesso!",
            pedidoId: novoPedido.id
        }, { status: 201 })

    } catch (error) {
        console.error("Erro ao processar checkout:", error)
        return NextResponse.json({ message: "Erro interno ao processar o pedido." }, { status: 500 })
    }
}