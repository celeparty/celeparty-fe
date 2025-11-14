import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// import { cookies } from "next/headers"

export function middleware(request: NextRequest) {
	const cookies = request.cookies.getAll();
	const nextAuthCookie = cookies.find((cookie) => cookie.name === "next-auth.session-token");
	const secureNextAuthCookie = cookies.find((cookie) => cookie.name === "__Secure-next-auth.session-token");

	const cookie = nextAuthCookie || secureNextAuthCookie || false;

	// Protected paths that require authentication
	const protectedPaths = ["/user", "/cart"];

	// Check if the current path is protected
	const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

	if (cookie && request.nextUrl.pathname.startsWith("/auth/login")) {
		const redirectUrl = request.nextUrl.searchParams.get("redirect");
		if (redirectUrl) {
			return Response.redirect(new URL(redirectUrl, request.url));
		}
		return Response.redirect(new URL("/user/home", request.url));
	}

	if (!cookie && isProtectedPath) {
		return Response.redirect(new URL("/auth/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
