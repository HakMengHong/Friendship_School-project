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
      schoolYear: student.schoolYear, // Add school year field
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
      where: { studentId: id },
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
            firstName: guardian.firstName,
            lastName: guardian.lastName,
            relation: guardian.relation,
            phone: guardian.phone,
            occupation: guardian.occupation,
            income: guardian.income && guardian.income !== '' ? parseFloat(guardian.income) : null,
            childrenCount: guardian.childrenCount && guardian.childrenCount !== '' ? parseInt(guardian.childrenCount) : null,
            houseNumber: guardian.houseNumber,
            village: guardian.village,
            district: guardian.district,
            province: guardian.province,
            birthDistrict: guardian.birthDistrict,
            believeJesus: guardian.believeJesus || false,
            church: guardian.church,
            studentId: id
          }
        });
      }
    }

    // Update family info if provided
    if (familyInfo) {
      const familyData = {
        livingWith: familyInfo.livingWith,
        livingCondition: familyInfo.livingCondition,
        ownHouse: familyInfo.ownHouse || false,
        canHelpSchool: familyInfo.canHelpSchool || false,
        helpAmount: familyInfo.helpAmount && familyInfo.helpAmount !== '' ? parseFloat(familyInfo.helpAmount) : null,
        helpFrequency: familyInfo.helpFrequency,
        knowSchool: familyInfo.knowSchool,
        religion: familyInfo.religion,
        churchName: familyInfo.churchName,
        durationInKPC: familyInfo.durationInKPC,
        organizationHelp: familyInfo.organizationHelp
      };

      await prisma.familyInfo.upsert({
        where: { studentId: id },
        update: familyData,
        create: {
          ...familyData,
          studentId: id
        }
      });
    }

    // Update scholarships if provided
    if (scholarships && scholarships.length > 0) {
      // Delete existing scholarships for this student
      await prisma.scholarship.deleteMany({
        where: { studentId: id }
      });

      // Create new scholarships
      for (const scholarship of scholarships) {
        await prisma.scholarship.create({
          data: {
            type: scholarship.type,
            amount: scholarship.amount && scholarship.amount !== '' ? parseFloat(scholarship.amount) : null,
            sponsor: scholarship.sponsor,
            studentId: id
          }
        });
      }
    }

    // Get updated student with all relations
    const finalStudent = await prisma.student.findUnique({
      where: { studentId: id },
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