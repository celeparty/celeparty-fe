import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },

    providers: [
        Credentials({
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },
            async authorize(credentials) {
                const user = {
                    id: "1",
                    name: "John",
                    email: "prasojodesigner@gmail.com",
                    password: "123456"
                }
                return user
            }
        }

        ),
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        })

    ]
}
