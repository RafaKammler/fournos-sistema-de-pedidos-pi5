'use client'

import React, { useState } from "react"
import { Navbar } from "@/components/ui/navbar"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants" // <-- 1. Importação adicionada

type FormState = {
    nome: string
    descricao: string
    categoria: string // <-- 2. Tipo adicionado
    cnpj: string
    telefone: string
    rua: string
    cep: string
    cidade: string
    estado: string
    gerenteEmail: string
}

export function EstabelecimentoForm({
                                        estabelecimento,
                                        returnUrl = "/restrito/admin",
                                        isGerente = false,
                                        perfil = "ADMIN"
                                    }: {
    estabelecimento?: any,
    returnUrl?: string,
    isGerente?: boolean,
    perfil?: string | null
}) {
    const router = useRouter()
    const isEditing = !!estabelecimento?.id

    function cleanDigits(s: string) { return s.replace(/\D/g, "") }

    function maskCNPJ(value: string) {
        let v = cleanDigits(value)
        if (v.length > 14) v = v.substring(0, 14)
        v = v.replace(/^(\d{2})(\d)/, "$1.$2")
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2")
        v = v.replace(/(\d{4})(\d)/, "$1-$2")
        return v
    }

    function maskTelefone(value: string) {
        let v = cleanDigits(value)
        if (v.length > 11) v = v.substring(0, 11)
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2")
        v = v.replace(/(\d)(\d{4})$/, "$1-$2")
        return v
    }

    function maskCEP(value: string) {
        let v = cleanDigits(value)
        if (v.length > 8) v = v.substring(0, 8)
        v = v.replace(/^(\d{5})(\d)/, "$1-$2")
        return v
    }

    const [form, setForm] = useState<FormState>({
        nome: estabelecimento?.nome || "",
        descricao: estabelecimento?.descricao || "",
        categoria: estabelecimento?.categoria || "LANCHES", // <-- 3. Estado inicial com valor padrão
        cnpj: estabelecimento?.cnpj ? maskCNPJ(estabelecimento.cnpj) : "",
        telefone: estabelecimento?.telefone ? maskTelefone(estabelecimento.telefone) : "",
        rua: estabelecimento?.rua || "",
        cidade: estabelecimento?.cidade || "",
        estado: estabelecimento?.estado || "",
        gerenteEmail: estabelecimento?.gerenteEmail || "",
        cep: estabelecimento?.cep ? maskCEP(estabelecimento.cep) : ""
    })

    const [imagem, setImagem] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(estabelecimento?.caminhoImagem || null)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'imagem', string>>>({})

    const [loading, setLoading] = useState(false)
    const [loadingCep, setLoadingCep] = useState(false)
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

    async function handleSearchCEP() {
        const cepDigits = cleanDigits(form.cep)
        form.estado = ""
        form.rua = ""
        form.cidade = ""

        if (cepDigits.length !== 8) {
            setErrors((e) => ({ ...e, cep: "Digite um CEP válido com 8 números." }))
            return
        }

        setLoadingCep(true)
        setErrors((e) => ({ ...e, cep: undefined }))

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
            const data = await response.json()

            if (data.erro) {
                setErrors((e) => ({ ...e, cep: "CEP não encontrado." }))
            } else {
                setForm((s) => ({
                    ...s,
                    rua: data.logradouro || s.rua,
                    cidade: data.localidade || s.cidade,
                    estado: data.uf || s.estado
                }))
            }
        } catch (error) {
            setErrors((e) => ({ ...e, cep: "Erro ao buscar o CEP. Tente novamente." }))
        } finally {
            setLoadingCep(false)
        }
    }

    function validate() {
        const e: typeof errors = {}
        if (!form.nome.trim()) e.nome = "Nome é obrigatório."
        if (!form.descricao.trim()) e.descricao = "Descrição é obrigatória."

        const cnpjDigits = cleanDigits(form.cnpj)
        if (!cnpjDigits) e.cnpj = "CNPJ é obrigatório."
        else if (cnpjDigits.length !== 14) e.cnpj = "CNPJ deve ter 14 dígitos."

        const phoneDigits = cleanDigits(form.telefone)
        if (!phoneDigits) e.telefone = "Telefone é obrigatório."
        else if (phoneDigits.length < 10) e.telefone = "Telefone inválido."

        const cepDigits = cleanDigits(form.cep)
        if (cepDigits && cepDigits.length !== 8) e.cep = "CEP deve ter 8 dígitos."

        if (!isGerente && form.gerenteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.gerenteEmail)) {
            e.gerenteEmail = "Email do gerente inválido."
        }

        if (!imagem && !previewUrl) e.imagem = "A imagem do estabelecimento é obrigatória."

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
            formData.append("categoria", form.categoria) // <-- 4. Categoria adicionada no envio
            formData.append("cnpj", cleanDigits(form.cnpj))
            formData.append("telefone", cleanDigits(form.telefone))
            formData.append("cep", cleanDigits(form.cep))
            formData.append("rua", form.rua.trim())
            formData.append("cidade", form.cidade.trim())
            formData.append("estado", form.estado.trim())

            if (!isGerente && form.gerenteEmail.trim()) {
                formData.append("gerenteEmail", form.gerenteEmail.trim())
            }

            if (imagem) {
                formData.append("imagem", imagem)
            }

            const endpoint = isEditing ? `/api/editarEstabelecimento/${estabelecimento.id}` : "/api/cadastroEstabelecimento"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(endpoint, {
                method: method,
                body: formData,
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.message || `Erro: ${res.status}`)
            }

            setMessage(isEditing ? "Estabelecimento atualizado com sucesso." : "Estabelecimento cadastrado com sucesso.")

            setTimeout(() => {
                router.push(returnUrl)
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
            <Navbar
                perfil={perfil}
                logo={{
                    url: isGerente ? "/restrito/gerente" : "/restrito/admin",
                    src: "/img.png",
                    alt: "Fournos Logo",
                    title: "Fournos"
                }}
                menu={isGerente ? [{ title: "Home", url: "/home" }] : []}
            />
            <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditing ? "Editar Restaurante" : "Cadastro de Restaurante"}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isEditing
                            ? "Altere as informações do estabelecimento abaixo."
                            : "Preencha as informações abaixo para registrar um novo estabelecimento na plataforma."
                        }
                    </p>
                </div>

                <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl sm:rounded-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8" noValidate>

                        <FieldGroup className="space-y-6">
                            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4">Dados Principais</h2>

                            <Field className="flex flex-col items-center border-b border-border pb-8 mb-6">
                                <FieldLabel htmlFor="imagem" className="font-medium text-lg mb-4">
                                    Foto do Estabelecimento
                                </FieldLabel>
                                <div className="flex flex-col items-center gap-y-4 w-full">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview do Estabelecimento"
                                            className="w-64 h-64 object-cover rounded-xl border border-border shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-64 h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted p-4 text-center">
                                            <span className="text-sm text-muted-foreground font-medium">Nenhuma imagem selecionada</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center mt-2">
                                        <label
                                            htmlFor="imagem"
                                            className="cursor-pointer rounded-md bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted transition-colors"
                                        >
                                            <span>{previewUrl ? 'Trocar foto' : 'Selecionar foto'}</span>
                                            <input
                                                id="imagem"
                                                name="imagem"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="sr-only"
                                            />
                                        </label>

                                        {imagem && (
                                            <span className="mt-3 text-xs text-muted-foreground max-w-[250px] truncate text-center">
                                                {imagem.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {errors.imagem && <FieldDescription className="text-red-500 text-sm mt-3 text-center">{errors.imagem}</FieldDescription>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="nome" className="font-medium">Nome do Restaurante</FieldLabel>
                                <Input
                                    id="nome"
                                    name="nome"
                                    value={form.nome}
                                    onChange={(e) => handleChange("nome", e.target.value)}
                                    placeholder="Ex: Pizzaria Bella Napoli"
                                    aria-invalid={!!errors.nome}
                                    required
                                    className="mt-1"
                                />
                                {errors.nome && <FieldDescription className="text-red-500 text-sm mt-1">{errors.nome}</FieldDescription>}
                            </Field>

                            {/* 5. Select de Categoria adicionado aqui! */}
                            <Field>
                                <FieldLabel htmlFor="categoria" className="font-medium">Categoria Principal</FieldLabel>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={form.categoria}
                                    onChange={(e) => handleChange("categoria", e.target.value)}
                                    className="mt-1 w-full px-3 py-2 text-sm border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    required
                                >
                                    {CATEGORIAS_ESTABELECIMENTO.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nome}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="descricao" className="font-medium">Descrição</FieldLabel>
                                <textarea
                                    id="descricao"
                                    name="descricao"
                                    value={form.descricao}
                                    onChange={(e) => handleChange("descricao", e.target.value)}
                                    placeholder="Breve resumo sobre a culinária e o ambiente..."
                                    rows={3}
                                    className="mt-1 w-full px-3 py-2 text-sm border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    aria-invalid={!!errors.descricao}
                                    required
                                />
                                {errors.descricao && <FieldDescription className="text-red-500 text-sm mt-1">{errors.descricao}</FieldDescription>}
                            </Field>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="cnpj" className="font-medium">
                                        CNPJ {isGerente && <span className="text-muted-foreground font-normal">(Apenas leitura)</span>}
                                    </FieldLabel>
                                    <Input
                                        id="cnpj"
                                        name="cnpj"
                                        value={form.cnpj}
                                        onChange={(e) => handleChange("cnpj", maskCNPJ(e.target.value))}
                                        placeholder="00.000.000/0000-00"
                                        aria-invalid={!!errors.cnpj}
                                        required
                                        maxLength={18}
                                        className="mt-1"
                                        disabled={isGerente}
                                        // eslint-disable-next-line react/jsx-no-duplicate-props
                                        readOnly={isGerente}
                                    />
                                    {errors.cnpj && <FieldDescription className="text-red-500 text-sm mt-1">{errors.cnpj}</FieldDescription>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="telefone" className="font-medium">Telefone</FieldLabel>
                                    <Input
                                        id="telefone"
                                        name="telefone"
                                        value={form.telefone}
                                        onChange={(e) => handleChange("telefone", maskTelefone(e.target.value))}
                                        placeholder="(11) 99999-9999"
                                        aria-invalid={!!errors.telefone}
                                        required
                                        maxLength={15}
                                        className="mt-1"
                                    />
                                    {errors.telefone && <FieldDescription className="text-red-500 text-sm mt-1">{errors.telefone}</FieldDescription>}
                                </Field>
                            </div>
                        </FieldGroup>

                        <FieldGroup className="space-y-6 pt-6 border-t border-border">
                            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4">Localização</h2>

                            <Field>
                                <FieldLabel htmlFor="cep" className="font-medium">CEP</FieldLabel>
                                <div className="mt-1 flex gap-3">
                                    <Input
                                        id="cep"
                                        name="cep"
                                        value={form.cep}
                                        onChange={(e) => handleChange("cep", maskCEP(e.target.value))}
                                        placeholder="00000-000"
                                        maxLength={9}
                                        className="flex-1"
                                        aria-invalid={!!errors.cep}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleSearchCEP}
                                        disabled={loadingCep}
                                        className="px-5 bg-muted text-muted-foreground hover:bg-muted/80 border border-border shadow-sm disabled:opacity-70"
                                    >
                                        {loadingCep ? "Buscando..." : "Pesquisar"}
                                    </Button>
                                </div>
                                {errors.cep && <FieldDescription className="text-red-500 text-sm mt-1">{errors.cep}</FieldDescription>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="rua" className="font-medium">Rua / Avenida</FieldLabel>
                                <Input id="rua" name="rua" value={form.rua} onChange={(e) => handleChange("rua", e.target.value)} placeholder="Ex: Av. Paulista, 1000" className="mt-1" />
                            </Field>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
                                <Field className="sm:col-span-8">
                                    <FieldLabel htmlFor="cidade" className="font-medium">Cidade</FieldLabel>
                                    <Input id="cidade" name="cidade" value={form.cidade} onChange={(e) => handleChange("cidade", e.target.value)} placeholder="Sua cidade" className="mt-1" />
                                </Field>
                                <Field className="sm:col-span-4">
                                    <FieldLabel htmlFor="estado" className="font-medium">Estado (UF)</FieldLabel>
                                    <Input id="estado" name="estado" value={form.estado} onChange={(e) => handleChange("estado", e.target.value)} placeholder="SP" maxLength={2} className="mt-1 uppercase" />
                                </Field>
                            </div>
                        </FieldGroup>

                        {!isGerente && (
                            <FieldGroup className="space-y-6 pt-6 border-t border-border">
                                <Field>
                                    <FieldLabel htmlFor="gerenteEmail" className="font-medium">
                                        Email do Gerente <span className="text-muted-foreground font-normal">(Opcional)</span>
                                    </FieldLabel>
                                    <Input
                                        id="gerenteEmail"
                                        name="gerenteEmail"
                                        type="email"
                                        value={form.gerenteEmail}
                                        onChange={(e) => handleChange("gerenteEmail", e.target.value)}
                                        placeholder="gerente@exemplo.com"
                                        aria-invalid={!!errors.gerenteEmail}
                                        className="mt-1"
                                    />
                                    {errors.gerenteEmail && <FieldDescription className="text-red-500 text-sm mt-1">{errors.gerenteEmail}</FieldDescription>}
                                </Field>
                            </FieldGroup>
                        )}

                        {message && (
                            <div className={`p-4 rounded-md text-sm font-medium ${message.includes('Erro') || message.includes('inválido')
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
                            }`}>
                                {message}
                            </div>
                        )}

                        <div className="pt-6 mt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(returnUrl)}
                                className="w-full py-3 text-base font-medium"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-8 text-base font-medium disabled:opacity-70"
                            >
                                {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Restaurante"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}