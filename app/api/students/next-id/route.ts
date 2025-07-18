import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const last = await prisma.student.findFirst({
    orderBy: { id: 'desc' },
    select: { studentId: true },
  });
  let nextId = 1;
  if (last && last.studentId) {
    const num = parseInt(last.studentId.replace(/\D/g, '')) || 0;
    nextId = num + 1;
  }
  return NextResponse.json({ nextStudentId: `S${String(nextId).padStart(3, '0')}` });
}