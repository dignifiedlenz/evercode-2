import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        group: true
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, role } = body;
    
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password, // Note: You should hash the password before storing
        role: role || UserRole.USER,
      },
      include: {
        group: true
      }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, role } = body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      include: {
        group: true
      }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
} 