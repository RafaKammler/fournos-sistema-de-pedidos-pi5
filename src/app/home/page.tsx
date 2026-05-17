import { Navbar } from "@/components/ui/navbar";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { getSession } from "@/lib/auth";

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

const categoriasTemporarias = [
    {
        id: 1,
        nome: "Lanches",
        icone: (
            <svg className="mb-2 h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/* Ícone de Hambúrguer */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11a7 7 0 0114 0M4 14h16M4 17h16v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1z" />
            </svg>
        ),
    },
    {
        id: 2,
        nome: "Salgados",
        icone: (
            <svg className="mb-2 h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/* Ícone de Coxinha/Pastel */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C12 2 7 8 7 11a5 5 0 1010 0c0-3-5-9-5-9z" />
            </svg>
        ),
    },
    {
        id: 3,
        nome: "Pizzas",
        icone: (
            <svg className="mb-2 h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/* Ícone de Fatia de Pizza */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 19a12 12 0 0020 0L12 2z M12 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M15 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M9 16a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
        ),
    },
    {
        id: 4,
        nome: "Doces",
        icone: (
            <svg className="mb-2 h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/* Ícone de Bala/Doce */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12a3 3 0 106 0 3 3 0 00-6 0zM9 12L3 8v8l6-4zM15 12l6-4v8l-6-4z" />
            </svg>
        ),
    },
    {
        id: 5,
        nome: "Bebidas",
        icone: (
            <svg className="mb-2 h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/* Ícone de Copo de Refrigerante/Suco */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l1.5 13a2 2 0 002 1.5h5a2 2 0 002-1.5L18 8M4 8h16M10 8V3a1 1 0 011-1h2" />
            </svg>
        ),
    },
    {
        id: 6,
        nome: "Saudável",
        icone: (
            <svg className="mb-2 h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/* Ícone de Folha/Vegano */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3c0 0-7-1-12 4-5 5-6 14-6 14s9-1 14-6c5-5 4-12 4-12zM3 21l9-9" />
            </svg>
        ),
    },
];

export default async function HomePage() {
    const estabelecimentos = await prisma.estabelecimento.findMany({ /* ... */ });

    const session = await getSession();
    let nomeExibicao = "Visitante";

    if (session && session.sub) {
        const usuarioLogado = await prisma.usuario.findUnique({
            where: { id: parseInt(session.sub as string) }
        });

        if (usuarioLogado) {
            nomeExibicao = usuarioLogado.nome.split(' ')[0];
        }
    }


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

                {/* --- Banner --- */}
                <section className="mb-10">
                    <div className="relative w-full aspect-[3/1] overflow-hidden rounded-2xl shadow-sm">
                        <Image
                            src="/banner.png"
                            alt="O seu intervalo merece o melhor"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="mb-4 text-xl font-semibold">Categorias</h2>
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                        {categoriasTemporarias.map((categoria) => (
                            <div
                                key={categoria.id}
                                className="group flex h-20 cursor-pointer flex-col items-center justify-center rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md hover:-translate-y-1"
                            >
                                {categoria.icone}
                                <span className="text-sm font-medium transition-colors group-hover:text-primary">
                                    {categoria.nome}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

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