import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { Check, Plus } from "lucide-react"
import Image from "next/image"

export default async function VincularComplementosPage({
                                                           params
                                                       }: {
    params: Promise<{ id: string; produtoId: string }>
}) {
    const { id, produtoId } = await params
    const estabelecimentoId = parseInt(id)
    const idDoProduto = parseInt(produtoId)

    // 1. Validação do Gerente
    const session = await getSession()
    if (!session || session.perfil !== "GERENTE") {
        redirect("/home")
    }

    const usuarioId = parseInt(session.sub as string)

    // 2. Busca e valida o Produto, e já traz quais complementos ele tem hoje
    const produto = await prisma.produto.findFirst({
        where: { id: idDoProduto, estabelecimento: { id: estabelecimentoId, gerente: { usuarioId: usuarioId } } },
        include: {
            complementos: { select: { complementoId: true } } // Traz só os IDs dos complementos ligados a ele
        }
    })

    if (!produto) {
        redirect(`/restrito/gerente/estabelecimento/${estabelecimentoId}/produtos`)
    }

    // Cria um array simples só com os IDs para facilitar a checagem no frontend
    const complementosVinculadosIds = produto.complementos.map(c => c.complementoId)

    // 3. Busca TODOS os complementos disponíveis nesta loja
    const todosComplementos = await prisma.complemento.findMany({
        where: { estabelecimentoId: estabelecimentoId },
        orderBy: { nome: 'asc' }
    })

    // 4. Server Action: Liga ou Desliga o complementos do produto
    async function toggleVinculo(formData: FormData) {
        "use server"
        const compId = parseInt(formData.get("complementoId") as string)
        const acao = formData.get("acao") as string // "vincular" ou "desvincular"

        if (acao === "vincular") {
            await prisma.produtoComplemento.create({
                data: { produtoId: idDoProduto, complementoId: compId }
            })
        } else if (acao === "desvincular") {
            await prisma.produtoComplemento.delete({
                where: {
                    produtoId_complementoId: { produtoId: idDoProduto, complementoId: compId }
                }
            })
        }

        revalidatePath(`/restrito/gerente/estabelecimento/${estabelecimentoId}/produtos/${idDoProduto}/complementos`)
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
                    <Link href={`/restrito/gerente/estabelecimento/${estabelecimentoId}/produtos`} className="text-sm text-primary hover:underline mb-2 inline-block">
                        &larr; Voltar ao Cardápio
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Adicionais para: <span className="text-primary">{produto.nome}</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Selecione quais ingredientes extras o cliente pode adicionar ao comprar este produto.
                    </p>
                </div>

                {todosComplementos.length === 0 ? (
                    <div className="p-8 text-center bg-card border rounded-xl shadow-sm text-muted-foreground">
                        <p>Nenhum complemento cadastrado na sua loja.</p>
                        <Link href={`/restrito/gerente/estabelecimento/${estabelecimentoId}/complementos`} className="text-primary hover:underline mt-2 inline-block">
                            Cadastre complementos aqui primeiro.
                        </Link>
                    </div>
                ) : (
                    <div className="bg-card text-card-foreground rounded-2xl border shadow-sm overflow-hidden">
                        <div className="divide-y divide-border">
                            {todosComplementos.map(comp => {
                                const estaVinculado = complementosVinculadosIds.includes(comp.id)

                                return (
                                    <div key={comp.id} className={`flex items-center justify-between p-4 sm:px-6 transition-colors ${estaVinculado ? 'bg-orange-50/50' : 'hover:bg-muted/10'}`}>
                                        <div>
                                            <p className={`font-medium ${estaVinculado ? 'text-orange-900' : 'text-foreground'}`}>
                                                {comp.nome}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                + R$ {comp.preco.toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>

                                        <form action={toggleVinculo}>
                                            <input type="hidden" name="complementoId" value={comp.id} />
                                            <input type="hidden" name="acao" value={estaVinculado ? "desvincular" : "vincular"} />

                                            <button
                                                type="submit"
                                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                                                    estaVinculado
                                                        ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
                                                        : 'bg-background text-foreground border-input hover:bg-muted'
                                                }`}
                                            >
                                                {estaVinculado ? (
                                                    <>
                                                        <Check className="size-4" /> Vinculado
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="size-4" /> Vincular
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}