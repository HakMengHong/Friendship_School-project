import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity, ActivityMessages } from '@/lib/activity-logger';

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
      const todayDate = new Date();
      const todayStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
      const todayEnd = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1);
      
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
            courseName: true,
            grade: true
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
      },
      include: {
        student: true,
        subject: true
      }
    });

    // Log activity
    if (userId) {
      await logActivity(
        userId,
        ActivityMessages.ADD_GRADE,
        `បញ្ចូលពិន្ទុ ${newGrade.student.lastName} ${newGrade.student.firstName} - ${newGrade.subject.subjectName}: ${grade}`
      )
    }

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
      },
      include: {
        student: true,
        subject: true
      }
    });

    // Log activity
    if (userId) {
      await logActivity(
        userId,
        ActivityMessages.EDIT_GRADE,
        `កែប្រែពិន្ទុ ${updatedGrade.student.lastName} ${updatedGrade.student.firstName} - ${updatedGrade.subject.subjectName}: ${grade}`
      )
    }

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
    const userId = searchParams.get('userId');

    if (!gradeId) {
      return NextResponse.json({ error: 'Grade ID is required' }, { status: 400 });
    }

    // Get grade info before deleting
    const grade = await prisma.grade.findUnique({
      where: { gradeId: parseInt(gradeId) },
      include: {
        student: true,
        subject: true
      }
    });

    await prisma.grade.delete({
      where: { gradeId: parseInt(gradeId) }
    });

    // Log activity
    if (userId && grade) {
      await logActivity(
        parseInt(userId),
        ActivityMessages.DELETE_GRADE,
        `លុបពិន្ទុ ${grade.student.lastName} ${grade.student.firstName} - ${grade.subject.subjectName}`
      )
    }

    return NextResponse.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json({ error: 'Failed to delete grade' }, { status: 500 });
  }
}