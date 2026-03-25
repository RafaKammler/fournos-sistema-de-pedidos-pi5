"use client"

import { LoginForm } from "@/components/login-form"
import {ModeToggle} from "@/components/ui/mode-toggle";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex size-6 items-center justify-center rounded-md">
            <ModeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/graosCafePretoBranco.png"
          alt="Image"
          className="absolute inset-0 w-full object-cover object-bottom dark:brightness-[0.2]"
        />
      </div>
    </div>
  )
}
