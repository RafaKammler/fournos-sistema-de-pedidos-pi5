import { GalleryVerticalEnd } from "lucide-react"

import { ModeToggle } from "@/components/ui/mode-toggle";
import { SignupForm } from "@/components/signup-form"

export default function registerPage() {
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
                        <SignupForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/img.png"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
