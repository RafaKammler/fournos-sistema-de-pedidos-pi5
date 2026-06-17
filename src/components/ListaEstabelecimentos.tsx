"use client";

import { useState } from "react";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

function formatarTelefone(telefone: string) {
    if (!telefone) return "";
    const limpo = telefone.replace(/\D/g, "");
    if (limpo.length === 11) {
        return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (limpo.length === 10) {
        return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
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

export default function ListaEstabelecimentos({ estabelecimentos }: { estabelecimentos: any[] }) {
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);

    const filtrados = categoriaSelecionada
        ? estabelecimentos.filter(e => e.categoria === categoriaSelecionada)
        : estabelecimentos;

    return (
        <>
            <section id="categorias" className="mb-10 scroll-mt-24">
                <h2 className="mb-4 text-xl font-semibold">Categorias</h2>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                    {CATEGORIAS_ESTABELECIMENTO.map((categoria) => {
                        const IconComponent = categoria.icone;
                        return (
                            <div
                                key={categoria.id}
                                onClick={() => setCategoriaSelecionada(categoriaSelecionada === categoria.id ? null : categoria.id)}
                                className={`group flex h-20 cursor-pointer flex-col items-center justify-center rounded-2xl border shadow-sm transition-all ${
                                    categoriaSelecionada === categoria.id
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "bg-card hover:border-primary/50 hover:shadow-md"
                                }`}
                            >
                                <IconComponent className="mb-2 size-6" />
                                <span className="text-sm font-medium">{categoria.nome}</span>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold">Cantinas e Padarias</h2>

                {filtrados.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground">
                            Nenhuma cantina encontrada nesta categoria.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtrados.map((local) => (
                            <Link
                                key={local.id}
                                href={`/estabelecimento/${local.id}`}
                                className="group cursor-pointer overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md block"
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
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}