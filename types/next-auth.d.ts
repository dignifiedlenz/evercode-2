import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// 1) Extend the shape of the session and user
declare module "next-auth" {
  interface Session {
    // user: DefaultSession["user"] & {
    //   id: string;
    // };
    user: {
      /** The user's unique ID. */
      id: string;
      /** The user's email address. */
      email: string | null;
      /** The user's display name. */
      name: string | null;
      
    };
  }
}

// 2) Extend the shape of the JWT token (optional, if you store extra fields in the token)
declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;         // The user’s ID (maps to session.user.id)
    email?: string;       // The user’s email
    name?: string;        // The user’s name
    
  }
}
