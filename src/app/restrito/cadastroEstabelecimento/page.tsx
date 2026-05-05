'use client'

import React, { useState } from "react"
import { Navbar } from "@/components/ui/navbar"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type FormState = {
    nome: string
    descricao: string
    cnpj: string
    telefone: string
    rua: string
    cep: string
    cidade: string
    estado: string
    gerenteEmail: string
}

export default function CadastroEstabelecimentoPage() {
    const [form, setForm] = useState<FormState>({
        nome: "", descricao: "", cnpj: "", telefone: "", rua: "", cidade: "", estado: "", gerenteEmail: "", cep: ""
    })
    const [imagem, setImagem] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'imagem', string>>>({})

    const [loading, setLoading] = useState(false)
    const [loadingCep, setLoadingCep] = useState(false) // NOVO: Estado para o loading do botão de CEP
    const [message, setMessage] = useState<string | null>(null)

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
        setErrors((e) => ({ ...e, cep: undefined })) // Limpa erros anteriores do CEP

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
            const data = await response.json()

            if (data.erro) {
                setErrors((e) => ({ ...e, cep: "CEP não encontrado." }))
            } else {
                // Atualiza o formulário com os dados da API
                setForm((s) => ({
                    ...s,
                    rua: data.logradouro || s.rua,     // Logradouro é a rua
                    cidade: data.localidade || s.cidade, // Localidade é a cidade
                    estado: data.uf || s.estado          // UF é o estado
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

        if (form.gerenteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.gerenteEmail)) {
            e.gerenteEmail = "Email do gerente inválido."
        }

        if (!imagem) e.imagem = "A imagem do estabelecimento é obrigatória."

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
            formData.append("cnpj", cleanDigits(form.cnpj))
            formData.append("telefone", cleanDigits(form.telefone))
            formData.append("cep", cleanDigits(form.cep))
            formData.append("rua", form.rua.trim())
            formData.append("cidade", form.cidade.trim())
            formData.append("estado", form.estado.trim())
            if (form.gerenteEmail.trim()) {
                formData.append("gerenteEmail", form.gerenteEmail.trim())
            }
            if (imagem) {
                formData.append("imagem", imagem)
            }

            const res = await fetch("/api/cadastroEstabelecimento", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.message || `Erro: ${res.status}`)
            }

            setMessage("Estabelecimento cadastrado com sucesso.")
            setForm({ nome: "", descricao: "", cnpj: "", telefone: "", rua: "", cidade: "", estado: "", gerenteEmail: "", cep: "" })
            setImagem(null)
            setPreviewUrl(null)

            const fileInput = document.getElementById('imagem') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            setMessage(err?.message || "Erro ao cadastrar.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cadastro de Restaurante</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Preencha as informações abaixo para registrar um novo estabelecimento na plataforma.
                    </p>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl sm:rounded-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8" noValidate>

                        <FieldGroup className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Dados Principais</h2>

                            <Field className="flex flex-col items-center border-b border-gray-100 pb-8 mb-6">
                                <FieldLabel htmlFor="imagem" className="font-medium text-lg mb-4">
                                    Foto do Estabelecimento
                                </FieldLabel>
                                <div className="flex flex-col items-center gap-y-4 w-full">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview do Estabelecimento"
                                            className="w-64 h-64 object-cover rounded-xl border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-64 h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors p-4 text-center">
                                            <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-500 font-medium">Nenhuma imagem selecionada</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center mt-2">
                                        <label
                                            htmlFor="imagem"
                                            className="cursor-pointer rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
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
                                            <span className="mt-3 text-xs text-gray-500 max-w-[250px] truncate text-center">
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

                            <Field>
                                <FieldLabel htmlFor="descricao" className="font-medium">Descrição</FieldLabel>
                                <textarea
                                    id="descricao"
                                    name="descricao"
                                    value={form.descricao}
                                    onChange={(e) => handleChange("descricao", e.target.value)}
                                    placeholder="Breve resumo sobre a culinária e o ambiente..."
                                    rows={3}
                                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    aria-invalid={!!errors.descricao}
                                    required
                                />
                                {errors.descricao && <FieldDescription className="text-red-500 text-sm mt-1">{errors.descricao}</FieldDescription>}
                            </Field>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="cnpj" className="font-medium">CNPJ</FieldLabel>
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

                        <FieldGroup className="space-y-6 pt-6 border-t border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Localização</h2>

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
                                        className="px-5 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
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

                        <FieldGroup className="space-y-6 pt-6 border-t border-gray-100">
                            <Field>
                                <FieldLabel htmlFor="gerenteEmail" className="font-medium">Email do Gerente <span className="text-gray-400 font-normal">(Opcional)</span></FieldLabel>
                                <Input id="gerenteEmail" name="gerenteEmail" type="email" value={form.gerenteEmail} onChange={(e) => handleChange("gerenteEmail", e.target.value)} placeholder="gerente@exemplo.com" aria-invalid={!!errors.gerenteEmail} className="mt-1" />
                                {errors.gerenteEmail && <FieldDescription className="text-red-500 text-sm mt-1">{errors.gerenteEmail}</FieldDescription>}
                            </Field>
                        </FieldGroup>

                        {message && (
                            <div className={`p-4 rounded-md text-sm font-medium ${message.includes('Erro') || message.includes('inválido') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                                {message}
                            </div>
                        )}

                        <div className="pt-6 mt-6 border-t border-gray-100">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-8 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-70"
                            >
                                {loading ? "Salvando..." : "Cadastrar Restaurante"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}