import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // return NextResponse.redirect(new URL('/', request.url))
    const cookie = request.cookies.get("next-auth.session-token")
        ? request.cookies.get("next-auth.session-token")
        : false;

    if (request.nextUrl.pathname === "/login") {
        return cookie
            ? NextResponse.redirect(new URL("/user", request.url))
            : NextResponse.next();
    }
    if (request.nextUrl.pathname.startsWith("/user")) {
        return cookie
            ? NextResponse.next(NextResponse.rewrite(new URL("/user", request.url)))
            : NextResponse.redirect(new URL("/login", request.url));
    }
    if (request.nextUrl.pathname.startsWith("/mitra")) {
        return cookie
            ? NextResponse.next(NextResponse.rewrite(new URL("/mitra/abc", request.url)))
            : NextResponse.redirect(new URL("/auth/mitra/login", request.url));
    }

}