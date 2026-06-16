"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

interface ProdutoProps {
    produto: {
        id: number
        nome: string
        descricao: string
        preco: number
        caminhoImagem: string | null
        estabelecimentoId: number
    }
}

export function ProdutoCard({ produto }: ProdutoProps) {
    const [quantidade, setQuantidade] = useState(1)

    const addItem = useCartStore((state) => state.addItem)

    const diminuir = () => {
        if (quantidade > 1) setQuantidade(quantidade - 1)
    }

    const aumentar = () => {
        setQuantidade(quantidade + 1)
    }

    const adicionarAoCarrinho = () => {
        addItem({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: quantidade,
            caminhoImagem: produto.caminhoImagem,
            estabelecimentoId: produto.estabelecimentoId
        })

        alert(`${produto.nome} adicionado ao carrinho!`)
    }

    return (
        <div className="border rounded-xl shadow-sm flex flex-col justify-between bg-card text-card-foreground overflow-hidden transition-all hover:shadow-md">
            <div className="relative w-full h-36 bg-muted border-b">
                {produto.caminhoImagem ? (
                    <Image src={produto.caminhoImagem} alt={produto.nome} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-muted/30">Sem imagem</div>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-base leading-tight">{produto.nome}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2">{produto.descricao}</p>
                    <p className="text-primary font-bold text-lg">R$ {produto.preco.toFixed(2).replace('.', ',')}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center border rounded-md bg-muted/50 h-9">
                        <Button variant="ghost" onClick={diminuir} className="h-full px-2.5 text-lg hover:bg-muted rounded-r-none">-</Button>
                        <span className="w-6 text-center font-medium text-sm">{quantidade}</span>
                        <Button variant="ghost" onClick={aumentar} className="h-full px-2.5 text-lg hover:bg-muted rounded-l-none">+</Button>
                    </div>
                    <Button className="flex-1 h-9 font-semibold text-sm" onClick={adicionarAoCarrinho}>
                        Adicionar
                    </Button>
                </div>
            </div>
        </div>
    )
}