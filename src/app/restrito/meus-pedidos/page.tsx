import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { StatusPedido } from "@prisma/client"
import Link from "next/link"

export default async function MeusPedidosPage() {
    // 1. Validação da Sessão
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }

    const usuarioId = parseInt(session.sub as string)

    // 2. Procurar os pedidos deste utilizador
    const pedidos = await prisma.pedido.findMany({
        where: { usuarioId: usuarioId },
        include: {
            estabelecimento: {
                select: { nome: true } // Para saber em que loja comprou
            },
            itens: {
                include: {
                    produto: { select: { nome: true } }
                }
            }
        },
        orderBy: { dataPedido: 'desc' } // Os mais recentes primeiro
    })

    // Função visual para colorir as etiquetas de estado
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

    const getStatusText = (status: StatusPedido) => {
        switch (status) {
            case 'PENDENTE': return 'Esperando confirmação'
            case 'PREPARANDO': return 'Em preparação'
            case 'PRONTO': return 'Pronto para retirar'
            case 'FINALIZADO': return 'Concluído'
            case 'CANCELADO': return 'Cancelado'
            default: return status
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar
                perfil={session.perfil as string}
                logo={{ url: "/home", src: "/img.png", alt: "Fournos", title: "Fournos" }}
                menu={[
                    { title: "Home", url: "/home" },
                    { title: "Meus Pedidos", url: "/restrito/meus-pedidos" }
                ]}
            />

            <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">O Meu Histórico de Pedidos</h1>
                    <Link href="/home" className="text-sm text-primary hover:underline font-medium">
                        Fazer novo pedido &rarr;
                    </Link>
                </div>

                {pedidos.length === 0 ? (
                    <div className="p-10 text-center bg-card border rounded-2xl shadow-sm flex flex-col items-center gap-4">
                        <p className="text-muted-foreground text-lg">Ainda não efetuou nenhum pedido.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {pedidos.map(pedido => (
                            <div key={pedido.id} className="p-6 bg-card border rounded-2xl shadow-sm flex flex-col sm:flex-row gap-6 justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg">{pedido.estabelecimento.nome}</h3>
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusStyle(pedido.status)}`}>
                                            {getStatusText(pedido.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Pedido #{pedido.id} • {new Date(pedido.dataPedido).toLocaleDateString('pt-PT')} às {new Date(pedido.dataPedido).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    <div className="pt-3 border-t space-y-1">
                                        {pedido.itens.map(item => (
                                            <p key={item.id} className="text-sm">
                                                <span className="font-medium">{item.quantidade}x</span> {item.produto.nome}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between items-start sm:items-end border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <p className="text-sm text-muted-foreground mb-1">Total pago</p>
                                    <span className="font-bold text-xl text-primary">
                                        R$ {pedido.total.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}