import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { StatusPedido } from "@prisma/client"
import { AutoRefresh } from "@/components/ui/auto-refresh"

// A tipagem do params mudou para Promise
export default async function PedidosEstabelecimentoPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Aguarda os parâmetros da URL (Correção para Next.js 15+)
    const { id } = await params
    const estabelecimentoId = parseInt(id)

    // 2. Validação de Sessão
    const session = await getSession()
    if (!session || session.perfil !== "GERENTE") {
        redirect("/home")
    }

    const usuarioId = parseInt(session.sub as string)

    // 3. Segurança: Verifica se o estabelecimento realmente pertence a este gerente logado
    const estabelecimento = await prisma.estabelecimento.findFirst({
        where: {
            id: estabelecimentoId,
            gerente: { usuarioId: usuarioId }
        }
    })

    // Se tentar acessar o ID de uma loja de outro gerente pela URL, é expulso de volta pro painel
    if (!estabelecimento) {
        redirect("/restrito/gerente")
    }

    // 4. Busca os pedidos desta loja
    const pedidos = await prisma.pedido.findMany({
        where: { estabelecimentoId: estabelecimentoId },
        include: {
            usuario: {
                select: { nome: true, email: true } // Dados do cliente
            },
            itens: {
                include: {
                    produto: { select: { nome: true } } // Nomes dos produtos comprados
                }
            }
        },
        orderBy: { dataPedido: 'desc' } // Mais recentes primeiro
    })

    // 5. Server Action embutida para atualizar o status do pedido
    async function atualizarStatus(formData: FormData) {
        "use server"
        const pedidoId = parseInt(formData.get("pedidoId") as string)
        const novoStatus = formData.get("status") as StatusPedido

        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { status: novoStatus },
            include: { estabelecimento: { select: { nome: true } } }
        })

        const statusTxt = novoStatus === 'PREPARANDO' ? 'está sendo preparado' : novoStatus === 'PRONTO' ? 'está PRONTO para retirada!' : 'foi atualizado';

        // Dispara notificação para o usuário (cliente)
        await prisma.notificacao.create({
            data: {
                usuarioId: pedidoAtualizado.usuarioId,
                titulo: `Pedido #${pedidoId} Atualizado!`,
                mensagem: `Seu pedido na loja ${pedidoAtualizado.estabelecimento.nome} agora ${statusTxt}.`
            }
        })

        revalidatePath(`/restrito/gerente/estabelecimento/${estabelecimentoId}/pedidos`)
    }

    // Função auxiliar para traduzir/colorir os status
    const getStatusStyle = (status: StatusPedido) => {
        switch (status) {
            case 'PENDENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'PREPARANDO': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'PRONTO': return 'bg-green-100 text-green-800 border-green-200'
            case 'FINALIZADO': return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'CANCELADO': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar
                perfil={session.perfil as string}
                logo={{ url: "/restrito/gerente", src: "/img.png", alt: "Fournos", title: "Fournos" }}
                menu={[{ title: "Home", url: "/home" }]}
            />

            <AutoRefresh intervalMs={10000} />

            <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/restrito/gerente" className="text-sm text-primary hover:underline">
                        &larr; Voltar ao Painel
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Pedidos: {estabelecimento.nome}
                    </h1>
                </div>

                {pedidos.length === 0 ? (
                    <div className="p-8 text-center bg-card border rounded-xl shadow-sm text-muted-foreground">
                        Nenhum pedido recebido até o momento.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pedidos.map(pedido => (
                            <div key={pedido.id} className="p-5 bg-card border rounded-xl shadow-sm flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs text-muted-foreground">Pedido #{pedido.id}</span>
                                        <h3 className="font-bold text-lg">{pedido.usuario.nome}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(pedido.dataPedido).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getStatusStyle(pedido.status)}`}>
                                        {pedido.status}
                                    </span>
                                </div>

                                <div className="flex-1 mb-4 border-t border-b py-3 space-y-2">
                                    {pedido.itens.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.quantidade}x {item.produto.nome}</span>
                                            <span className="font-medium text-muted-foreground">
                                                R$ {(item.precoUn * item.quantidade).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center mt-auto">
                                    <span className="font-bold text-lg">Total: R$ {pedido.total.toFixed(2)}</span>

                                    {/* Formulário para mudar o status rapidamente */}
                                    {pedido.status !== 'FINALIZADO' && pedido.status !== 'CANCELADO' && (
                                        <form action={atualizarStatus} className="flex gap-2">
                                            <input type="hidden" name="pedidoId" value={pedido.id} />
                                            {pedido.status === 'PENDENTE' && (
                                                <button type="submit" name="status" value="PREPARANDO" className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors">
                                                    Preparar
                                                </button>
                                            )}
                                            {pedido.status === 'PREPARANDO' && (
                                                <button type="submit" name="status" value="PRONTO" className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors">
                                                    Pronto
                                                </button>
                                            )}
                                            {pedido.status === 'PRONTO' && (
                                                <button type="submit" name="status" value="FINALIZADO" className="px-3 py-1 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors">
                                                    Finalizar
                                                </button>
                                            )}
                                        </form>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}