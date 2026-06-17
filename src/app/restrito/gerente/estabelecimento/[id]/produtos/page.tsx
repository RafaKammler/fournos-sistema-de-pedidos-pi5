import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { PlusCircle, Power, PowerOff, Edit, ListPlus} from "lucide-react"
import Image from "next/image"


export default async function GerenciarProdutosPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const estabelecimentoId = parseInt(id)

    // 1. Validação de Segurança
    const session = await getSession()
    if (!session || session.perfil !== "GERENTE") {
        redirect("/home")
    }

    const usuarioId = parseInt(session.sub as string)

    // 2. Trava: Garante que a loja pertence ao gerente logado
    const estabelecimento = await prisma.estabelecimento.findFirst({
        where: { id: estabelecimentoId, gerente: { usuarioId: usuarioId } }
    })

    if (!estabelecimento) {
        redirect("/restrito/gerente")
    }

    // 3. Busca os produtos desta loja
    const produtos = await prisma.produto.findMany({
        where: { estabelecimentoId: estabelecimentoId },
        orderBy: { nome: 'asc' }
    })

    // 4. Server Action: Liga e desliga a disponibilidade do produto
    async function toggleDisponibilidade(formData: FormData) {
        "use server"
        const produtoId = parseInt(formData.get("produtoId") as string)
        const statusAtual = formData.get("statusAtual") === "true"

        await prisma.produto.update({
            where: { id: produtoId },
            data: { disponivel: !statusAtual } // Inverte o status atual
        })

        revalidatePath(`/restrito/gerente/estabelecimento/${estabelecimentoId}/produtos`)
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar
                perfil={session.perfil as string}
                logo={{ url: "/restrito/gerente", src: "/img.png", alt: "Fournos", title: "Fournos" }}
                menu={[{ title: "Home", url: "/home" }]}
            />

            <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <Link href="/restrito/gerente" className="text-sm text-primary hover:underline mb-2 inline-block">
                            &larr; Voltar ao Painel
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Produtos: {estabelecimento.nome}
                        </h1>
                    </div>

                    {/* Botão para cadastrar um novo produto. Direcionaremos para a sua tela existente ou uma nova em breve */}
                    <Link
                        href={`/restrito/gerente/estabelecimento/${estabelecimentoId}/cadastroProduto`}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        <PlusCircle className="size-5" />
                        Novo Produto
                    </Link>
                </div>

                {produtos.length === 0 ? (
                    <div className="p-8 text-center bg-card border rounded-xl shadow-sm text-muted-foreground">
                        Nenhum produto cadastrado no cardápio ainda.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {produtos.map(produto => (
                            <div key={produto.id} className={`p-5 bg-card border rounded-xl shadow-sm flex flex-col ${!produto.disponivel ? 'opacity-75' : ''}`}>
                                <div className="flex gap-4 items-start mb-4">
                                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0 border">
                                        {produto.caminhoImagem ? (
                                            <Image src={produto.caminhoImagem} alt={produto.nome} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sem foto</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{produto.nome}</h3>
                                        <p className="text-xl font-semibold text-primary mt-1">
                                            R$ {produto.preco.toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                    {produto.descricao}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t mt-auto gap-2">
                                    <form action={toggleDisponibilidade}>
                                        <input type="hidden" name="produtoId" value={produto.id} />
                                        <input type="hidden" name="statusAtual" value={produto.disponivel.toString()} />
                                        <button
                                            type="submit"
                                            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                                                produto.disponivel
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {produto.disponivel ? <Power className="size-4" /> : <PowerOff className="size-4" />}
                                            {produto.disponivel ? 'Ativo' : 'Pausado'}
                                        </button>
                                    </form>

                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/restrito/gerente/estabelecimento/${estabelecimentoId}/produtos/${produto.id}/complementos`}
                                            className="text-muted-foreground hover:text-orange-600 p-2 rounded-md hover:bg-orange-50 transition-colors"
                                            title="Vincular Complementos"
                                        >
                                            <ListPlus className="size-5" />
                                        </Link>

                                        <Link
                                            href={`/restrito/gerente/estabelecimento/${estabelecimentoId}/editarProduto/${produto.id}`}
                                            className="text-muted-foreground hover:text-primary p-2 rounded-md hover:bg-muted transition-colors"
                                            title="Editar Produto"
                                        >
                                            <Edit className="size-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}