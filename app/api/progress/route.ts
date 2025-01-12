// app/api/progress/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust the import path as necessary
import { prisma } from '@/lib/prisma';
import { CompletedUnits } from '@/types/course';

// Define the shape of the POST request body
interface ProgressRequestBody {
  chapterId: string;
  unitId: string;
}

// Handle GET requests to fetch progress
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userEmail = session.user.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { completedUnits: true },
    });

    // Typecast completedUnits to CompletedUnits interface
    const completedUnits: CompletedUnits = user?.completedUnits as CompletedUnits || {};

    return NextResponse.json({ completedUnits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// Handle POST requests to update progress
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userEmail = session.user.email;

  try {
    const body: ProgressRequestBody = await request.json();

    const { chapterId, unitId } = body;

    if (!chapterId || !unitId) {
      return NextResponse.json(
        { message: 'chapterId and unitId must be provided' },
        { status: 400 }
      );
    }

    // Fetch the current completedUnits
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { completedUnits: true },
    });

    // Typecast completedUnits to CompletedUnits interface
    const existingUnits: CompletedUnits = (user?.completedUnits as CompletedUnits) || {};

    // Initialize the chapter array if it doesn't exist
    if (!existingUnits[chapterId]) {
      existingUnits[chapterId] = [];
    }

    // Add the unitId if it's not already present
    if (!existingUnits[chapterId].includes(unitId)) {
      existingUnits[chapterId].push(unitId);
    }

    // Update the user with the new completedUnits
    await prisma.user.update({
      where: { email: userEmail },
      data: { completedUnits: existingUnits },
    });

    return NextResponse.json({ message: 'Progress updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
