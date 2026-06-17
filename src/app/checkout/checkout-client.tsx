"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, QrCode, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function CheckoutClient() {
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const [mostrarQrCode, setMostrarQrCode] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false) // Controle de carregamento

    const { items, limparCarrinho } = useCartStore()
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Cálculo do valor total somando os complementos corretamente
    const valorTotal = items.reduce((acc, item) => {
        const totalComplementos = item.complementos?.reduce((cAcc, c) => cAcc + (c.preco * c.quantidade), 0) || 0;
        return acc + ((item.precoBase + totalComplementos) * item.quantidade);
    }, 0);

    const handleAbrirPagamento = () => {
        setMostrarQrCode(true)
    }

    const handleFinalizarPedido = async () => {
        if (items.length === 0) return;
        setIsSubmitting(true);

        try {
            // Assume que todos os produtos do carrinho pertencem ao mesmo estabelecimento
            const estabelecimentoId = items[0].estabelecimentoId;

            // Formata o payload exigido pela nossa API de checkout
            const payload = {
                estabelecimentoId,
                total: valorTotal,
                itens: items.map(item => {
                    const totalComplementos = item.complementos?.reduce((acc, c) => acc + (c.preco * c.quantidade), 0) || 0;
                    return {
                        produtoId: item.produtoId,
                        quantidade: item.quantidade,
                        precoUn: item.precoBase + totalComplementos
                    };
                })
            };

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Falha ao registrar o pedido no sistema.");
            }

            toast.success("Pedido confirmado com sucesso!", {
                description: "Recebemos a confirmação do seu PIX e o pedido já foi para a cantina.",
            })

            setMostrarQrCode(false)
            limparCarrinho()
            router.push("/restrito/meus-pedidos")

        } catch (error) {
            const mensagem = error instanceof Error ? error.message : "Tente novamente em instantes.";
            toast.error("Erro ao finalizar", {
                description: mensagem
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isMounted) return null

    return (
        <main className="container mx-auto p-4 max-w-5xl mt-6">

            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" className="rounded-xl cursor-pointer" onClick={() => router.push("/home")}>
                    <ArrowLeft className="size-5" />
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold">Finalizar Pedido</h1>
            </div>

            {items.length === 0 ? (
                <div className="bg-card text-card-foreground p-10 rounded-2xl border text-center flex flex-col items-center gap-4 shadow-sm">
                    <p className="text-muted-foreground text-lg">Seu carrinho está vazio.</p>
                    <Button className="cursor-pointer" onClick={() => router.push("/home")}>
                        Voltar para o Início
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <section className="bg-card text-card-foreground p-6 rounded-2xl border shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 border-b border-border/50 pb-3">Resumo dos Itens</h2>
                            <div className="flex flex-col gap-4">
                                {items.map((item) => {
                                    const totalComplementos = item.complementos?.reduce((acc, c) => acc + (c.preco * c.quantidade), 0) || 0;
                                    const precoFinalItem = item.precoBase + totalComplementos;

                                    return (
                                        <div key={item.cartItemId} className="flex flex-col py-3 border-b border-border/30 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-foreground">{item.nome}</p>
                                                    <p className="text-sm text-muted-foreground">Qtde: {item.quantidade}</p>
                                                </div>
                                                <p className="font-semibold text-foreground">
                                                    R$ {(precoFinalItem * item.quantidade).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>

                                            {item.complementos && item.complementos.length > 0 && (
                                                <div className="mt-2 pl-3 border-l-2 border-primary/20 flex flex-col gap-1">
                                                    {item.complementos.map(c => (
                                                        <p key={c.id} className="text-xs text-muted-foreground flex justify-between">
                                                            <span>+ {c.quantidade}x {c.nome}</span>
                                                            <span>R$ {(c.preco * c.quantidade).toFixed(2).replace('.', ',')}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="bg-card text-card-foreground p-6 rounded-2xl border shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 border-b border-border/50 pb-3">Retirada</h2>
                            <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
                                <p className="font-medium">Retirar no balcão</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Apresente o comprovante gerado ao final na cantina para retirar seu pedido.
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <section className="bg-card text-card-foreground p-6 rounded-2xl border shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 border-b border-border/50 pb-3">Pagamento</h2>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center gap-3 p-4 rounded-xl border border-primary bg-primary/5 ring-1 ring-primary text-left">
                                    <QrCode className="size-6 text-primary" />
                                    <div>
                                        <p className="font-semibold">PIX</p>
                                        <p className="text-xs text-muted-foreground">Único método disponível no momento</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-card text-card-foreground p-6 rounded-2xl border shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold text-muted-foreground">Total:</span>
                                <span className="text-lg font-bold text-primary">
                                    R$ {valorTotal.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            <Button
                                className="w-full h-11 text-base font-semibold rounded-xl cursor-pointer transition-transform active:scale-[0.98] gap-2"
                                onClick={handleAbrirPagamento}
                            >
                                <QrCode className="size-5" />
                                Gerar QR Code PIX
                            </Button>
                        </section>
                    </div>
                </div>
            )}

            {/* MODAL DO QR CODE ESTÁTICO */}
            <Dialog open={mostrarQrCode} onOpenChange={setMostrarQrCode}>
                <DialogContent className="sm:max-w-md flex flex-col items-center p-8 sm:rounded-3xl">
                    <DialogHeader className="flex flex-col items-center w-full">
                        <DialogTitle className="text-2xl font-bold text-center">Pagamento PIX</DialogTitle>
                    </DialogHeader>

                    <p className="text-muted-foreground text-center mt-2 text-sm">
                        Escaneie o QR Code abaixo com o aplicativo do seu banco para pagar o valor de <strong className="text-foreground text-base">R$ {valorTotal.toFixed(2).replace('.', ',')}</strong>.
                    </p>

                    {/* Caixa do QR Code */}
                    <div className="my-6 p-2 bg-white rounded-2xl border-4 border-primary/20 shadow-sm relative h-56 w-56">
                        <Image
                            src="/qr_code.jpg"
                            alt="QR Code PIX"
                            fill
                            className="object-contain p-2"
                        />
                    </div>

                    <p className="text-xs text-muted-foreground text-center mb-6 bg-muted p-3 rounded-lg border">
                        Após finalizar a transferência pelo seu banco, clique no botão abaixo para confirmar seu pedido na cantina.
                    </p>

                    <Button
                        className="w-full h-12 text-base font-bold rounded-xl cursor-pointer flex items-center gap-2"
                        onClick={handleFinalizarPedido}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            "Já realizei o pagamento"
                        )}
                    </Button>
                </DialogContent>
            </Dialog>

        </main>
    )
}