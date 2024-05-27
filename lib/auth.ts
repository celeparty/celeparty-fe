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

                const user = await res.json();


                if (res.ok && user) {
                    return user;
                }
                return null;
            }
        }
        ),
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        })
    ],

    pages: {
        signIn: "/login",
    },

    callbacks: {
        // async jwt({ token, user }) {
        //     if (user) {
        //         token.accessToken = user?.token;
        //         token.user = user.data?.user;
        //         token.message = user?.message;
        //     }
        //     return token;
        // },
        // async session({ session, token }) {
        //     session.accessToken = token.accessToken;
        //     session.message = token.message;
        //     session.user = token.user;
        //     return session;
        // },
    },
}
