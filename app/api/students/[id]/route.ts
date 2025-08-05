import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

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

    // For mock data, just return the updated data
    const updated = {
      studentId: id,
      ...student,
      guardians: guardians || [],
      family: familyInfo || null,
      scholarships: scholarships || [],
      updatedAt: new Date()
    };

    return NextResponse.json({ student: updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 