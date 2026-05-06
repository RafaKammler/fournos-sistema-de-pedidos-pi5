import { Navbar } from "@/components/ui/navbar";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

function formatarTelefone(telefone: string) {
    if (!telefone) return "";
    const limpo = telefone.replace(/\D/g, ""); // Remove tudo que não é número
    if (limpo.length === 11) {
        return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"); // Celular
    } else if (limpo.length === 10) {
        return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3"); // Fixo
    }
    return telefone;
}

function formatarCep(cep: string) {
    if (!cep) return "";
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length === 8) {
        return limpo.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return cep;
}

export default async function HomePage() {
    const estabelecimentos = await prisma.estabelecimento.findMany({
        orderBy: {
            dataCadastro: 'desc'
        }
    });

    const usuarioLogado = await prisma.usuario.findFirst();
    const nomeExibicao = usuarioLogado ? usuarioLogado.nome : "Visitante";

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                logo={{
                    url: "/home",
                    src: "/img.png",
                    alt: "Fournos Logo",
                    title: "Fournos",
                }}
            />

            <main className="container mx-auto p-6 md:p-10">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Olá, {nomeExibicao}!</h1>
                        <p className="text-muted-foreground">O que vamos pedir para o intervalo hoje?</p>
                    </div>
                </header>

                <section>
                    <h2 className="mb-4 text-xl font-semibold">Cantinas e Padarias</h2>

                    {estabelecimentos.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <p className="text-muted-foreground">
                                Nenhuma cantina cadastrada no momento.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {estabelecimentos.map((local) => (
                                <div
                                    key={local.id}
                                    className="group cursor-pointer overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        <Image
                                            src={local.caminhoImagem || "/img.png"}
                                            alt={local.nome}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    <div className="p-4 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">{local.nome}</h3>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {local.descricao}
                                        </p>

                                        <div className="mt-2 flex flex-col gap-1">
                                            {local.cep && (
                                                <div className="flex items-center text-sm font-medium text-muted-foreground">
                                                    <svg className="mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    CEP: {formatarCep(local.cep)}
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm font-medium text-primary">
                                                <svg className="mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {formatarTelefone(local.telefone)}
                                            </div>
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