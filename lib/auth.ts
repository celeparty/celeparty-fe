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

declare module "next-auth" {
	interface Session {
	  jwt?: string; // JWT token
	  user?: any; // Informasi user yang berasal dari API
	}
  
	interface User {
	  jwt?: string; // Token dari API Anda
	  user?: any; // Informasi tambahan user
	}
  
	interface JWT {
	  accessToken?: string; // Nama token yang Anda gunakan
	  user?: any; // Informasi user yang berasal dari token
	}
  }

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
		maxAge: 24*60 * 60, // 24 hours
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
				const res = await fetch(`${process.env.BASE_API}/api/auth/local?populate=role`, {
					method: "POST",
					headers: {
					  "Content-Type": "application/json",
					},
					body: JSON.stringify(credentials),
				  });
			  
				  const user = await res.json();

			  
				if (res.ok && user.jwt) {
				  return user; // Kembalikan respons API langsung
				}
			  
				return null; // Jika gagal
			  }
		}),
		GithubProvider({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
		}),
	],


    callbacks: {
		async jwt({ token, user }: { token: any; user: any }) {
			// Jika ada `user`, tambahkan ke `token`
			if (user) {
			  token.accessToken = user.jwt; // Simpan JWT ke token
			  token.user = user.user; // Simpan informasi user
        // Pastikan role juga ada di token.user
        if (user.user && user.user.role) {
          token.user.role = user.user.role;
        } else if (user.role) {
          token.user = { ...token.user, role: user.role };
        }
			}
			return token; // Kembalikan token yang diperbarui
		},
		
		async session({ session, token }: { session: any; token: any }) {
			// Transfer token ke session
			session.jwt = token.accessToken; // Simpan JWT ke session
			session.user = token.user; // Simpan informasi user ke session
      // Pastikan role juga ada di session.user
      if (token.user && token.user.role) {
        session.user.role = token.user.role;
      }
			return session; // Kembalikan session yang diperbarui
		},
    },
	pages: {
		signIn: "/auth/login",
		error: "*",
	},	
};
