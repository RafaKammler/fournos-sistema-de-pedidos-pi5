import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { DetalhesTabs } from "./detalhes-tabs"

export default async function EstabelecimentoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const estabelecimentoId = parseInt(id)

    if (isNaN(estabelecimentoId)) {
        redirect("/restrito/admin")
    }

    const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: estabelecimentoId }
    })

    if (!estabelecimento) {
        redirect("/restrito/admin")
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar
                logo={{
                    url: "/restrito/admin",
                    src: "/img.png",
                    alt: "Fournos Logo",
                    title: "Fournos"
                }}
                menu={[]}
            />
            <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <DetalhesTabs estabelecimento={estabelecimento} />
            </main>
        </div>
    )
}