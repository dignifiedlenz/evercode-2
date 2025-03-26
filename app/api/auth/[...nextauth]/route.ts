import { authOptions } from "@/lib/auth";
import { getDeviceType } from "@/lib/utils/deviceDetection";
import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import { headers } from "next/headers";

// Create the NextAuth handler
const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Get device type from request headers
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || '';
        const deviceType = getDeviceType(userAgent);

        // Update user's lastLoginTime and deviceType
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginTime: new Date(),
            deviceType: deviceType,
          },
        });

        return true;
      } catch (error) {
        console.error("Error updating login info:", error);
        return true; // Still allow sign in even if tracking fails
      }
    },
  },
});

// Export only the HTTP methods
export { handler as GET, handler as POST };
