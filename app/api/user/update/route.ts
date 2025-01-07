import { NextResponse } from "next/server";
import argon2 from "argon2";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UpdateBody = {
  firstName?: string;
  lastName?: string;
  oldPassword?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, oldPassword, newPassword } = (await request.json()) as UpdateBody;

    // 1) Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2) Build update data object
    interface UpdateData {
      firstName?: string;
      lastName?: string;
      password?: string;
    }

    const updateData: UpdateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // If newPassword is provided, oldPassword is required
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

    // If no updates are provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    // 3) Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
