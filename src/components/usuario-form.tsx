'use client'

import React, { useState } from "react"
import { Navbar } from "@/components/ui/navbar"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type FormState = {
    nome: string
    email: string
    senha?: string
    perfil: string
    estabelecimentoId: string
}

export function UsuarioForm({ usuario, estabelecimentos = [] }: { usuario?: any, estabelecimentos?: any[] }) {
    const router = useRouter()
    const isEditing = !!usuario?.id

    const [form, setForm] = useState<FormState>({
        nome: usuario?.nome || "",
        email: usuario?.email || "",
        senha: "",
        perfil: usuario?.perfil || "USUARIO",
        estabelecimentoId: usuario?.gerente?.estabelecimentos?.[0]?.id?.toString() || ""
    })

    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((s) => {
            const newState = { ...s, [key]: value };
            // Limpa o estabelecimento caso o perfil deixe de ser GERENTE
            if (key === 'perfil' && value !== 'GERENTE') {
                newState.estabelecimentoId = "";
            }
            return newState;
        })
        setErrors((e) => ({ ...e, [key]: undefined }))
        setMessage(null)
    }

    function validate() {
        const e: typeof errors = {}
        if (!form.nome.trim()) e.nome = "Nome é obrigatório."
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido."
        if (!isEditing && !form.senha) e.senha = "Senha é obrigatória."
        if (form.senha && form.senha.length < 6) e.senha = "A senha deve ter pelo menos 6 caracteres."

        if (form.perfil === "GERENTE" && !form.estabelecimentoId) {
            e.estabelecimentoId = "Selecione o estabelecimento que este gerente irá administrar."
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault()
        setMessage(null)
        if (!validate()) return

        setLoading(true)
        try {
            const endpoint = isEditing ? `/api/editarUsuario/${usuario.id}` : "/api/cadastroUsuario"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(endpoint, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.message || `Erro: ${res.status}`)
            }

            setMessage(isEditing ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.")

            setTimeout(() => {
                router.push("/restrito/admin")
                router.refresh()
            }, 1500)

        } catch (err: any) {
            setMessage(err?.message || "Erro ao salvar os dados.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar logo={{ url: "/restrito/admin", src: "/img.png", alt: "Fournos Logo", title: "Fournos" }} menu={[]} />
            <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditing ? "Editar Usuário" : "Cadastro de Usuário"}
                    </h1>
                </div>

                <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl sm:rounded-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8" noValidate>
                        <FieldGroup className="space-y-6">
                            <Field>
                                <FieldLabel htmlFor="nome" className="font-medium">Nome Completo</FieldLabel>
                                <Input id="nome" name="nome" value={form.nome} onChange={(e) => handleChange("nome", e.target.value)} required className="mt-1" />
                                {errors.nome && <FieldDescription className="text-destructive text-sm mt-1">{errors.nome}</FieldDescription>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="email" className="font-medium">Endereço de Email</FieldLabel>
                                <Input id="email" name="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required className="mt-1" />
                                {errors.email && <FieldDescription className="text-destructive text-sm mt-1">{errors.email}</FieldDescription>}
                            </Field>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="senha" className="font-medium">
                                        Senha {isEditing && <span className="text-muted-foreground font-normal">(Opcional para não alterar)</span>}
                                    </FieldLabel>
                                    <Input id="senha" name="senha" type="password" value={form.senha} onChange={(e) => handleChange("senha", e.target.value)} className="mt-1" />
                                    {errors.senha && <FieldDescription className="text-destructive text-sm mt-1">{errors.senha}</FieldDescription>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="perfil" className="font-medium">Perfil de Acesso</FieldLabel>
                                    <select
                                        id="perfil"
                                        name="perfil"
                                        value={form.perfil}
                                        onChange={(e) => handleChange("perfil", e.target.value)}
                                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="USUARIO">Usuário</option>
                                        <option value="GERENTE">Gerente</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </Field>

                                {form.perfil === "GERENTE" && (
                                    <Field className="sm:col-span-2 border-t border-border pt-4 mt-2">
                                        <FieldLabel htmlFor="estabelecimentoId" className="font-medium">Estabelecimento Gerenciado</FieldLabel>
                                        <select
                                            id="estabelecimentoId"
                                            name="estabelecimentoId"
                                            value={form.estabelecimentoId}
                                            onChange={(e) => handleChange("estabelecimentoId", e.target.value)}
                                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Selecione um estabelecimento...</option>
                                            {estabelecimentos.map((est) => (
                                                <option key={est.id} value={est.id}>
                                                    {est.nome} (CNPJ: {est.cnpj})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.estabelecimentoId && <FieldDescription className="text-destructive text-sm mt-1">{errors.estabelecimentoId}</FieldDescription>}
                                    </Field>
                                )}
                            </div>
                        </FieldGroup>

                        {message && (
                            <div className={`p-4 rounded-md text-sm font-medium ${message.includes('Erro') ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-green-500/10 text-green-700 border border-green-500/20'}`}>
                                {message}
                            </div>
                        )}

                        <div className="pt-6 mt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button type="button" variant="outline" onClick={() => router.push('/restrito/admin')} className="w-full py-3 text-base font-medium">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="w-full py-3 text-base font-medium">
                                {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Usuário"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}