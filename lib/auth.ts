// lib/auth.ts (or wherever you prefer)
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";

declare module "next-auth/jwt" {
    interface JWT {
      // allow email to be string, null, or undefined
      email?: string | null;
      name?: string | null;
      sub?: string;
      // any other custom fields
    }
  }
  


export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isValid = await argon2.verify(user.password, credentials.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.sub || "";
          session.user.email = token.email || "";
          session.user.name = token.name || "";
        }
        return session;
      },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
