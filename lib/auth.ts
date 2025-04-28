// lib/auth.ts (or wherever you prefer)
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { supabase } from './supabase'

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

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Get the user from our database using the Supabase auth_id
  const user = await prisma.user.findUnique({
    where: { auth_id: data.user.id },
    include: {
      progress: {
        include: {
          unitProgress: true,
          quizProgress: true
        }
      }
    }
  })

  if (!user) {
    throw new Error('User not found in database')
  }

  return { user, session: data.session }
}

export async function signUp(email: string, password: string, firstName?: string, lastName?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) throw error

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { auth_id: data.user!.id }
    })

    if (existingUser) {
      console.log('User already exists in database:', existingUser)
      return { user: existingUser, session: data.session }
    }

    // Create the user in our database
    const user = await prisma.user.create({
      data: {
        auth_id: data.user!.id,
        email,
        firstName,
        lastName,
        role: 'user'
      }
    })

    console.log('Created new user in database:', user)
    return { user, session: data.session }
  } catch (error) {
    console.error('Error in signUp:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) return null

  // Get the user from our database
  const dbUser = await prisma.user.findUnique({
    where: { auth_id: user.id },
    include: {
      progress: {
        include: {
          unitProgress: true,
          quizProgress: true
        }
      }
    }
  })

  return dbUser
}
