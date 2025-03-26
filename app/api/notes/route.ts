// app/api/notes/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import path based on your project structure
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");
    const unitId = searchParams.get("unitId");

    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(chapterId ? { chapterId } : {}),
        ...(unitId ? { unitId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Ensure each note has valid content
    const processedNotes = notes.map(note => {
      try {
        // Don't try to parse content again if it's already been parsed by Prisma
        const parsedContent = typeof note.content === 'string' 
          ? JSON.parse(note.content) 
          : note.content;
          
        return {
          ...note,
          content: parsedContent,
        };
      } catch (error) {
        console.error(`Error parsing note content for note ${note.id}:`, error);
        // Return a default empty content structure if parsing fails
        return {
          ...note,
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Error loading note content"
                  }
                ]
              }
            ]
          },
        };
      }
    });

    return NextResponse.json({ notes: processedNotes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ 
      error: "Failed to fetch notes",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request body");
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const { content, chapterId, unitId, title, timestamp = 0 } = body;

    // Only chapterId is required, unitId is optional
    if (!content || !chapterId || !title) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    console.log("Processing note save request:", { 
      userId, 
      chapterId,
      unitId: unitId || 'not specified',
      titleLength: title.length 
    });

    // Ensure timestamp is a number
    const numericTimestamp = Number(timestamp) || 0;
    const contentString = JSON.stringify(content);

    try {
      // Try to find an existing note by userId and chapterId only
      const existingNote = await prisma.note.findFirst({
        where: {
          userId,
          chapterId,
        },
      });

      if (existingNote) {
        // Update existing note
        await prisma.note.update({
          where: {
            id: existingNote.id,
          },
          data: {
            content: contentString,
            title,
            unitId: unitId || existingNote.unitId, // Keep existing unitId if not provided
            timestamp: numericTimestamp,
          },
        });
        console.log("Updated existing note with ID:", existingNote.id);
      } else {
        // Create new note
        const newNote = await prisma.note.create({
          data: {
            content: contentString,
            title,
            chapterId,
            unitId: unitId || '', // Make unitId optional in new notes
            timestamp: numericTimestamp,
            userId,
          },
        });
        console.log("Created new note with ID:", newNote.id);
      }

      return NextResponse.json({ success: true, message: "Note saved successfully" });
    } catch (dbError) {
      console.error("Database error saving note:", dbError);
      return NextResponse.json({ 
        success: false, 
        message: "Database error saving note",
        error: dbError instanceof Error ? dbError.message : "Unknown database error"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
