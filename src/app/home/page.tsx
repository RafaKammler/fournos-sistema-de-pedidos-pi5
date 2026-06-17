import { Navbar } from "@/components/ui/navbar";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import ListaEstabelecimentos from "@/components/ListaEstabelecimentos";

export default async function HomePage() {
    // 1. Busca os dados de forma assíncrona
    const estabelecimentos = await prisma.estabelecimento.findMany({
        orderBy: { dataCadastro: 'desc' }
    });

    // 2. Lógica do Usuário
    const session = await getSession();
    let nomeExibicao = "Visitante";
    const perfilUsuario = session?.perfil as string | undefined;

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
            <Navbar perfil={perfilUsuario}
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

                {/* --- COMPONENTE CLIENTE --- */}
                <ListaEstabelecimentos estabelecimentos={estabelecimentos} />

            </main>
        </div>
    );
}