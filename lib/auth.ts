import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"

interface iUser {
    id: string
    token: string
    data: any
    message: string
    user?: any
}

interface iUserResponse {
    token: string;
}

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
                const res = await fetch(
                    `${process.env.URL_API}/login`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(credentials),
                    }
                );

                const user: iUser = await res.json();
                if (res.ok) {
                    return user;
                }
                return null;
            }
        }
        ),
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
    ],

    pages: {
        signIn: "/auth/login",
        error: "*",
    },

    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                console.log({ user })
                token.accessToken = user.token;
                token.user = user.data.user;
                token.message = user.message;
            }
            return token;
        },
        async session({ session, token, user }) {
            session.user = token
            return {
                ...session,
                user: {
                    ...session.user,
                    accessToken: token.accessToken,
                    message: token.message,
                    user: token.user,
                },
                token: token.accessToken,
            };
        },
    },


}
