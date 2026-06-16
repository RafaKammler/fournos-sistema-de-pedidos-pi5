import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/ui/navbar"
import CheckoutClient from "./checkout-client"

export default async function CheckoutPage() {
    const session = await getSession()
    const perfilUsuario = session?.perfil as string | undefined

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar perfil={perfilUsuario} />

            <CheckoutClient />
        </div>
    )
}