import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth";
import GithubProvider from "next-auth/providers/github"

const handler = NextAuth(authOptions)

// const handler = NextAuth({
//     providers: [
//         GithubProvider({
//             clientId: process.env.GITHUB_ID as string,
//             clientSecret: process.env.GITHUB_SECRET as string,
//         })
//     ]
// })


export { handler as GET, handler as POST }
