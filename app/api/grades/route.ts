import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch grades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const today = searchParams.get('today');
    const limit = searchParams.get('limit');
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const semesterId = searchParams.get('semesterId');

    let whereClause: any = {};
    
    // Handle specific grade filtering
    if (studentId || courseId || semesterId) {
      if (studentId) whereClause.studentId = parseInt(studentId);
      if (courseId) whereClause.courseId = parseInt(courseId);
      if (semesterId) whereClause.semesterId = parseInt(semesterId);
    } else if (today === 'true') {
      // Handle today filter
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
        },
        semester: {
          select: {
            semester: true,
            semesterCode: true
          }
        },
        user: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
            role: true
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
    const { studentId, subjectId, semesterId, courseId, gradeDate, grade, gradeComment, userId } = body;

    if (!studentId || !subjectId || !semesterId || !courseId || !gradeDate || grade === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newGrade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        semesterId,
        courseId,
        gradeDate,
        grade,
        gradeComment,
        userId
      }
    });

    return NextResponse.json(newGrade, { status: 201 });
  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json({ error: 'Failed to create grade' }, { status: 500 });
  }
}

// PUT: Update an existing grade
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { gradeId, studentId, subjectId, semesterId, courseId, gradeDate, grade, gradeComment, userId } = body;

    if (!gradeId || !studentId || !subjectId || !semesterId || !courseId || !gradeDate || grade === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedGrade = await prisma.grade.update({
      where: { gradeId },
      data: {
        studentId,
        subjectId,
        semesterId,
        courseId,
        gradeDate,
        grade,
        gradeComment,
        userId,
        lastEdit: new Date()
      }
    });

    return NextResponse.json(updatedGrade);
  } catch (error) {
    console.error('Error updating grade:', error);
    return NextResponse.json({ error: 'Failed to update grade' }, { status: 500 });
  }
}

// DELETE: Delete a grade
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');

    if (!gradeId) {
      return NextResponse.json({ error: 'Grade ID is required' }, { status: 400 });
    }

    await prisma.grade.delete({
      where: { gradeId: parseInt(gradeId) }
    });

    return NextResponse.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json({ error: 'Failed to delete grade' }, { status: 500 });
  }
}