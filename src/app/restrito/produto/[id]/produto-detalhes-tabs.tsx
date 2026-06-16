"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Layers, Edit, Info, AlertCircle } from "lucide-react"

export function ProdutoDetalhesTabs({ produto }: { produto: any }) {
    const [activeTab, setActiveTab] = useState("complementos")
    const router = useRouter()

    function formatarMoeda(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push(`/restrito/estabelecimento/${produto.estabelecimentoId}`)} className="shrink-0">
                    <ArrowLeft className="size-4" />
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{produto.nome}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Produto pertencente a <span className="font-medium text-foreground">{produto.estabelecimento?.nome}</span>
                    </p>
                </div>
            </div>

            <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                        <div className="aspect-square w-full relative rounded-xl border border-border shadow-sm bg-muted overflow-hidden">
                            <img
                                src={produto.caminhoImagem || "/img.png"}
                                alt={produto.nome}
                                className="w-full h-full object-cover"
                            />
                            {!produto.disponivel && (
                                <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                    Esgotado
                                </div>
                            )}
                        </div>
                        <Button variant="outline" className="w-full gap-2" onClick={() => router.push(`/restrito/editarProduto/${produto.id}`)}>
                            <Edit className="size-4" />
                            Editar Produto
                        </Button>
                    </div>

                    <div className="w-full md:w-2/3 space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-primary">{formatarMoeda(produto.preco)}</h3>
                                <p className="text-sm text-muted-foreground mt-1">Preço base do produto</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${
                                produto.disponivel
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20"
                                    : "bg-destructive/10 text-destructive ring-destructive/20"
                            }`}>
                                {produto.disponivel ? "Disponível em Estoque" : "Indisponível / Esgotado"}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                <Info className="size-5 text-primary" />
                                Descrição e Detalhes
                            </h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {produto.descricao}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex space-x-1 border-b border-border overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("complementos")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === "complementos"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                    >
                        <Layers className="size-4" />
                        Complementos
                    </button>
                </div>

                <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl p-6 min-h-[300px]">
                    {activeTab === "complementos" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">Grupos de Complementos</h2>
                                    <p className="text-sm text-muted-foreground">Configure os adicionais e opções extras para este produto.</p>
                                </div>
                                <Button className="gap-2 w-full sm:w-auto" disabled>
                                    Nova Opção
                                </Button>
                            </div>

                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                                <AlertCircle className="size-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">Em breve</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                                    A funcionalidade de adicionar complementos, acompanhamentos e variações aos produtos será implementada na próxima etapa.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}