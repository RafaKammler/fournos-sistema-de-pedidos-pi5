import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || "chave-secreta-fallback"
const key = new TextEncoder().encode(secretKey)

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    if (request.nextUrl.pathname.startsWith('/restrito')) {

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            await jwtVerify(token, key)

            return NextResponse.next()
        } catch (error) {
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('token')
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/restrito/:path*'],
}