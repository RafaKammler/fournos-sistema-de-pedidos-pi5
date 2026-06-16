"use client"

import { useState } from "react"
import Image from "next/image"
import { useCartStore } from "@/store/cartStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart } from "lucide-react"

// Tipagem baseada no include do Prisma
type ProdutoComRelacoes = {
    id: number
    nome: string
    descricao: string
    preco: number
    caminhoImagem: string | null
    estabelecimentoId: number
    complementos: {
        complemento: {
            id: number
            nome: string
            preco: number
        }
    }[]
}

export function ProdutoCard({ produto }: { produto: ProdutoComRelacoes }) {
    const { addItem } = useCartStore()
    const [open, setOpen] = useState(false)

    // Estados do Modal
    const [quantidade, setQuantidade] = useState(1)
    const [complementos, setComplementos] = useState<Record<number, number>>({})

    // Função para alterar quantidade dos adicionais
    const alterarComplemento = (id: number, delta: number) => {
        setComplementos(prev => {
            const atual = prev[id] || 0
            const novaQtd = Math.max(0, atual + delta)

            if (novaQtd === 0) {
                const { [id]: _, ...resto } = prev
                return resto
            }
            return { ...prev, [id]: novaQtd }
        })
    }

    // Cálculos Financeiros Dinâmicos
    const totalComplementos = produto.complementos.reduce((acc, rel) => {
        const qtd = complementos[rel.complemento.id] || 0
        return acc + (rel.complemento.preco * qtd)
    }, 0)

    const valorUnitario = produto.preco + totalComplementos
    const valorTotal = valorUnitario * quantidade

    // Função de enviar para o Zustand
    const handleAdicionarAoCarrinho = () => {
        const adicionaisFormatados = produto.complementos
            .filter(rel => complementos[rel.complemento.id] > 0)
            .map(rel => ({
                id: rel.complemento.id,
                nome: rel.complemento.nome,
                preco: rel.complemento.preco,
                quantidade: complementos[rel.complemento.id]
            }))

        addItem({
            cartItemId: crypto.randomUUID(), // ID único para essa montagem no carrinho
            produtoId: produto.id,
            nome: produto.nome,
            precoBase: produto.preco,
            quantidade: quantidade,
            caminhoImagem: produto.caminhoImagem,
            estabelecimentoId: produto.estabelecimentoId,
            complementos: adicionaisFormatados
        })

        // Reseta o modal e fecha
        setQuantidade(1)
        setComplementos({})
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* O CARD QUE FICA NA TELA */}
            <DialogTrigger className="group w-full text-left cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex gap-4 focus:outline-none focus:ring-2 focus:ring-primary/50">
                {produto.caminhoImagem && (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={produto.caminhoImagem} alt={produto.nome} fill className="object-cover" />
                    </div>
                )}
                <div className="flex flex-col flex-1 justify-between">
                    <div>
                        <h3 className="font-semibold text-lg">{produto.nome}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{produto.descricao}</p>
                    </div>
                    <span className="font-bold text-primary mt-2">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
                </div>
            </DialogTrigger>

            {/* O MODAL QUE ABRE AO CLICAR */}
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-foreground">{produto.nome}</DialogTitle>
                </DialogHeader>

                {produto.caminhoImagem && (
                    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted mb-2">
                        <Image src={produto.caminhoImagem} alt={produto.nome} fill className="object-cover" />
                    </div>
                )}

                <p className="text-muted-foreground">{produto.descricao}</p>

                {/* LISTA DE COMPLEMENTOS */}
                {produto.complementos.length > 0 && (
                    <div className="mt-6 border-t border-border/50 pt-4">
                        <h4 className="font-semibold mb-4 text-lg text-foreground">Turbine seu pedido</h4>
                        <div className="flex flex-col gap-4">
                            {produto.complementos.map(({ complemento }) => (
                                <div key={complemento.id} className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{complemento.nome}</span>
                                        <span className="text-sm text-muted-foreground">+ R$ {complemento.preco.toFixed(2).replace('.', ',')}</span>
                                    </div>

                                    {/* CONTADOR DO COMPLEMENTO */}
                                    <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-lg border border-border/50">
                                        <button
                                            onClick={() => alterarComplemento(complemento.id, -1)}
                                            className="p-1.5 hover:bg-background rounded-md transition-colors text-primary cursor-pointer"
                                        >
                                            <Minus className="size-4" />
                                        </button>
                                        <span className="w-4 text-center font-medium text-foreground">
                                            {complementos[complemento.id] || 0}
                                        </span>
                                        <button
                                            onClick={() => alterarComplemento(complemento.id, 1)}
                                            className="p-1.5 hover:bg-background rounded-md transition-colors text-primary cursor-pointer"
                                        >
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RODAPÉ: QUANTIDADE TOTAL E ADICIONAR */}
                <div className="mt-8 pt-5 border-t border-border/50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">Quantidade:</span>

                        {/* CONTADOR DE QUANTIDADE PRINCIPAL (Reduzido) */}
                        <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border/50">
                            <button
                                onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                                className="p-1.5 bg-background hover:bg-muted rounded-md transition-colors shadow-sm cursor-pointer text-foreground"
                            >
                                <Minus className="size-3" />
                            </button>
                            <span className="w-6 text-center font-semibold text-base text-foreground">{quantidade}</span>
                            <button
                                onClick={() => setQuantidade(q => q + 1)}
                                className="p-1.5 bg-background hover:bg-muted rounded-md transition-colors shadow-sm cursor-pointer text-foreground"
                            >
                                <Plus className="size-3" />
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleAdicionarAoCarrinho}
                        className="w-full h-11 text-base font-semibold rounded-xl gap-2 transition-transform active:scale-[0.98] cursor-pointer"
                    >
                        <ShoppingCart className="size-5" />
                        Adicionar • R$ {valorTotal.toFixed(2).replace('.', ',')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}