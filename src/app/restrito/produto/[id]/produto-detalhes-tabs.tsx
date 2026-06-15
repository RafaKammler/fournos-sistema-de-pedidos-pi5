"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Layers, Edit, Info, Plus, X } from "lucide-react"
import { toast } from "sonner"

export function ProdutoDetalhesTabs({ produto, complementosDisponiveis = [] }: { produto: any, complementosDisponiveis: any[] }) {
    const [activeTab, setActiveTab] = useState("complementos")
    const [selectedComplementoId, setSelectedComplementoId] = useState("")
    const [isLinking, setIsLinking] = useState(false)
    const [isUnlinking, setIsUnlinking] = useState<number | null>(null)
    const router = useRouter()

    const complementosVinculados = produto.complementos?.map((pc: any) => pc.complemento) || []
    const complementosNaoVinculados = complementosDisponiveis.filter(
        (cd) => !complementosVinculados.some((cv: any) => cv.id === cd.id)
    )

    function formatarMoeda(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    async function handleVincular(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedComplementoId) return

        setIsLinking(true)
        try {
            const res = await fetch("/api/vincularComplemento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    produtoId: produto.id,
                    complementoId: parseInt(selectedComplementoId)
                })
            })

            if (res.ok) {
                toast.success("Complemento vinculado com sucesso!")
                setSelectedComplementoId("")
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.message || "Erro ao vincular complemento.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao tentar vincular.")
        } finally {
            setIsLinking(false)
        }
    }

    async function handleDesvincular(complementoId: number) {
        if (!confirm("Deseja desvincular este complemento do produto?")) return

        setIsUnlinking(complementoId)
        try {
            const res = await fetch("/api/desvincularComplemento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    produtoId: produto.id,
                    complementoId: complementoId
                })
            })

            if (res.ok) {
                toast.success("Complemento desvinculado com sucesso!")
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.message || "Erro ao desvincular complemento.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao tentar desvincular.")
        } finally {
            setIsUnlinking(null)
        }
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
                        <div className="space-y-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-lg font-semibold">Vincular Complemento</h2>
                                <p className="text-sm text-muted-foreground">Selecione um complemento já cadastrado no estabelecimento para oferecer neste produto.</p>

                                <form onSubmit={handleVincular} className="flex flex-col sm:flex-row gap-3 mt-2">
                                    <select
                                        value={selectedComplementoId}
                                        onChange={(e) => setSelectedComplementoId(e.target.value)}
                                        className="flex h-10 w-full sm:max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        required
                                    >
                                        <option value="">Selecione um complemento...</option>
                                        {complementosNaoVinculados.map((comp: any) => (
                                            <option key={comp.id} value={comp.id}>
                                                {comp.nome} - {formatarMoeda(comp.preco)}
                                            </option>
                                        ))}
                                    </select>
                                    <Button type="submit" disabled={isLinking || !selectedComplementoId || complementosNaoVinculados.length === 0} className="gap-2 shrink-0">
                                        <Plus className="size-4" />
                                        {isLinking ? "Vinculando..." : "Vincular"}
                                    </Button>
                                </form>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <h2 className="text-lg font-semibold mb-4">Complementos Vinculados</h2>

                                {complementosVinculados.length === 0 ? (
                                    <div className="text-sm text-muted-foreground py-6 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                                        Nenhum complemento está vinculado a este produto no momento.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {complementosVinculados.map((comp: any) => (
                                            <div key={comp.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background shadow-sm">
                                                <div>
                                                    <p className="font-semibold">{comp.nome}</p>
                                                    <p className="text-sm text-primary font-medium">{formatarMoeda(comp.preco)}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDesvincular(comp.id)}
                                                    disabled={isUnlinking === comp.id}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}