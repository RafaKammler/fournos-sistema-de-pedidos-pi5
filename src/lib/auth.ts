import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const secretKey = process.env.JWT_SECRET || "chave-secreta-fallback"
const key = new TextEncoder().encode(secretKey)

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, key)
        return payload
    } catch (error) {
        return null
    }
}