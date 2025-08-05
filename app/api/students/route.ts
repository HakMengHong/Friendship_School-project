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

    // Prepare student data with proper field mapping
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
      status: student.status || 'active'
    };

    // Prepare guardians data with proper field mapping
    const guardiansData = (guardians || []).map(guardian => ({
      firstName: guardian.firstName,
      lastName: guardian.lastName,
      relation: guardian.relation,
      phone: guardian.phone,
      occupation: guardian.occupation,
      income: guardian.income ? parseFloat(guardian.income) : null,
      childrenCount: guardian.childrenCount ? parseInt(guardian.childrenCount) : null,
      houseNumber: guardian.houseNumber,
      village: guardian.village,
      district: guardian.district,
      province: guardian.province,
      birthDistrict: guardian.birthDistrict,
      believeJesus: guardian.believeJesus || false,
      church: guardian.church
    }));

    // Prepare family info data with proper field mapping
    const familyData = familyInfo ? {
      livingWith: familyInfo.livingWith,
      ownHouse: familyInfo.ownHouse || false,
      durationInKPC: familyInfo.durationInKPC,
      livingCondition: familyInfo.livingCondition,
      organizationHelp: familyInfo.organizationHelp,
      knowSchool: familyInfo.knowSchool,
      religion: familyInfo.religion,
      churchName: familyInfo.churchName,
      canHelpSchool: familyInfo.canHelpSchool || false,
      helpAmount: familyInfo.helpAmount ? parseFloat(familyInfo.helpAmount) : null,
      helpFrequency: familyInfo.helpFrequency
    } : undefined;

    const created = await prisma.student.create({
      data: {
        ...studentData,
        guardians: {
          create: guardiansData,
        },
        family: familyData ? { create: familyData } : undefined,
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
    console.error('Error creating student:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 