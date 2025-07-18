import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        guardians: true,
        family: true,
        scholarships: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      student,        // { firstName, lastName, ... }
      guardians,      // [{ name, relation, ... }]
      familyInfo,     // { fatherName, ... }
      scholarships,   // [{ type, amount, ... }]
    } = data;

    const created = await prisma.student.create({
      data: {
        ...student,
        guardians: {
          create: guardians || [],
        },
        family: familyInfo ? { create: familyInfo } : undefined,
        scholarships: {
          create: scholarships || [],
        },
      },
      include: {
        guardians: true,
        family: true,
        scholarships: true,
      },
    });

    return NextResponse.json({ student: created });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 