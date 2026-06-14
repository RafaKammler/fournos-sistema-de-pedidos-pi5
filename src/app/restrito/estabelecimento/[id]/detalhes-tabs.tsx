"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    ArrowLeft, Package, MapPin, Phone, FileText, Mail, Plus, UtensilsCrossed, Edit
} from "lucide-react"

export function DetalhesTabs({ estabelecimento }: { estabelecimento: any }) {
    const [activeTab, setActiveTab] = useState("produtos")
    const [isDeletingProd, setIsDeletingProd] = useState<number | null>(null)
    const router = useRouter()

    const produtos = estabelecimento.produtos || []

    function formatarTelefone(telefone: string) {
        if (!telefone) return ""
        const limpo = telefone.replace(/\D/g, "")
        if (limpo.length === 11) return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        if (limpo.length === 10) return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
        return telefone
    }

    function formatarCep(cep: string) {
        if (!cep) return ""
        const limpo = cep.replace(/\D/g, "")
        if (limpo.length === 8) return limpo.replace(/(\d{5})(\d{3})/, "$1-$2")
        return cep
    }

    function formatarCNPJ(cnpj: string) {
        if (!cnpj) return ""
        const limpo = cnpj.replace(/\D/g, "")
        if (limpo.length === 14) return limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
        return cnpj
    }

    function formatarMoeda(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    async function handleExcluirProduto(id: number, nome: string) {
        if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) return

        setIsDeletingProd(id)
        try {
            const res = await fetch(`/api/excluirProduto/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Produto excluído com sucesso!")
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.message || "Erro ao excluir produto.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao tentar excluir.")
        } finally {
            setIsDeletingProd(null)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/restrito/admin')} className="shrink-0">
                    <ArrowLeft className="size-4" />
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{estabelecimento.nome}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerencie as informações e o cardápio deste estabelecimento.</p>
                </div>
            </div>

            <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                        <img
                            src={estabelecimento.caminhoImagem || "/img.png"}
                            alt={estabelecimento.nome}
                            className="w-full aspect-square object-cover rounded-xl border border-border shadow-sm bg-muted"
                        />
                        <Button variant="outline" className="w-full" onClick={() => router.push(`/restrito/editarEstabelecimento/${estabelecimento.id}`)}>
                            Editar Informações
                        </Button>
                    </div>

                    <div className="w-full md:w-2/3 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Sobre</h3>
                            <p className="text-muted-foreground leading-relaxed">{estabelecimento.descricao}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Contato e Registro</h3>
                                <div className="flex items-start gap-3">
                                    <FileText className="size-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">CNPJ</p>
                                        <p className="text-muted-foreground">{formatarCNPJ(estabelecimento.cnpj)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="size-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">Telefone</p>
                                        <p className="text-muted-foreground">{formatarTelefone(estabelecimento.telefone)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Endereço</h3>
                                <div className="flex items-start gap-3">
                                    <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-muted-foreground">{estabelecimento.rua ? `${estabelecimento.rua}` : "Rua não informada"}</p>
                                        <p className="text-muted-foreground">{estabelecimento.cidade && estabelecimento.estado ? `${estabelecimento.cidade} - ${estabelecimento.estado}` : "Cidade/Estado não informados"}</p>
                                        <p className="text-muted-foreground">{estabelecimento.cep ? `CEP: ${formatarCep(estabelecimento.cep)}` : "CEP não informado"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex space-x-1 border-b border-border overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("produtos")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === "produtos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                    >
                        <Package className="size-4" />
                        Produtos
                    </button>
                </div>

                <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl p-6 min-h-[400px]">
                    {activeTab === "produtos" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">Catálogo de Produtos</h2>
                                    <p className="text-sm text-muted-foreground">Gerencie o cardápio e os itens disponíveis neste estabelecimento.</p>
                                </div>
                                <a href={`/restrito/estabelecimento/${estabelecimento.id}/cadastroProduto`}>
                                    <Button className="gap-2 w-full sm:w-auto">
                                        <Plus className="size-4" />
                                        Novo Produto
                                    </Button>
                                </a>
                            </div>

                            {produtos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                                    <UtensilsCrossed className="size-12 text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium">Nenhum produto cadastrado</h3>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4">Este estabelecimento ainda não possui itens no cardápio.</p>
                                    <a href={`/restrito/estabelecimento/${estabelecimento.id}/cadastroProduto`}>
                                        <Button variant="outline">Adicionar primeiro produto</Button>
                                    </a>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {produtos.map((prod: any) => (
                                        <div key={prod.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-all">
                                            <div className="aspect-video w-full relative bg-muted border-b border-border">
                                                <img
                                                    src={prod.caminhoImagem || "/img.png"}
                                                    alt={prod.nome}
                                                    className="w-full h-full object-cover"
                                                />
                                                {!prod.disponivel && (
                                                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
                                                        Indisponivel
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h4 className="font-semibold text-base line-clamp-1">{prod.nome}</h4>
                                                    <span className="font-bold text-primary shrink-0">{formatarMoeda(prod.preco)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">{prod.descricao}</p>
                                                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border">
                                                    <a href={`/restrito/editarProduto/${prod.id}`}>
                                                        <Button variant="outline" size="sm" className="w-full gap-2"><Edit className="size-3"/> Editar</Button>
                                                    </a>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => handleExcluirProduto(prod.id, prod.nome)}
                                                        disabled={isDeletingProd === prod.id}
                                                    >
                                                        {isDeletingProd === prod.id ? "Excluindo..." : "Excluir"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}