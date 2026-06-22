'use client'

import React, { useState } from "react"
import { Navbar } from "@/components/ui/navbar"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {redirect, useRouter} from "next/navigation"
import {getSession} from "@/lib/auth";


type FormState = {
    nome: string
    descricao: string
    preco: string
    disponivel: boolean
}

export function ProdutoForm({ produto, estabelecimentoId, returnUrl }: { produto?: any, estabelecimentoId: string, returnUrl?: string }) {
    const router = useRouter()
    const isEditing = !!produto?.id

    const urlDestino = returnUrl || `/restrito/estabelecimento/${estabelecimentoId}`

    function formatarMoeda(valor: string | number) {
        if (typeof valor === 'number') {
            return (valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
        const apenasDigitos = valor.replace(/\D/g, "")
        const numero = parseFloat(apenasDigitos) / 100
        if (isNaN(numero)) return ""
        return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const [form, setForm] = useState<FormState>({
        nome: produto?.nome || "",
        descricao: produto?.descricao || "",
        preco: produto?.preco ? formatarMoeda(produto.preco) : "",
        disponivel: produto ? produto.disponivel : true
    })

    const [imagem, setImagem] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(produto?.caminhoImagem || null)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'imagem', string>>>({})
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((s) => ({ ...s, [key]: value }))
        setErrors((e) => ({ ...e, [key]: undefined }))
        setMessage(null)
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImagem(file)
            setPreviewUrl(URL.createObjectURL(file))
            setErrors((err) => ({ ...err, imagem: undefined }))
        }
    }

    function validate() {
        const e: typeof errors = {}
        if (!form.nome.trim()) e.nome = "Nome é obrigatório."
        if (!form.descricao.trim()) e.descricao = "Descrição é obrigatória."
        if (!form.preco || parseFloat(form.preco.replace(/\./g, "").replace(",", ".")) <= 0) {
            e.preco = "Preço inválido."
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
            const formData = new FormData()
            formData.append("nome", form.nome.trim())
            formData.append("descricao", form.descricao.trim())

            const precoFormatado = parseFloat(form.preco.replace(/\./g, "").replace(",", "."))
            formData.append("preco", precoFormatado.toString())
            formData.append("disponivel", form.disponivel.toString())
            formData.append("estabelecimentoId", estabelecimentoId)

            if (imagem) {
                formData.append("imagem", imagem)
            }

            const endpoint = isEditing ? `/api/editarProduto/${produto.id}` : "/api/cadastroProduto"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(endpoint, {
                method: method,
                body: formData,
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.message || `Erro: ${res.status}`)
            }

            setMessage(isEditing ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.")

            setTimeout(() => {
                router.push(urlDestino) // Utilizamos a variável dinâmica aqui
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
                        {isEditing ? "Editar Produto" : "Novo Produto"}
                    </h1>
                </div>

                <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl sm:rounded-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8" noValidate>
                        <FieldGroup className="space-y-6">
                            <Field className="flex flex-col items-center border-b border-border pb-8 mb-6">
                                <FieldLabel htmlFor="imagem" className="font-medium text-lg mb-4">Foto do Produto</FieldLabel>
                                <div className="flex flex-col items-center gap-y-4 w-full">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-64 h-64 object-cover rounded-xl border border-border shadow-sm" />
                                    ) : (
                                        <div className="w-64 h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted">
                                            <span className="text-sm text-muted-foreground font-medium">Sem imagem</span>
                                        </div>
                                    )}
                                    <label htmlFor="imagem" className="cursor-pointer rounded-md bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted transition-colors">
                                        <span>Selecionar foto</span>
                                        <input id="imagem" name="imagem" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                    </label>
                                </div>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="nome">Nome do Produto</FieldLabel>
                                <Input id="nome" name="nome" value={form.nome} onChange={(e) => handleChange("nome", e.target.value)} required />
                                {errors.nome && <FieldDescription className="text-destructive text-sm mt-1">{errors.nome}</FieldDescription>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="descricao">Descrição (Ingredientes, tamanho...)</FieldLabel>
                                <textarea id="descricao" name="descricao" value={form.descricao} onChange={(e) => handleChange("descricao", e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 text-sm border border-input bg-background rounded-md shadow-sm outline-none focus:ring-2 focus:ring-ring" required />
                                {errors.descricao && <FieldDescription className="text-destructive text-sm mt-1">{errors.descricao}</FieldDescription>}
                            </Field>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="preco">Preço (R$)</FieldLabel>
                                    <Input id="preco" name="preco" value={form.preco} onChange={(e) => handleChange("preco", formatarMoeda(e.target.value))} placeholder="0,00" required />
                                    {errors.preco && <FieldDescription className="text-destructive text-sm mt-1">{errors.preco}</FieldDescription>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="disponivel">Disponibilidade</FieldLabel>
                                    <select id="disponivel" name="disponivel" value={form.disponivel ? "true" : "false"} onChange={(e) => handleChange("disponivel", e.target.value === "true")} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                                        <option value="true">Disponivel</option>
                                        <option value="false">Indisponivel</option>
                                    </select>
                                </Field>
                            </div>
                        </FieldGroup>

                        {message && (
                            <div className={`p-4 rounded-md text-sm font-medium ${message.includes('Erro') ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-700'}`}>
                                {message}
                            </div>
                        )}

                        <div className="pt-6 mt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button type="button" variant="outline" onClick={() => router.push(urlDestino)} className="w-full py-3">Cancelar</Button>
                            <Button type="submit" disabled={loading} className="w-full py-3">{loading ? "Salvando..." : "Salvar Produto"}</Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}