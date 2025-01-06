// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";

export const authOptions = {
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

        // 1) Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // 2) Argon2 verify
        const isValid = await argon2.verify(user.password, credentials.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // 3) Return user object
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt", // or "database" if you prefer
  },
  pages: {
    signIn: "/signin", // optional custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET, // must be set in .env
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
