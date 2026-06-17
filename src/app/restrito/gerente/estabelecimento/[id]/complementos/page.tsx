import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { Trash2, PlusCircle } from "lucide-react"

export default async function GerenciarComplementosPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const estabelecimentoId = parseInt(id)

    // 1. Segurança e validação do Gerente
    const session = await getSession()
    if (!session || session.perfil !== "GERENTE") {
        redirect("/home")
    }

    const usuarioId = parseInt(session.sub as string)

    const estabelecimento = await prisma.estabelecimento.findFirst({
        where: { id: estabelecimentoId, gerente: { usuarioId: usuarioId } }
    })

    if (!estabelecimento) {
        redirect("/restrito/gerente")
    }

    // 2. Busca os complementos cadastrados nesta loja
    const complementos = await prisma.complemento.findMany({
        where: { estabelecimentoId: estabelecimentoId },
        orderBy: { nome: 'asc' }
    })

    // 3. Server Action para Cadastrar Complemento rapidamente
    async function adicionarComplemento(formData: FormData) {
        "use server"
        const nome = formData.get("nome") as string
        const precoStr = formData.get("preco") as string

        // Converte vírgula para ponto e transforma em número
        const preco = parseFloat(precoStr.replace(',', '.'))

        if (nome && !isNaN(preco)) {
            await prisma.complemento.create({
                data: {
                    nome,
                    preco,
                    estabelecimentoId
                }
            })
            revalidatePath(`/restrito/gerente/estabelecimento/${estabelecimentoId}/complementos`)
        }
    }

    // 4. Server Action para Excluir Complemento
    async function excluirComplemento(formData: FormData) {
        "use server"
        const complementoId = parseInt(formData.get("complementoId") as string)

        await prisma.complemento.delete({
            where: { id: complementoId }
        })

        revalidatePath(`/restrito/gerente/estabelecimento/${estabelecimentoId}/complementos`)
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar
                perfil={session.perfil as string}
                logo={{ url: "/restrito/gerente", src: "/img.png", alt: "Fournos", title: "Fournos" }}
                menu={[{ title: "Home", url: "/home" }]}
            />

            <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <div>
                    <Link href="/restrito/gerente" className="text-sm text-primary hover:underline mb-2 inline-block">
                        &larr; Voltar ao Painel
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Adicionais: {estabelecimento.nome}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Cadastre os ingredientes extras (ex: Bacon, Borda Recheada) que poderão ser adicionados aos lanches.
                    </p>
                </div>

                {/* Formulário rápido de cadastro */}
                <div className="bg-card text-card-foreground p-6 rounded-2xl border shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Novo Complemento</h2>
                    <form action={adicionarComplemento} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:flex-1 space-y-1">
                            <label htmlFor="nome" className="text-sm font-medium">Nome do adicional</label>
                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                placeholder="Ex: Porção de Bacon"
                                required
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="w-full sm:w-32 space-y-1">
                            <label htmlFor="preco" className="text-sm font-medium">Preço (R$)</label>
                            <input
                                id="preco"
                                name="preco"
                                type="text"
                                placeholder="0,00"
                                required
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <button type="submit" className="w-full sm:w-auto h-10 px-6 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                            <PlusCircle className="size-4" />
                            Adicionar
                        </button>
                    </form>
                </div>

                {/* Listagem dos complementos */}
                <div className="bg-card text-card-foreground rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/20">
                        <h2 className="text-lg font-semibold">Complementos Cadastrados</h2>
                    </div>

                    {complementos.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Nenhum complemento cadastrado ainda.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {complementos.map(comp => (
                                <div key={comp.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/10 transition-colors">
                                    <div>
                                        <p className="font-medium text-foreground">{comp.nome}</p>
                                        <p className="text-sm text-primary font-semibold mt-0.5">
                                            R$ {comp.preco.toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                    <form action={excluirComplemento}>
                                        <input type="hidden" name="complementoId" value={comp.id} />
                                        <button
                                            type="submit"
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="size-5" />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}