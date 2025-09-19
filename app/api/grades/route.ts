import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch grades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const today = searchParams.get('today');
    const limit = searchParams.get('limit');

    let whereClause = {};
    
    if (today === 'true') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      whereClause = {
        createdAt: {
          gte: todayStart,
          lt: todayEnd
        }
      };
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        subject: {
          select: {
            subjectName: true
          }
        },
        course: {
          select: {
            courseName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}

// POST: Create a new grade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, subjectId, semesterId, gradeDate, grade, gradeComment } = body;

    if (!studentId || !subjectId || !semesterId || !gradeDate || grade === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newGrade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        semesterId,
        gradeDate,
        grade,
        gradeComment
      }
    });

    return NextResponse.json(newGrade, { status: 201 });
  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json({ error: 'Failed to create grade' }, { status: 500 });
  }
}