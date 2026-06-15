import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { AdminTabs } from "./admin-tabs"

export default async function AdminPage() {
    const session = await getSession()

    if (!session || session.perfil !== "ADMIN") {
        redirect("/home")
    }

    const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(session.sub as string) },
        select: { nome: true, email: true, perfil: true }
    })

    if (!usuario) {
        redirect("/login")
    }

    const estabelecimentos = await prisma.estabelecimento.findMany()

    const usuarios = await prisma.usuario.findMany({
        orderBy: { dataCadastro: 'desc' },
        select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            dataCadastro: true
        }
    })

    const complementos = await prisma.complemento.findMany({
        include: { estabelecimento: { select: { nome: true } } },
        orderBy: { id: 'desc' }
    })

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
            <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <div className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
                        <p className="text-muted-foreground text-sm">
                            Bem-vindo, <span className="font-medium text-foreground">{usuario.nome}</span>
                        </p>
                    </div>
                    <div className="flex flex-col sm:items-end text-sm text-muted-foreground">
                        <span>{usuario.email}</span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mt-1">
                            {usuario.perfil}
                        </span>
                    </div>
                </div>

                <AdminTabs
                    estabelecimentos={estabelecimentos}
                    usuarios={usuarios}
                    complementos={complementos}
                />
            </main>
        </div>
    )
}