import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logActivity, ActivityMessages } from '@/lib/activity-logger';

const prisma = new PrismaClient();

// PUT - Update enrollment (for dropping)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { userId } = body;
    
    console.log('🔄 Updating enrollment:', {
      enrollmentId,
      body
    });

    // Update the enrollment with drop information
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        enrollmentId: enrollmentId
      },
      data: {
        drop: body.drop || false,
        dropSemesterId: body.dropSemesterId || null,
        dropDate: body.dropDate ? new Date(body.dropDate) : null,
        dropReason: body.dropReason || null
      } as any,
      include: {
        course: true,
        student: true,
        dropSemester: true
      } as any
    });

    console.log('✅ Enrollment updated successfully:', updatedEnrollment);

    // Log activity
    if (userId) {
      if (body.drop) {
        await logActivity(
          userId,
          ActivityMessages.DROP_STUDENT,
          `ដកសិស្ស ${updatedEnrollment.student.lastName} ${updatedEnrollment.student.firstName} ចេញពីថ្នាក់ ${updatedEnrollment.course.courseName} - ${body.dropReason || 'មូលហេតុមិនបញ្ជាក់'}`
        )
      } else {
        await logActivity(
          userId,
          ActivityMessages.UPDATE_ENROLLMENT,
          `ធ្វើបច្ចុប្បន្នភាពការចុះឈ្មោះ ${updatedEnrollment.student.lastName} ${updatedEnrollment.student.firstName}`
        )
      }
    }

    return NextResponse.json(updatedEnrollment);
  } catch (error) {
    console.error('❌ Error updating enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get single enrollment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = parseInt(resolvedParams.id);
    
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        enrollmentId: enrollmentId
      },
      include: {
        course: true,
        student: true,
        dropSemester: true
      } as any
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
