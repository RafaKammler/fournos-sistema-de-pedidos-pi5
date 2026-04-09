"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const nome     = String(formData.get("name") ?? "")
        const email    = String(formData.get("email") ?? "")
        const senha    = String(formData.get("password") ?? "")
        const confirm  = String(formData.get("confirm-password") ?? "")

        if (senha !== confirm) {
            alert("As senhas não coincidem")
            return
        }

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha, perfil: "user" }),
        })
        const data = await res.json()
        console.log(data)
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
                    <Input id="name" name="name" type="text" placeholder="Layne Staley" required />
                </Field>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" name="email" type="email" placeholder="chris@example.com" required />
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
                        Já possui uma conta? <a href="/login">Login</a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}