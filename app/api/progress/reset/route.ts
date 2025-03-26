import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// DELETE handler - Reset user progress
export async function DELETE() {
  try {
    console.log('Reset progress endpoint called');
    
    // Get the user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      console.log('Reset progress: Authentication required');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log(`Reset progress: Processing for user ${session.user.email}`);
    
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { progress: true },
    });
    
    // If user doesn't exist or doesn't have progress data
    if (!user || !user.progress) {
      console.log('Reset progress: No progress data found');
      return NextResponse.json(
        { error: 'No progress data found' },
        { status: 404 }
      );
    }
    
    const progressId = user.progress.id;
    console.log(`Reset progress: Found progress ID ${progressId}`);
    
    // Get counts before deletion for verification
    const videosCount = await prisma.videoProgress.count({
      where: { progressId },
    });
    
    const questionsCount = await prisma.questionProgress.count({
      where: { progressId },
    });
    
    const unitsCount = await prisma.unitProgress.count({
      where: { progressId },
    });
    
    console.log(`Reset progress: Found ${videosCount} videos, ${questionsCount} questions, ${unitsCount} units to delete`);
    
    // Transaction to delete all progress records
    const result = await prisma.$transaction(async (tx) => {
      // Delete all video progress records
      const deletedVideos = await tx.videoProgress.deleteMany({
        where: { progressId },
      });
      
      // Delete all question progress records
      const deletedQuestions = await tx.questionProgress.deleteMany({
        where: { progressId },
      });
      
      // Delete all unit progress records
      const deletedUnits = await tx.unitProgress.deleteMany({
        where: { progressId },
      });
      
      // Also reset completedUnits in the User model
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { 
          completedUnits: {} 
        },
      });
      
      return {
        deletedVideos,
        deletedQuestions,
        deletedUnits,
        updatedUser
      };
    });
    
    console.log('Reset progress: Transaction completed with results:', {
      deletedVideos: result.deletedVideos.count,
      deletedQuestions: result.deletedQuestions.count,
      deletedUnits: result.deletedUnits.count,
      updatedUser: !!result.updatedUser
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Progress reset successfully',
      details: {
        deletedVideos: result.deletedVideos.count,
        deletedQuestions: result.deletedQuestions.count,
        deletedUnits: result.deletedUnits.count,
        completedUnitsReset: !!result.updatedUser
      }
    });
    
  } catch (error) {
    console.error('Error resetting user progress:', error);
    return NextResponse.json(
      { error: 'Failed to reset progress data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 