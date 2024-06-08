import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server';
// import { cookies } from "next/headers"

export function middleware(request: NextRequest) {
    const cookie = request.cookies.get("next-auth.session-token")
        ? request.cookies.get("next-auth.session-token")
        : false;

    if (cookie && request.nextUrl.pathname.startsWith('/mitra')) {
        return NextResponse.next();
    }


    if (!cookie && request.nextUrl.pathname.startsWith('/mitra')) {
        return Response.redirect(new URL('/auth/mitra/login', request.url))
    }

    console.log(cookie)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
