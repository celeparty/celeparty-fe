import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

interface iUser {
	id: string;
	token: string;
	data: any;
	message: string;
	user?: any;
	success?: boolean;
}

interface iUserResponse {
	token: string;
}

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
		maxAge: 60 * 60,
	},

	providers: [
		Credentials({
			credentials: {
                identifier: {
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
                    `${process.env.BASE_API}/api/auth/local/`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${process.env.KEY_API_POST}`,
                        },
                        body: JSON.stringify(credentials),
                    }
                );

				const user: iUser = await res.json();
				if (res?.ok) {
					return user;
				} else {
					console.log("Password Salah");
				}
				return user;
			},
		}),
		GithubProvider({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
		}),
	],


    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.accessToken = user?.jwt;
                token.user = user?.user;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            session.jwt = token?.accessToken;
            session.user = token?.user;
            return session;
        },
    },
	pages: {
		signIn: "/auth/login",
		error: "*",
	},	
};
