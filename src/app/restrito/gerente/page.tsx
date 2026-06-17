import {getSession} from "@/lib/auth"
import {prisma} from "@/lib/prisma"
import {redirect} from "next/navigation"
import {Navbar} from "@/components/ui/navbar"
import Link from "next/link"

export default async function GerentePage() {
    // 1. Pega a sessão usando a sua função auth.ts
    const session = await getSession()

    // 2. Proteção de Rota: Expulsa se não for GERENTE
    if (!session || session.perfil !== "GERENTE") {
        redirect("/home")
    }

    // 3. Converte o ID do payload (sub) para número
    const usuarioId = parseInt(session.sub as string)

    // Busca os dados do usuário logado
    const usuario = await prisma.usuario.findUnique({
        where: {id: usuarioId},
        select: {nome: true, email: true, perfil: true}
    })

    if (!usuario) {
        redirect("/login")
    }

    const estabelecimentos = await prisma.estabelecimento.findMany({
        where: {
            gerente: {
                usuarioId: usuarioId // Trava de segurança no Prisma
            }
        },
        include: {
            _count: {
                select: {pedidos: {where: {status: 'PENDENTE'}}}
            }
        }
    })

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar
                perfil={session.perfil as string}
                logo={{
                    url: "/restrito/gerente",
                    src: "/img.png",
                    alt: "Fournos Logo",
                    title: "Fournos"
                }}
                menu={[
                    {title: "Home", url: "/home"}
                ]}
            />
            <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                {/* Header do Dashboard igual ao do Admin */}
                <div
                    className="bg-card text-card-foreground shadow-sm ring-1 ring-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Painel do Gerente</h1>
                        <p className="text-muted-foreground text-sm">
                            Bem-vindo, <span className="font-medium text-foreground">{usuario.nome}</span>
                        </p>
                    </div>
                    <div className="flex flex-col sm:items-end text-sm text-muted-foreground">
                        <span>{usuario.email}</span>
                        <span
                            className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mt-1">
                            {usuario.perfil}
                        </span>
                    </div>
                </div>

                {/* Lista de Estabelecimentos */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Meus Estabelecimentos</h2>

                    {estabelecimentos.length === 0 ? (
                        <div className="p-6 bg-card border rounded-xl text-center">
                            <p className="text-muted-foreground">Nenhum estabelecimento vinculado à sua conta ainda.</p>
                            <p className="text-sm text-muted-foreground mt-1">Solicite ao Administrador para vincular
                                uma loja ao seu perfil.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {estabelecimentos.map(est => (
                                <div key={est.id}
                                     className="p-6 bg-card border rounded-xl shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{est.nome}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">CNPJ: {est.cnpj}</p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-sm font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                                                {est._count.pedidos} pedidos pendentes
                                            </span>
                                            <Link href={`/restrito/gerente/estabelecimento/${est.id}/pedidos`}
                                                  className="text-primary hover:underline text-sm font-medium">
                                                Ver Pedidos &rarr;
                                            </Link>
                                        </div>
                                        <div
                                            className="flex items-center justify-between border-t border-border/50 pt-3">
                                            <span className="text-sm text-muted-foreground">Cardápio da loja</span>
                                            <Link
                                                href={`/restrito/gerente/estabelecimento/${est.id}/produtos`}
                                                className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                                            >
                                                Gerenciar Produtos &rarr;
                                            </Link>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border/50 pt-3">
                                            <span className="text-sm text-muted-foreground">Adicionais (Extras)</span>
                                            <Link
                                                href={`/restrito/gerente/estabelecimento/${est.id}/complementos`}
                                                className="text-orange-600 hover:underline text-sm font-medium flex items-center gap-1"
                                            >
                                                Gerenciar Complementos &rarr;
                                            </Link>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border/50 pt-3">
                                            <span className="text-sm text-muted-foreground">Configurações</span>
                                            <Link
                                                href={`/restrito/gerente/estabelecimento/${est.id}/perfil`}
                                                className="text-muted-foreground hover:text-foreground hover:underline text-sm font-medium flex items-center gap-1"
                                            >
                                                Perfil da Loja &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}