import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, context: any) {
  const { params } = await context;
  try {
    const id = parseInt(params.id as string);
    const data = await request.json();
    const {
      student,        // { firstName, lastName, ... }
      guardians,      // [{ name, relation, ... }]
      familyInfo,     // { fatherName, ... }
      scholarships,   // [{ type, amount, ... }]
    } = data;

    // Update student in database with proper field mapping
    const studentData = {
      lastName: student.lastName,
      firstName: student.firstName,
      gender: student.gender,
      dob: student.dob ? new Date(student.dob) : new Date(),
      class: student.class,
      registerToStudy: student.registerToStudy || false,
      studentHouseNumber: student.studentHouseNumber,
      studentVillage: student.studentVillage,
      studentDistrict: student.studentDistrict,
      studentProvince: student.studentProvince,
      studentBirthDistrict: student.studentBirthDistrict,
      phone: student.phone,
      religion: student.religion,
      health: student.health,
      emergencyContact: student.emergencyContact,
      vaccinated: student.vaccinated || false,
      previousSchool: student.previousSchool,
      transferReason: student.transferReason,
      needsClothes: student.needsClothes || false,
      needsMaterials: student.needsMaterials || false,
      needsTransport: student.needsTransport || false,
      registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date(),
      status: student.status || 'active',
      updatedAt: new Date()
    };

    // Update the student
    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: studentData,
      include: {
        guardians: true,
        family: true,
        scholarships: true
      }
    });

    // Update guardians if provided
    if (guardians && guardians.length > 0) {
      // Delete existing guardians for this student
      await prisma.guardian.deleteMany({
        where: { studentId: id }
      });

      // Create new guardians
      for (const guardian of guardians) {
        await prisma.guardian.create({
          data: {
            ...guardian,
            studentId: id
          }
        });
      }
    }

    // Update family info if provided
    if (familyInfo) {
      await prisma.familyInfo.upsert({
        where: { studentId: id },
        update: familyInfo,
        create: {
          ...familyInfo,
          studentId: id
        }
      });
    }

    // Get updated student with all relations
    const finalStudent = await prisma.student.findUnique({
      where: { id: id },
      include: {
        guardians: true,
        family: true,
        scholarships: true
      }
    });

    return NextResponse.json({ student: finalStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 