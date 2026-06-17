"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Building2, Users, Plus, MapPin, Phone, Shield, UserCog, User, Bell, Send, X, BellRing, Layers, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export function AdminTabs({ estabelecimentos, usuarios = [], complementos = [] }: { estabelecimentos: any[], usuarios?: any[], complementos?: any[] }) {
    const [activeTab, setActiveTab] = useState("estabelecimentos")
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [isDeletingUser, setIsDeletingUser] = useState<number | null>(null)
    const [isDeletingComplemento, setIsDeletingComplemento] = useState<number | null>(null)
    const [isSending, setIsSending] = useState(false)
    const [showNotificacaoModal, setShowNotificacaoModal] = useState<number | "TODOS" | false>(false)
    const [showComplementoModal, setShowComplementoModal] = useState(false)
    const [isSavingComplemento, setIsSavingComplemento] = useState(false)

    // Estados para filtros
    const [selectedEstComplemento, setSelectedEstComplemento] = useState<string>("")
    const [searchEst, setSearchEst] = useState("")
    const [searchUser, setSearchUser] = useState("")
    const [filterPerfil, setFilterPerfil] = useState("todos")

    const router = useRouter()

    const [notificacaoForm, setNotificacaoForm] = useState({
        titulo: "",
        mensagem: "",
        tipo: "INFORMATIVA"
    })

    const [complementoForm, setComplementoForm] = useState({
        nome: "",
        preco: "",
        estabelecimentoId: ""
    })

    // Lógica de Filtragem
    const filteredComplementos = selectedEstComplemento
        ? complementos.filter(comp => comp.estabelecimentoId.toString() === selectedEstComplemento)
        : []

    const filteredEstabelecimentos = estabelecimentos.filter((est: any) => {
        const query = searchEst.toLowerCase()
        return (
            est.nome.toLowerCase().includes(query) ||
            (est.cnpj && est.cnpj.includes(query)) ||
            (est.descricao && est.descricao.toLowerCase().includes(query))
        )
    })

    const filteredUsuarios = usuarios.filter((user: any) => {
        const query = searchUser.toLowerCase()
        const matchesSearch = user.nome.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
        const matchesPerfil = filterPerfil === "todos" ? true : user.perfil === filterPerfil.toUpperCase()

        return matchesSearch && matchesPerfil
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

    function formatarMoedaInput(valor: string) {
        const apenasDigitos = valor.replace(/\D/g, "")
        const numero = parseFloat(apenasDigitos) / 100
        if (isNaN(numero)) return ""
        return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    function formatarMoeda(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    async function handleExcluir(id: number, nome: string) {
        if (!confirm(`Tem a certeza que deseja excluir o estabelecimento "${nome}"?`)) return
        setIsDeleting(id)
        try {
            const res = await fetch(`/api/excluirEstabelecimento/${id}`, { method: "DELETE" })
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

    async function handleExcluirUsuario(id: number, nome: string, perfil: string) {
        let mensagem = `Tem a certeza que deseja excluir o usuário "${nome}"?`
        if (perfil === "GERENTE") {
            mensagem = `O usuário "${nome}" é um gerente. Ao excluí-lo, ele será desvinculado do seu estabelecimento e a conta será apagada. Deseja continuar?`
        }
        if (!confirm(mensagem)) return
        setIsDeletingUser(id)
        try {
            const res = await fetch(`/api/excluirUsuario/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Usuário excluído com sucesso!")
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.message || "Erro ao excluir usuário.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao tentar excluir.")
        } finally {
            setIsDeletingUser(null)
        }
    }

    async function handleExcluirComplemento(id: number, nome: string) {
        if (!confirm(`Tem a certeza que deseja excluir o complemento "${nome}"? Ele será removido de todos os produtos vinculados.`)) return
        setIsDeletingComplemento(id)
        try {
            const res = await fetch(`/api/excluirComplemento/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Complemento excluído com sucesso!")
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.message || "Erro ao excluir complemento.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao tentar excluir.")
        } finally {
            setIsDeletingComplemento(null)
        }
    }

    async function handleEnviarNotificacao(e: React.FormEvent) {
        e.preventDefault()
        setIsSending(true)

        try {
            const payload = {
                ...notificacaoForm,
                estabelecimentoId: showNotificacaoModal
            }

            const res = await fetch("/api/enviarNotificacao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success("Notificação enviada com sucesso!")
                setNotificacaoForm({ titulo: "", mensagem: "", tipo: "INFORMATIVA" })
                setShowNotificacaoModal(false)
            } else {
                const data = await res.json()
                toast.error(data.message || "Erro ao enviar notificação.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao tentar enviar.")
        } finally {
            setIsSending(false)
        }
    }

    async function handleSalvarComplemento(e: React.FormEvent) {
        e.preventDefault()
        setIsSavingComplemento(true)

        try {
            const precoFormatado = parseFloat(complementoForm.preco.replace(/\./g, "").replace(",", "."))
            const res = await fetch("/api/cadastroComplemento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: complementoForm.nome,
                    preco: precoFormatado,
                    estabelecimentoId: parseInt(complementoForm.estabelecimentoId)
                })
            })

            if (res.ok) {
                toast.success("Complemento cadastrado com sucesso!")
                setComplementoForm({ nome: "", preco: "", estabelecimentoId: selectedEstComplemento })
                setShowComplementoModal(false)
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.message || "Erro ao cadastrar complemento.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao tentar cadastrar.")
        } finally {
            setIsSavingComplemento(false)
        }
    }

    return (
        <div className="space-y-6 relative">
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

            <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl p-6 min-h-[400px]">

                {/* ABA ESTABELECIMENTOS */}
                {activeTab === "estabelecimentos" && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Gerenciamento de Estabelecimentos</h2>
                                <p className="text-sm text-muted-foreground">Visualize e gerencie os restaurantes e cantinas cadastrados.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="gap-2 w-full sm:w-auto"
                                    onClick={() => setShowNotificacaoModal("TODOS")}
                                >
                                    <BellRing className="size-4" />
                                    Notificar Todos
                                </Button>
                                <a href="/restrito/cadastroEstabelecimento" className="w-full sm:w-auto">
                                    <Button className="gap-2 w-full">
                                        <Plus className="size-4" />
                                        Novo Estabelecimento
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {estabelecimentos.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome, descrição ou CNPJ..."
                                        value={searchEst}
                                        onChange={(e) => setSearchEst(e.target.value)}
                                        className="w-full bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>
                        )}

                        {estabelecimentos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                                <Building2 className="size-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Nenhum estabelecimento</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">Você ainda não possui estabelecimentos cadastrados no sistema.</p>
                                <a href="/restrito/cadastroEstabelecimento">
                                    <Button variant="outline">Cadastrar o primeiro</Button>
                                </a>
                            </div>
                        ) : filteredEstabelecimentos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                                <Search className="size-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">Nenhum resultado</h3>
                                <p className="text-sm text-muted-foreground mt-1">Nenhum estabelecimento encontrado com os filtros informados.</p>
                                <Button variant="link" onClick={() => setSearchEst("")} className="mt-2">
                                    Limpar busca
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredEstabelecimentos.map((est: any) => (
                                    <div
                                        key={est.id}
                                        onClick={() => router.push(`/restrito/estabelecimento/${est.id}`)}
                                        className="group relative overflow-hidden rounded-xl border border-border bg-background shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col cursor-pointer"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm hover:bg-background border border-border shadow-sm rounded-full"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowNotificacaoModal(est.id)
                                            }}
                                        >
                                            <Bell className="size-4 text-foreground" />
                                        </Button>

                                        <div className="p-5 flex-1 flex flex-col gap-4">
                                            <div className="flex items-start gap-4">
                                                <img
                                                    src={est.caminhoImagem || "/favicon.ico"}
                                                    alt={est.nome}
                                                    className="size-16 rounded-lg object-cover ring-1 ring-border bg-muted"
                                                />
                                                <div className="flex-1 min-w-0 pr-8">
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

                {/* ABA USUARIOS */}
                {activeTab === "usuarios" && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Gerenciamento de Usuários</h2>
                                <p className="text-sm text-muted-foreground">Visualize e gerencie os administradores, gerentes e clientes do sistema.</p>
                            </div>
                            <a href="/restrito/cadastroUsuario" className="w-full sm:w-auto">
                                <Button className="gap-2 w-full">
                                    <Plus className="size-4" />
                                    Novo Usuário
                                </Button>
                            </a>
                        </div>

                        {usuarios.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome ou e-mail..."
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        className="w-full bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <select
                                    value={filterPerfil}
                                    onChange={(e) => setFilterPerfil(e.target.value)}
                                    className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-48"
                                >
                                    <option value="todos">Todos os Perfis</option>
                                    <option value="admin">Administrador</option>
                                    <option value="gerente">Gerente</option>
                                    <option value="usuario">Cliente (Usuário)</option>
                                </select>
                            </div>
                        )}

                        {usuarios.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                                <Users className="size-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Nenhum usuário</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">Ainda não existem outros usuários cadastrados.</p>
                            </div>
                        ) : filteredUsuarios.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                                <Search className="size-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
                                <p className="text-sm text-muted-foreground mt-1">Não encontramos resultados com os filtros informados.</p>
                                <Button variant="link" onClick={() => { setSearchUser(""); setFilterPerfil("todos"); }} className="mt-2">
                                    Limpar filtros
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {filteredUsuarios.map((user: any) => (
                                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full shrink-0 ${
                                                user.perfil === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                                                    user.perfil === 'GERENTE' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-primary/10 text-primary'
                                            }`}>
                                                {user.perfil === 'ADMIN' ? <Shield className="size-5" /> :
                                                    user.perfil === 'GERENTE' ? <UserCog className="size-5" /> :
                                                        <User className="size-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-base">{user.nome}</h4>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-border pt-4 sm:pt-0">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                                                user.perfil === 'ADMIN' ? 'bg-red-500/10 text-red-500 ring-red-500/20' :
                                                    user.perfil === 'GERENTE' ? 'bg-blue-500/10 text-blue-500 ring-blue-500/20' :
                                                        'bg-primary/10 text-primary ring-primary/20'
                                            }`}>
                                                {user.perfil}
                                            </span>

                                            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                                <a href={`/restrito/editarUsuario/${user.id}`} className="w-full sm:w-auto">
                                                    <Button variant="outline" size="sm" className="w-full">Editar</Button>
                                                </a>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                    onClick={() => handleExcluirUsuario(user.id, user.nome, user.perfil)}
                                                    disabled={isDeletingUser === user.id}
                                                >
                                                    {isDeletingUser === user.id ? "A excluir..." : "Excluir"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ABA COMPLEMENTOS */}
                {activeTab === "complementos" && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Gerenciamento de Complementos</h2>
                                <p className="text-sm text-muted-foreground">Cadastre e gerencie os adicionais disponíveis para os produtos.</p>
                            </div>
                            <Button
                                className="gap-2 w-full sm:w-auto"
                                onClick={() => {
                                    setComplementoForm(prev => ({ ...prev, estabelecimentoId: selectedEstComplemento }));
                                    setShowComplementoModal(true);
                                }}
                            >
                                <Plus className="size-4" />
                                Novo Complemento
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2 max-w-sm border-b border-border pb-6">
                            <label className="text-sm font-medium">Filtrar por Estabelecimento</label>
                            <select
                                value={selectedEstComplemento}
                                onChange={(e) => setSelectedEstComplemento(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Selecione um estabelecimento...</option>
                                {estabelecimentos.map(est => (
                                    <option key={est.id} value={est.id.toString()}>{est.nome}</option>
                                ))}
                            </select>
                        </div>

                        {!selectedEstComplemento ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                                <Building2 className="size-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">Selecione um estabelecimento</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">Escolha um estabelecimento acima para visualizar os complementos cadastrados nele.</p>
                            </div>
                        ) : filteredComplementos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                                <Layers className="size-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">Nenhum complemento</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">Este estabelecimento ainda não possui complementos cadastrados.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredComplementos.map((comp: any) => (
                                    <div key={comp.id} className="flex flex-col justify-between p-4 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-all">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-semibold text-base">{comp.nome}</h4>
                                                <span className="font-bold text-primary text-sm shrink-0">{formatarMoeda(comp.preco)}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Estabelecimento: {comp.estabelecimento?.nome}
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleExcluirComplemento(comp.id, comp.nome)}
                                            disabled={isDeletingComplemento === comp.id}
                                        >
                                            {isDeletingComplemento === comp.id ? "A excluir..." : "Excluir"}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL NOTIFICACAO */}
            {showNotificacaoModal !== false && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card text-card-foreground border border-border shadow-xl rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h3 className="text-lg font-bold">
                                    {showNotificacaoModal === "TODOS" ? "Notificar Todos" : "Enviar Notificação"}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {showNotificacaoModal === "TODOS"
                                        ? "Este aviso será enviado para todos os estabelecimentos."
                                        : "Este aviso será enviado apenas para o estabelecimento selecionado."}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowNotificacaoModal(false)} className="rounded-full shrink-0">
                                <X className="size-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleEnviarNotificacao} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Título da Notificação</label>
                                    <Input
                                        required
                                        value={notificacaoForm.titulo}
                                        onChange={(e) => setNotificacaoForm({ ...notificacaoForm, titulo: e.target.value })}
                                        placeholder="Ex: Atualização no sistema"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Tipo</label>
                                    <select
                                        value={notificacaoForm.tipo}
                                        onChange={(e) => setNotificacaoForm({ ...notificacaoForm, tipo: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="INFORMATIVA">Informativa</option>
                                        <option value="AVISO">Aviso Importante</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Mensagem</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={notificacaoForm.mensagem}
                                    onChange={(e) => setNotificacaoForm({ ...notificacaoForm, mensagem: e.target.value })}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                                    placeholder="Escreva a mensagem aqui..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setShowNotificacaoModal(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSending} className="gap-2">
                                    <Send className="size-4" />
                                    {isSending ? "Enviando..." : "Enviar"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL COMPLEMENTO */}
            {showComplementoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card text-card-foreground border border-border shadow-xl rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h3 className="text-lg font-bold">Novo Complemento</h3>
                                <p className="text-sm text-muted-foreground mt-1">Cadastre um novo item adicional no banco de dados.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowComplementoModal(false)} className="rounded-full shrink-0">
                                <X className="size-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSalvarComplemento} className="p-6 space-y-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Estabelecimento Dono</label>
                                <select
                                    required
                                    value={complementoForm.estabelecimentoId}
                                    onChange={(e) => setComplementoForm({ ...complementoForm, estabelecimentoId: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Selecione o estabelecimento...</option>
                                    {estabelecimentos.map(est => (
                                        <option key={est.id} value={est.id.toString()}>{est.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Nome do Complemento</label>
                                    <Input
                                        required
                                        value={complementoForm.nome}
                                        onChange={(e) => setComplementoForm({ ...complementoForm, nome: e.target.value })}
                                        placeholder="Ex: Bacon Extra"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Preço Adicional (R$)</label>
                                    <Input
                                        required
                                        value={complementoForm.preco}
                                        onChange={(e) => setComplementoForm({ ...complementoForm, preco: formatarMoedaInput(e.target.value) })}
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setShowComplementoModal(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSavingComplemento} className="gap-2">
                                    {isSavingComplemento ? "Salvando..." : "Salvar Complemento"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}