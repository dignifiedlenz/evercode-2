import { NextResponse } from "next/server";
import argon2 from "argon2";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, oldPassword, newPassword } = await request.json();

    // 1) Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2) Build update data object
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // 3) If user provided newPassword, require oldPassword check
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json(
          { error: "Old password is required" },
          { status: 400 }
        );
      }
      // Verify old password
      const isValid = await argon2.verify(user.password, oldPassword);
      if (!isValid) {
        return NextResponse.json(
          { error: "Old password is incorrect" },
          { status: 400 }
        );
      }
      // Hash new password
      const hashed = await argon2.hash(newPassword);
      updateData.password = hashed;
    }

    // 4) Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({
      message: "Profile updated",
      user: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
