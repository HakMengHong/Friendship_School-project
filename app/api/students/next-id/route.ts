import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get the highest student ID from the database
    const lastStudent = await prisma.student.findFirst({
      orderBy: { studentId: 'desc' },
      select: { studentId: true }
    });

    let nextId = 1000; // Start from 1000 instead of 1
    if (lastStudent && lastStudent.studentId) {
      // If highest ID is less than 1000, start from 1000
      // Otherwise, increment from the highest ID
      nextId = Math.max(lastStudent.studentId + 1, 1000);
    }

    return NextResponse.json({ nextStudentId: nextId.toString() });
  } catch (error) {
    console.error('Error generating next student ID:', error);
    // Fallback to 1000 instead of 1
    return NextResponse.json({ nextStudentId: "1000" });
  }
}