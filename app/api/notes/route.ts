// app/api/notes/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import path based on your project structure
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) { // Renamed to _request to prevent unused parameter error
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const note = await prisma.note.findUnique({
      where: { userId }, // Ensure 'userId' is unique in your Prisma schema
    });

    return NextResponse.json({
      content: note ? JSON.parse(note.content) : null, // Adjust based on Prisma's JSON handling
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { content } = body;

  // Validate that content is a valid JSON object
  if (!content || typeof content !== "object") {
    return NextResponse.json({ error: "Invalid content format" }, { status: 400 });
  }

  try {
    const note = await prisma.note.upsert({
      where: { userId }, // Ensure 'userId' is unique in your Prisma schema
      update: { content: JSON.stringify(content) },
      create: { content: JSON.stringify(content), userId },
    });

    return NextResponse.json({ content: JSON.parse(note.content) }, { status: 200 });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
