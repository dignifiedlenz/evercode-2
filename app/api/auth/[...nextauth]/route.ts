import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";


// Define auth options as a normal local variable (no `export`)


// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export only the HTTP methods
export { handler as GET, handler as POST };
