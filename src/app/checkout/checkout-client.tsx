"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, QrCode, CreditCard, Banknote } from "lucide-react"

export default function CheckoutClient() {
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const [metodoPagamento, setMetodoPagamento] = useState<string>("PIX")

    const { items } = useCartStore()
    const router = useRouter()

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true)
    }, [])

    const valorTotal = items.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)

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
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.nome}</p>
                                            <p className="text-sm text-muted-foreground">Qtde: {item.quantidade}</p>
                                        </div>
                                        <p className="font-semibold text-muted-foreground">
                                            R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                ))}
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
                                <button
                                    onClick={() => setMetodoPagamento("PIX")}
                                    className={`flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all ${metodoPagamento === "PIX" ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'}`}
                                >
                                    <QrCode className={`size-6 ${metodoPagamento === "PIX" ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <div>
                                        <p className="font-semibold">PIX</p>
                                        <p className="text-xs text-muted-foreground">Aprovação imediata</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMetodoPagamento("CARTAO")}
                                    className={`flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all ${metodoPagamento === "CARTAO" ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'}`}
                                >
                                    <CreditCard className={`size-6 ${metodoPagamento === "CARTAO" ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <div>
                                        <p className="font-semibold">Cartão (Crédito/Débito)</p>
                                        <p className="text-xs text-muted-foreground">Pagar na maquininha</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMetodoPagamento("DINHEIRO")}
                                    className={`flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all ${metodoPagamento === "DINHEIRO" ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'}`}
                                >
                                    <Banknote className={`size-6 ${metodoPagamento === "DINHEIRO" ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <div>
                                        <p className="font-semibold">Dinheiro</p>
                                        <p className="text-xs text-muted-foreground">Pagar na retirada</p>
                                    </div>
                                </button>
                            </div>
                        </section>

                        <section className="bg-card text-card-foreground p-6 rounded-2xl border shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold text-muted-foreground">Total:</span>
                                <span className="text-lg font-bold text-primary">
                                    R$ {valorTotal.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            <Button className="w-full h-11 text-base font-semibold rounded-xl cursor-pointer transition-transform active:scale-[0.98]" onClick={() => alert(`Enviando pedido com pagamento via ${metodoPagamento}!`)}>
                                Confirmar Pedido
                            </Button>
                        </section>
                    </div>

                </div>
            )}
        </main>
    )
}