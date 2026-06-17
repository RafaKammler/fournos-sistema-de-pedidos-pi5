"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
    const router = useRouter()

    useEffect(() => {
        // Cria um relógio que recarrega os dados da página a cada X milissegundos
        const intervalId = setInterval(() => {
            router.refresh()
        }, intervalMs)

        // Limpa o relógio se o usuário sair da página
        return () => clearInterval(intervalId)
    }, [router, intervalMs])

    return null // Este componente é invisível, não renderiza nada na tela
}