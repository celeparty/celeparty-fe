import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);

// handler is a NextAuth object with methods for each supported HTTP method
export { handler as GET, handler as POST };
