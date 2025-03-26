import { NextResponse } from 'next/server';
import courseData from '@/app/_components/(semester1)/courseData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semester') || 'semester-1';

    // Get the semester data from the static course data
    const semesterData = courseData.find(s => s.id === semesterId);
    
    if (!semesterData) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(semesterData.chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
} 