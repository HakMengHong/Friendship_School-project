import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get unique grades from Course table
    const courses = await prisma.course.findMany({
      select: {
        grade: true
      },
      distinct: ['grade']
    });

    // Extract and sort grades
    const gradeList = courses
      .map(item => item.grade)
      .filter(grade => grade && grade.trim() !== "")
      .sort((a, b) => {
        // Sort numerically for grade values
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.localeCompare(b);
      });

    return NextResponse.json({ classes: gradeList });
  } catch (error) {
    console.error('Error fetching grades from courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades from courses' },
      { status: 500 }
    );
  }
}
