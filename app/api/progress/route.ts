import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET handler - Retrieve user progress
export async function GET() {
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
    
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        progress: {
          include: {
            videoProgress: true,
            questionProgress: true,
            unitProgress: true,
          },
        },
      },
    });
    
    // If user doesn't exist or doesn't have progress data
    if (!user || !user.progress) {
      // Create initial progress record if it doesn't exist
      const newProgress = await prisma.userProgress.create({
        data: {
          user: {
            connect: { email: session.user.email },
          },
        },
        include: {
          videoProgress: true,
          questionProgress: true,
          unitProgress: true,
        },
      });
      
      return NextResponse.json({ progress: newProgress });
    }
    
    // Return the user's progress data
    return NextResponse.json({ progress: user.progress });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}

// POST handler - Save user progress
export async function POST(request: NextRequest) {
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
    
    // Parse the request body
    const body = await request.json();
    const { type, data } = body;
    
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { progress: true },
    });
    
    // If user doesn't exist, return error
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create progress record if it doesn't exist
    let progressId = user.progress?.id;
    
    if (!progressId) {
      const newProgress = await prisma.userProgress.create({
        data: {
          user: {
            connect: { email: session.user.email },
          },
        },
      });
      progressId = newProgress.id;
    }
    
    // Process different types of progress data
    switch (type) {
      case 'video':
        return await handleVideoProgress(progressId, data);
      case 'question':
        return await handleQuestionProgress(progressId, data);
      case 'unit':
        return await handleUnitProgress(progressId, data);
      default:
        return NextResponse.json(
          { error: 'Invalid progress type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error saving user progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress data' },
      { status: 500 }
    );
  }
}

// Helper function to handle video progress
async function handleVideoProgress(progressId: string, data: any) {
  const { videoId, unitId, chapterId, currentTime, duration, completed } = data;
  
  try {
    // Check if video progress already exists
    const existingProgress = await prisma.videoProgress.findFirst({
      where: {
        progressId,
        videoId,
        unitId,
        chapterId,
      },
    });
    
    if (existingProgress) {
      // Update existing progress
      const updatedProgress = await prisma.videoProgress.update({
        where: { id: existingProgress.id },
        data: {
          currentTime,
          duration,
          completed,
          lastUpdated: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, data: updatedProgress });
    } else {
      // Create new progress
      const newProgress = await prisma.videoProgress.create({
        data: {
          progress: {
            connect: { id: progressId },
          },
          videoId,
          unitId,
          chapterId,
          currentTime,
          duration,
          completed,
          lastUpdated: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, data: newProgress });
    }
  } catch (error) {
    console.error('Error handling video progress:', error);
    return NextResponse.json(
      { error: 'Failed to save video progress' },
      { status: 500 }
    );
  }
}

// Helper function to handle question progress
async function handleQuestionProgress(progressId: string, data: any) {
  const { questionId, unitId, chapterId, answered, correct } = data;
  
  try {
    // Check if question progress already exists
    const existingProgress = await prisma.questionProgress.findFirst({
      where: {
        progressId,
        questionId,
        unitId,
        chapterId,
      },
    });
    
    if (existingProgress) {
      // Update existing progress
      const updatedProgress = await prisma.questionProgress.update({
        where: { id: existingProgress.id },
        data: {
          answered,
          correct,
          lastUpdated: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, data: updatedProgress });
    } else {
      // Create new progress
      const newProgress = await prisma.questionProgress.create({
        data: {
          progress: {
            connect: { id: progressId },
          },
          questionId,
          unitId,
          chapterId,
          answered,
          correct,
          lastUpdated: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, data: newProgress });
    }
  } catch (error) {
    console.error('Error handling question progress:', error);
    return NextResponse.json(
      { error: 'Failed to save question progress' },
      { status: 500 }
    );
  }
}

// Helper function to handle unit progress
async function handleUnitProgress(progressId: string, data: any) {
  const { unitId, chapterId, videoCompleted, questionsCompleted, firstName, lastName } = data;
  
  try {
    // Check if unit progress already exists
    const existingProgress = await prisma.unitProgress.findFirst({
      where: {
        progressId,
        unitId,
        chapterId,
      },
    });
    
    if (existingProgress) {
      // Update existing progress
      const updatedProgress = await prisma.unitProgress.update({
        where: { id: existingProgress.id },
        data: {
          firstName,
          lastName,
          ...(videoCompleted !== undefined && { videoCompleted }),
          ...(questionsCompleted !== undefined && { questionsCompleted }),
          completed: videoCompleted && questionsCompleted,
          lastAccessed: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, data: updatedProgress });
    } else {
      // Create new progress
      const newProgress = await prisma.unitProgress.create({
        data: {
          progress: {
            connect: { id: progressId },
          },
          unitId,
          chapterId,
          firstName,
          lastName,
          videoCompleted: videoCompleted || false,
          questionsCompleted: questionsCompleted || false,
          completed: videoCompleted && questionsCompleted,
          lastAccessed: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, data: newProgress });
    }
  } catch (error) {
    console.error('Error handling unit progress:', error);
    return NextResponse.json(
      { error: 'Failed to save unit progress' },
      { status: 500 }
    );
  }
} 