import { create } from 'zustand'
// 1. Importamos o middleware de persistência do próprio Zustand
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: number
    nome: string
    preco: number
    quantidade: number
    caminhoImagem: string | null
    estabelecimentoId: number
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: number) => void
    limparCarrinho: () => void
}

// 2. Envolvemos a nossa função de criação do estado com o 'persist'
export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],

            addItem: (newItem) => set((state) => {
                const itemExistente = state.items.find((item) => item.id === newItem.id)

                if (itemExistente) {
                    return {
                        items: state.items.map((item) =>
                            item.id === newItem.id
                                ? { ...item, quantidade: item.quantidade + newItem.quantidade }
                                : item
                        )
                    }
                }

                return { items: [...state.items, newItem] }
            }),

            removeItem: (id) => set((state) => ({
                items: state.items.filter((item) => item.id !== id)
            })),

            limparCarrinho: () => set({ items: [] })
        }),
        {
            // 3. Damos um nome para essa "gaveta" no navegador do usuário
            name: 'fournos-carrinho',
        }
    )
)