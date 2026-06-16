import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/ui/navbar"
import { ProdutoCard } from "@/components/produto-card"

interface EstabelecimentoPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EstabelecimentoPage({ params }: EstabelecimentoPageProps) {
    const resolvedParams = await params
    const estabelecimentoId = parseInt(resolvedParams.id)

    if (isNaN(estabelecimentoId)) {
        return notFound()
    }

    // A BUSCA ATUALIZADA AQUI:
    const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: estabelecimentoId },
        include: {
            produtos: {
                where: { disponivel: true },
                include: {
                    complementos: {
                        include: {
                            complemento: true
                        }
                    }
                }
            }
        }
    })

    if (!estabelecimento) {
        return notFound()
    }

    const session = await getSession()
    const perfilUsuario = session?.perfil as string | undefined

    return (
        <div className="min-h-screen bg-background pb-10">
            <Navbar perfil={perfilUsuario} />

            <main className="container mx-auto p-4 max-w-5xl mt-6">
                <div className="flex items-center gap-6 mb-10 bg-card text-card-foreground p-6 rounded-2xl shadow-sm border">
                    {estabelecimento.caminhoImagem ? (
                        <div className="relative h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] shrink-0">
                            <Image
                                src={estabelecimento.caminhoImagem}
                                alt={estabelecimento.nome}
                                fill
                                className="rounded-xl object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] shrink-0 bg-muted rounded-xl flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">Sem Imagem</span>
                        </div>
                    )}

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">{estabelecimento.nome}</h1>
                        <p className="text-muted-foreground mt-2">{estabelecimento.descricao}</p>
                    </div>
                </div>

                <div className="mb-6 border-b pb-2">
                    <h2 className="text-2xl font-semibold text-foreground">Cardápio</h2>
                </div>

                {estabelecimento.produtos.length === 0 ? (
                    <div className="bg-card p-8 rounded-xl border text-center">
                        <p className="text-muted-foreground">Este estabelecimento ainda não possui produtos disponíveis.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {estabelecimento.produtos.map(produto => (
                            <ProdutoCard key={produto.id} produto={produto} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}