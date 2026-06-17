"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    ArrowLeft, Package, MapPin, Phone, FileText, Mail, Plus, UtensilsCrossed, Edit, ClipboardList, Search, Filter, Calendar
} from "lucide-react"

export function DetalhesTabs({ estabelecimento }: { estabelecimento: any }) {
    const [activeTab, setActiveTab] = useState("produtos")
    const [isDeletingProd, setIsDeletingProd] = useState<number | null>(null)
    const [searchProduto, setSearchProduto] = useState("")
    const [statusProduto, setStatusProduto] = useState("todos")
    const router = useRouter()

    const produtos = estabelecimento.produtos || []

    const filteredProdutos = produtos.filter((prod: any) => {
        const matchesSearch = prod.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
            prod.descricao.toLowerCase().includes(searchProduto.toLowerCase())

        const matchesStatus = statusProduto === "todos" ? true :
            statusProduto === "disponivel" ? prod.disponivel === true :
                statusProduto === "esgotado" ? prod.disponivel === false : true

        return matchesSearch && matchesStatus
    })

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
                            src={estabelecimento.caminhoImagem || "/favicon.ico"}
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
                    <button
                        onClick={() => setActiveTab("pedidos")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === "pedidos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                    >
                        <ClipboardList className="size-4" />
                        Histórico de Pedidos
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

                            {produtos.length > 0 && (
                                <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Buscar produto por nome ou descrição..."
                                            value={searchProduto}
                                            onChange={(e) => setSearchProduto(e.target.value)}
                                            className="w-full bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                    <select
                                        value={statusProduto}
                                        onChange={(e) => setStatusProduto(e.target.value)}
                                        className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-48"
                                    >
                                        <option value="todos">Status (Todos)</option>
                                        <option value="disponivel">Disponíveis</option>
                                        <option value="esgotado">Esgotados</option>
                                    </select>
                                </div>
                            )}

                            {produtos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                                    <UtensilsCrossed className="size-12 text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium">Nenhum produto cadastrado</h3>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4">Este estabelecimento ainda não possui itens no cardápio.</p>
                                    <a href={`/restrito/estabelecimento/${estabelecimento.id}/cadastroProduto`}>
                                        <Button variant="outline">Adicionar primeiro produto</Button>
                                    </a>
                                </div>
                            ) : filteredProdutos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                                    <Search className="size-12 text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros de busca para encontrar o que procura.</p>
                                    <Button variant="link" onClick={() => { setSearchProduto(""); setStatusProduto("todos"); }} className="mt-2">
                                        Limpar filtros
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProdutos.map((prod: any) => (
                                        <div
                                            key={prod.id}
                                            onClick={() => router.push(`/restrito/produto/${prod.id}`)}
                                            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                                        >
                                            <div className="aspect-video w-full relative bg-muted border-b border-border">
                                                <img
                                                    src={prod.caminhoImagem || "/favicon.ico"}
                                                    alt={prod.nome}
                                                    className="w-full h-full object-cover"
                                                />
                                                {!prod.disponivel && (
                                                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
                                                        Esgotado
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h4 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{prod.nome}</h4>
                                                    <span className="font-bold text-primary shrink-0">{formatarMoeda(prod.preco)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">{prod.descricao}</p>
                                                <div
                                                    className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
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

                    {activeTab === "pedidos" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">Histórico de Pedidos</h2>
                                    <p className="text-sm text-muted-foreground">Visualize e filtre os pedidos realizados neste estabelecimento.</p>
                                </div>
                                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                                    <Filter className="size-4" />
                                    Exportar Relatório
                                </Button>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por código ou nome do cliente..."
                                        className="w-full bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <select className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-48">
                                        <option value="">Status (Todos)</option>
                                        <option value="pendente">Pendente</option>
                                        <option value="preparando">Em Preparo</option>
                                        <option value="concluido">Concluído</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                    <div className="relative w-full sm:w-48">
                                        <Calendar className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                        <select className="w-full bg-background border border-input rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                            <option value="hoje">Hoje</option>
                                            <option value="7dias">Últimos 7 dias</option>
                                            <option value="30dias">Últimos 30 dias</option>
                                            <option value="todos">Todo o período</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                                <ClipboardList className="size-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-md">O histórico e o rastreamento de pedidos serão ativados assim que a funcionalidade for implementada no banco de dados.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}