import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, context: any) {
  const { params } = await context;
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const {
      student,        // { firstName, lastName, ... }
      guardians,      // [{ name, relation, ... }]
      familyInfo,     // { fatherName, ... }
      scholarships,   // [{ type, amount, ... }]
    } = data;

    // Update student and related records
    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...student,
        guardians: {
          deleteMany: {}, // Remove all old guardians
          create: guardians || [],
        },
        family: familyInfo
          ? {
              upsert: {
                create: familyInfo,
                update: familyInfo,
              },
            }
          : undefined,
        scholarships: {
          deleteMany: {}, // Remove all old scholarships
          create: scholarships || [],
        },
      },
      include: {
        guardians: true,
        family: true,
        scholarships: true,
      },
    });

    return NextResponse.json({ student: updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 