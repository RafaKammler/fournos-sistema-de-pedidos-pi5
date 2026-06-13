"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Building2, Users, Settings, Plus, MapPin, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function AdminTabs({ estabelecimentos }: { estabelecimentos: any[] }) {
    const [activeTab, setActiveTab] = useState("estabelecimentos")
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const router = useRouter()

    function formatarTelefone(telefone: string) {
        if (!telefone) return ""
        const limpo = telefone.replace(/\D/g, "")
        if (limpo.length === 11) {
            return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        } else if (limpo.length === 10) {
            return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
        }
        return telefone
    }

    function formatarCep(cep: string) {
        if (!cep) return ""
        const limpo = cep.replace(/\D/g, "")
        if (limpo.length === 8) {
            return limpo.replace(/(\d{5})(\d{3})/, "$1-$2")
        }
        return cep
    }

    async function handleExcluir(id: number, nome: string) {
        if (!confirm(`Tem a certeza que deseja excluir o estabelecimento "${nome}"?`)) {
            return
        }

        setIsDeleting(id)

        try {
            const res = await fetch(`/api/excluirEstabelecimento/${id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast.success("Estabelecimento excluído com sucesso!")
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.message || "Erro ao excluir estabelecimento.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao tentar excluir.")
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex space-x-1 border-b border-border overflow-x-auto">
                <button
                    onClick={() => setActiveTab("estabelecimentos")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "estabelecimentos"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                >
                    <Building2 className="size-4" />
                    Estabelecimentos
                </button>
                <button
                    onClick={() => setActiveTab("usuarios")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "usuarios"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                >
                    <Users className="size-4" />
                    Usuários
                </button>
            </div>

            <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl p-6 min-h-[400px]">
                {activeTab === "estabelecimentos" && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Gerenciamento de Estabelecimentos</h2>
                                <p className="text-sm text-muted-foreground">Visualize e gerencie os restaurantes e cantinas cadastrados.</p>
                            </div>
                            <a href="/restrito/cadastroEstabelecimento">
                                <Button className="gap-2 w-full sm:w-auto">
                                    <Plus className="size-4" />
                                    Novo Estabelecimento
                                </Button>
                            </a>
                        </div>

                        {estabelecimentos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                                <Building2 className="size-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Nenhum estabelecimento</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">Você ainda não possui estabelecimentos cadastrados no sistema.</p>
                                <a href="/restrito/cadastroEstabelecimento">
                                    <Button variant="outline">Cadastrar o primeiro</Button>
                                </a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {estabelecimentos.map((est) => (
                                    <div
                                        key={est.id}
                                        onClick={() => router.push(`/restrito/estabelecimento/${est.id}`)}
                                        className="group relative overflow-hidden rounded-xl border border-border bg-background shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col cursor-pointer"
                                    >
                                        <div className="p-5 flex-1 flex flex-col gap-4">
                                            <div className="flex items-start gap-4">
                                                <img
                                                    src={est.caminhoImagem || "/img.png"}
                                                    alt={est.nome}
                                                    className="size-16 rounded-lg object-cover ring-1 ring-border bg-muted"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors">{est.nome}</h4>
                                                    <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">CNPJ: {est.cnpj}</p>
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                                                {est.descricao}
                                            </p>

                                            <div className="space-y-2 text-sm text-muted-foreground pt-4 border-t border-border/50">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Phone className="size-3.5 shrink-0 text-primary" />
                                                    <span className="truncate">{formatarTelefone(est.telefone)}</span>
                                                </div>
                                                {est.cep && (
                                                    <div className="flex items-center gap-2 truncate">
                                                        <MapPin className="size-3.5 shrink-0 text-primary" />
                                                        <span className="truncate">CEP: {formatarCep(est.cep)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className="p-3 bg-muted/30 border-t border-border grid grid-cols-2 gap-2 relative z-10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <a href={`/restrito/editarEstabelecimento/${est.id}`}>
                                                <Button variant="outline" size="sm" className="w-full">Editar</Button>
                                            </a>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleExcluir(est.id, est.nome)}
                                                disabled={isDeleting === est.id}
                                            >
                                                {isDeleting === est.id ? "A excluir..." : "Excluir"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "usuarios" && (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                        <Settings className="size-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Em breve</p>
                        <p className="text-sm">A aba de gerenciamento de usuários será implementada futuramente.</p>
                    </div>
                )}
            </div>
        </div>
    )
}