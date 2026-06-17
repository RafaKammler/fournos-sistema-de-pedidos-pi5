import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { ProdutoDetalhesTabs } from "./produto-detalhes-tabs"
import { getSession } from "@/lib/auth"

export default async function ProdutoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const produtoId = parseInt(id)
    const session = await getSession()

    if (!session || session.perfil !== "ADMIN") {
        redirect("/home")
    }


    if (isNaN(produtoId)) {
        redirect("/restrito/admin")
    }

    const produto = await prisma.produto.findUnique({
        where: { id: produtoId },
        include: {
            estabelecimento: true,
            complementos: {
                include: {
                    complemento: true
                }
            }
        }
    })

    if (!produto) {
        redirect("/restrito/admin")
    }

    const complementosDoEstabelecimento = await prisma.complemento.findMany({
        where: { estabelecimentoId: produto.estabelecimentoId }
    })

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar
                perfil={session.perfil as string}
                logo={{
                    url: "/restrito/admin",
                    src: "/img.png",
                    alt: "Fournos Logo",
                    title: "Fournos"
                }}
                menu={[
                    { title: "Home", url: "/home" }
                ]}
            />
            <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <ProdutoDetalhesTabs
                    produto={produto}
                    complementosDisponiveis={complementosDoEstabelecimento}
                />
            </main>
        </div>
    )
}