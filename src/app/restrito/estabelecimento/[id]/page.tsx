import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { DetalhesTabs } from "./detalhes-tabs"
import { getSession } from "@/lib/auth"

export default async function EstabelecimentoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const estabelecimentoId = parseInt(id)
    const session = await getSession()

    if (!session || session.perfil !== "ADMIN") {
        redirect("/home")
    }

    if (isNaN(estabelecimentoId)) {
        redirect("/restrito/admin")
    }

    const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: estabelecimentoId },
        include: {
            produtos: {
                orderBy: {dataCadastro: 'desc'}
            }
        }
    })

    if (!estabelecimento) {
        redirect("/restrito/admin")
    }

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
                <DetalhesTabs estabelecimento={estabelecimento} />
            </main>
        </div>
    )
}