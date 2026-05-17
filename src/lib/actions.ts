"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
    const cookieStore = await cookies();
    // Deleta o cookie "token"
    cookieStore.delete("token");

    // Redireciona para a página de login
    redirect("/login");
}