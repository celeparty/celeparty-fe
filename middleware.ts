import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// import { cookies } from "next/headers"

export function middleware(request: NextRequest) {
	const cookies = request.cookies.getAll();
	const nextAuthCookie = cookies.find(cookie => cookie.name === "next-auth.session-token");
	const secureNextAuthCookie = cookies.find(cookie => cookie.name === "__Secure-next-auth.session-token");
  
	const cookie = nextAuthCookie || secureNextAuthCookie || false;
  
  	if (cookie && request.nextUrl.pathname.startsWith("/user")) {
	  return NextResponse.next();
	}
	if (cookie && request.nextUrl.pathname.startsWith("/auth/login")) {
	  return Response.redirect(new URL("/user/home", request.url));
	}
  
	if (!cookie && request.nextUrl.pathname.startsWith("/user")) {
	  return Response.redirect(new URL("/auth/login", request.url));
	}
  }
  

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
