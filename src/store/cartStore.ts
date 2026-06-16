import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItemComplemento {
    id: number
    nome: string
    preco: number
    quantidade: number
}

export interface CartItem {
    cartItemId: string
    produtoId: number
    nome: string
    precoBase: number
    quantidade: number
    caminhoImagem: string | null
    estabelecimentoId: number
    complementos: CartItemComplemento[]
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (cartItemId: string) => void
    limparCarrinho: () => void
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],

            addItem: (newItem) => set((state) => {
                // Como cada lanche pode ser customizado diferente, tratamos como um item novo
                // (A não ser que você queira fazer uma lógica complexa de comparar arrays de complementos)
                return { items: [...state.items, newItem] }
            }),

            removeItem: (cartItemId) => set((state) => ({
                items: state.items.filter((item) => item.cartItemId !== cartItemId)
            })),

            limparCarrinho: () => set({ items: [] })
        }),
        {
            name: 'fournos-carrinho',
        }
    )
)