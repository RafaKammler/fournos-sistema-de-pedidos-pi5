import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
                            className,
                            ...props
                          }: React.ComponentProps<"form">) {

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get("email") ?? "")
    const senha = String(formData.get("senha") ?? "")

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    })

    if(res.ok){
      const data = await res.json()

      if (data.usuario?.perfil === 'ADMIN' || data.perfil === 'ADMIN') {
        router.push("/restrito/admin")
      } else {
        router.push("/home")
      }

    } else {
      toast("Login Falhou", {
        description: "O login falhou, verifique suas informações e tente novamente.",
      })
    }
  }

  return (
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <Link href="/home" className="hover:opacity-80 transition-opacity cursor-pointer">
              <img src="/img.png" alt="Logo Fournos" className="h-20 w-auto" />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Faça Login em sua Conta</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Insira seu e-mail abaixo para acessar sua conta
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="senha">Senha</FieldLabel>
              <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Esqueceu sua senha?
              </a>
            </div>
            <Input id="senha" name="senha" type="password" required />
          </Field>
          <Field>
            <Button type="submit">Login</Button>
          </Field>
          <Field>
            <FieldDescription className="text-center">
              Não possui uma conta?{" "}
              <a href="/register" className="underline underline-offset-4">
                Cadastre-se
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
  )
}
