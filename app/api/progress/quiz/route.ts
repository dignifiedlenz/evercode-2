import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET handler - Retrieve quiz progress
export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const unitId = searchParams.get('unitId');
    const chapterId = searchParams.get('chapterId');
    
    // Validate required parameters
    if (!unitId || !chapterId) {
      return NextResponse.json(
        { error: 'Missing required parameters: unitId and chapterId' },
        { status: 400 }
      );
    }
    
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        progress: {
          include: {
            unitProgress: {
              where: {
                unitId,
                chapterId
              }
            }
          }
        }
      }
    });
    
    // If user doesn't exist or doesn't have progress data
    if (!user || !user.progress) {
      return NextResponse.json({
        message: 'No progress data found',
        completed: false
      });
    }
    
    // Find the specific unit progress
    const unitProgress = user.progress.unitProgress.find(
      up => up.unitId === unitId && up.chapterId === chapterId
    );
    
    if (!unitProgress) {
      return NextResponse.json({
        message: 'No quiz progress found for this unit',
        completed: false
      });
    }
    
    // Return the quiz progress data
    return NextResponse.json({
      completed: unitProgress.questionsCompleted,
      videoCompleted: unitProgress.videoCompleted,
      lastAccessed: unitProgress.lastAccessed
    });
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz progress data' },
      { status: 500 }
    );
  }
} 