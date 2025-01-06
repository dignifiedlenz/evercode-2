// middleware.ts (at the root, e.g. app/middleware.ts)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Check JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // If user is not logged in and tries to access /course, redirect them
  if (!token && req.nextUrl.pathname.startsWith("/course")) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  // Otherwise, continue
  return NextResponse.next();
}

// Match the routes where you want the middleware to apply
export const config = {
  matcher: ["/:path*"],
};
