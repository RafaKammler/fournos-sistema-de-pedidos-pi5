"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const toastId = toast.loading("Criando sua conta...")

        const formData = new FormData(e.currentTarget)
        const nome     = String(formData.get("name") ?? "")
        const email    = String(formData.get("email") ?? "")
        const senha    = String(formData.get("password") ?? "")
        const confirm  = String(formData.get("confirm-password") ?? "")

        if (senha !== confirm) {
            toast.error("As senhas não coincidem", { id: toastId })
            return
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha, perfil: "USUARIO" }),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(data.message || "Conta criada com sucesso!", { id: toastId })
                router.push("/login")
            } else {
                toast.error(data.message || "Erro ao criar conta", { id: toastId })
            }
        } catch (error) {
            toast.error("Erro de conexão. Tente novamente.", { id: toastId })
        }
    }

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <img src="/img.png" alt="Fournos logo" className="w-28 h-auto" />
                    <h1 className="text-2xl font-bold">Crie sua conta</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Preencha as informações para criar sua conta.
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                    <Input id="name" name="name" type="text" placeholder="Seu Nome..." required />
                </Field>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" name="email" type="email" placeholder="email@exemplo.com" required />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input id="password" name="password" type="password" required />
                </Field>
                <Field>
                    <FieldLabel htmlFor="confirm-password">Confirme sua Senha</FieldLabel>
                    <Input id="confirm-password" name="confirm-password" type="password" required />
                    <FieldDescription>Por favor confirme sua senha.</FieldDescription>
                </Field>
                <Field>
                    <Button type="submit">Criar</Button>
                </Field>
                <Field>
                    <FieldDescription className="px-6 text-center">
                        Já possui uma conta? <a href="/login" className="underline hover:text-primary">Login</a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}