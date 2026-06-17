import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChefHat, Clock, ShoppingBag, MapPin, Receipt, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/ui/navbar";

export default async function DetalhesPedidoPage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    const pedidoId = parseInt(id);

    if (isNaN(pedidoId)) {
        redirect("/restrito/meus-pedidos");
    }

    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const usuarioId = parseInt(session.sub as string);

    const pedido = await prisma.pedido.findUnique({
        where: {
            id: pedidoId
        },
        include: {
            estabelecimento: { select: { nome: true } },
            itens: {
                include: { produto: { select: { nome: true } } }
            }
        }
    });

    if (!pedido || pedido.usuarioId !== usuarioId) {
        redirect("/restrito/meus-pedidos");
    }

    const statusAtual = pedido.status;

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

            <main className="container mx-auto p-4 max-w-4xl mt-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/restrito/meus-pedidos">
                        <Button variant="outline" size="icon" className="rounded-xl cursor-pointer">
                            <ArrowLeft className="size-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pedido #{pedido.id}</h1>
                        <p className="text-muted-foreground text-sm">
                            Realizado em {new Date(pedido.dataPedido).toLocaleDateString('pt-BR')} às {new Date(pedido.dataPedido).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* COLUNA ESQUERDA: LINHA DO TEMPO */}
                    <div className="md:col-span-7 flex flex-col gap-6">
                        <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Status do Pedido</h2>

                            {statusAtual === "CANCELADO" ? (
                                <div className="flex items-center gap-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                                    <XCircle className="size-8" />
                                    <div>
                                        <h4 className="font-bold text-lg">Pedido Cancelado</h4>
                                        <p className="text-sm opacity-80">Este pedido foi cancelado e não será preparado.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8 w-full relative pl-2">
                                    {/* Linha conectora vertical */}
                                    <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-border -z-10"></div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shrink-0 z-10 shadow-sm ring-4 ring-background">
                                            <Clock className="size-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Aguardando Confirmação</h4>
                                            <p className="text-sm text-muted-foreground">A cantina está analisando seu pedido.</p>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-6 transition-all duration-500 ${statusAtual === "PENDENTE" ? "opacity-40" : "opacity-100"}`}>
                                        <div className={`flex items-center justify-center size-12 rounded-full shrink-0 z-10 ring-4 ring-background ${statusAtual !== "PENDENTE" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground border border-border"}`}>
                                            <ChefHat className="size-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Em Preparo</h4>
                                            <p className="text-sm text-muted-foreground">Seu lanche está sendo montado com carinho.</p>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-6 transition-all duration-500 ${(statusAtual === "PRONTO" || statusAtual === "FINALIZADO") ? "opacity-100" : "opacity-40"}`}>
                                        <div className={`flex items-center justify-center size-12 rounded-full shrink-0 z-10 ring-4 ring-background ${(statusAtual === "PRONTO" || statusAtual === "FINALIZADO") ? "bg-green-500 text-white shadow-sm" : "bg-muted text-muted-foreground border border-border"}`}>
                                            <ShoppingBag className="size-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{statusAtual === "FINALIZADO" ? "Pedido Retirado!" : "Pronto para Retirada!"}</h4>
                                            <p className="text-sm text-muted-foreground">{statusAtual === "FINALIZADO" ? "Agradecemos a preferência." : "O lanche está te esperando no balcão."}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* COLUNA DIREITA: DETALHES DO RECIBO */}
                    <div className="md:col-span-5 flex flex-col gap-6">
                        <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                                <Receipt className="size-5 text-primary" />
                                <h2 className="text-lg font-semibold">Detalhes da Compra</h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                {pedido.itens.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start border-b border-border/30 pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{item.quantidade}x {item.produto.nome}</p>
                                        </div>
                                        <p className="font-medium">R$ {(item.precoUn * item.quantidade).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                <span className="font-medium text-muted-foreground">Total Pago (PIX)</span>
                                <span className="text-xl font-bold text-primary">R$ {pedido.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </section>

                        <section className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="size-5 text-primary" />
                                <h3 className="font-semibold">Local de Retirada</h3>
                            </div>
                            <p className="text-sm text-muted-foreground pl-8">
                                <strong className="text-foreground">{pedido.estabelecimento.nome}</strong><br/>
                                Apresente o número do pedido (# {pedido.id}) no balcão ao ser chamado.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}