import { Navbar } from "@/components/ui/navbar";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
    // Busca todos os estabelecimentos cadastrados no banco
    const estabelecimentos = await prisma.estabelecimento.findMany({
        orderBy: {
            dataCadastro: 'desc'
        }
    });

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                logo={{
                    url: "/home",
                    src: "/img.png",
                    alt: "Fournos Logo",
                    title: "Fournos",
                }}
                location="Erechim"
                time="8:02 PM"
            />

            <main className="container mx-auto p-6 md:p-10">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Olá, Usuário!</h1>
                        <p className="text-muted-foreground">O que vamos pedir para o intervalo hoje?</p>
                    </div>
                </header>

                <section>
                    <h2 className="mb-4 text-xl font-semibold">Cantinas e Padarias</h2>

                    {/* Verificação: Se o banco estiver vazio, mostra um aviso */}
                    {estabelecimentos.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <p className="text-muted-foreground">
                                Nenhuma cantina cadastrada no momento.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {/* Renderiza os dados reais do banco */}
                            {estabelecimentos.map((local) => (
                                <div
                                    key={local.id}
                                    className="group cursor-pointer overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                                >
                                    {/* Imagem do Card */}
                                    <div className="aspect-video w-full overflow-hidden bg-muted">
                                        <img
                                            src={local.caminhoImagem || "/img.png"}
                                            alt={`Imagem de ${local.descricao}`}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Informações do Card */}
                                    <div className="p-4 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">{local.descricao}</h3>
                                        </div>

                                        <p className="text-sm text-muted-foreground">Lanches e Refeições</p>

                                        {/* Telefone/Celular*/}
                                        <div className="mt-2 flex items-center text-sm font-medium text-primary">
                                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {local.telefone}
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}