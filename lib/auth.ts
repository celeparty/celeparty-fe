import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        Credentials({
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "mail@mail.com",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "********",
                }
            },
            async authorize(credentials) {
                const user = {
                    id: "id",
                    email: "mail@mail.com",
                }
                return user
            }
        })
    ]
}