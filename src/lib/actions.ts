"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function logoutAction() {
    const cookieStore = await cookies();
    // Deleta o cookie "token"
    cookieStore.delete("token");

    // Atualiza o estado visual da aplicação (como a Navbar) sem forçar o redirecionamento para o login
    revalidatePath("/", "layout");
}