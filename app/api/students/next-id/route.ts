import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get the highest student ID from the database
    const lastStudent = await prisma.student.findFirst({
      orderBy: { studentId: 'desc' },
      select: { studentId: true }
    });

    let nextId = 1;
    if (lastStudent && lastStudent.studentId) {
      // Extract numeric part from student ID (e.g., "S001" -> 1, "123" -> 123)
      const numericPart = parseInt(lastStudent.studentId.replace(/\D/g, ''));
      if (!isNaN(numericPart)) {
        nextId = numericPart + 1;
      }
    }

    return NextResponse.json({ nextStudentId: nextId.toString() });
  } catch (error) {
    console.error('Error generating next student ID:', error);
    // Fallback to simple increment
    return NextResponse.json({ nextStudentId: "1" });
  }
}