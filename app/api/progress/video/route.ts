import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET handler - Retrieve video progress
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
            videoProgress: {
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
        completed: false,
        currentTime: 0
      });
    }
    
    // Find the specific video progress
    const videoProgress = user.progress.videoProgress.find(
      vp => vp.unitId === unitId && vp.chapterId === chapterId
    );
    
    if (!videoProgress) {
      return NextResponse.json({
        message: 'No video progress found for this unit',
        completed: false,
        currentTime: 0
      });
    }
    
    // Return the video progress data
    return NextResponse.json({
      completed: videoProgress.completed,
      currentTime: videoProgress.currentTime,
      duration: videoProgress.duration,
      lastUpdated: videoProgress.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching video progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video progress data' },
      { status: 500 }
    );
  }
}