import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all students with complete data
export async function GET(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
            include: {
              guardians: true,
              family: true,
              scholarships: true,
              enrollments: {
                include: {
                  course: true,
                  dropSemester: true
                }
              } as any
            }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new student with guardians and family info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student, guardians, familyInfo } = body

    // Validate required fields
    if (!student || !student.firstName || !student.lastName || !student.gender || !student.dob || !student.class) {
      return NextResponse.json(
        { error: 'Missing required student fields' },
        { status: 400 }
      )
    }

    // Create student with related data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the student
      const newStudent = await tx.student.create({
        data: {
          lastName: student.lastName,
          firstName: student.firstName,
          gender: student.gender,
          dob: new Date(student.dob),
          class: student.class,
          schoolYear: student.schoolYear || '2024-2025',
          registerToStudy: student.registerToStudy || false,
          studentHouseNumber: student.studentHouseNumber || null,
          studentVillage: student.studentVillage || null,
          studentDistrict: student.studentDistrict || null,
          studentProvince: student.studentProvince || null,
          studentBirthDistrict: student.studentBirthDistrict || null,
          phone: student.phone || null,
          religion: student.religion || null,
          health: student.health || null,
          emergencyContact: student.emergencyContact || null,
          vaccinated: student.vaccinated || false,
          previousSchool: student.previousSchool || null,
          transferReason: student.transferReason || null,
          needsClothes: student.needsClothes || false,
          needsMaterials: student.needsMaterials || false,
          needsTransport: student.needsTransport || false,
          registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date(),
          status: student.status || 'active',
          ...(student.studentCommune && { studentCommune: student.studentCommune })
        } as any
      })

      // Create guardians if provided
      if (guardians && guardians.length > 0) {
        await tx.guardian.createMany({
          data: guardians.map((guardian: any) => ({
            studentId: newStudent.studentId,
            firstName: guardian.firstName || null,
            lastName: guardian.lastName || null,
            relation: guardian.relation || null,
            phone: guardian.phone || null,
            occupation: guardian.occupation || null,
            income: guardian.income ? parseFloat(guardian.income) : null,
            childrenCount: guardian.childrenCount ? parseInt(guardian.childrenCount) : null,
            believeJesus: guardian.believeJesus === 'yes' || guardian.believeJesus === true,
            church: guardian.church || null,
            houseNumber: guardian.houseNumber || null,
            village: guardian.village || null,
            commune: guardian.commune || null,
            district: guardian.district || null,
            province: guardian.province || null,
            birthDistrict: guardian.birthDistrict || null
          }))
        })
      }

      // Create family info if provided
      if (familyInfo) {
        await tx.familyInfo.create({
          data: {
            studentId: newStudent.studentId,
            livingWith: familyInfo.livingWith || null,
            ownHouse: familyInfo.ownHouse === 'own' || familyInfo.ownHouse === true,
            durationInKPC: familyInfo.durationInKPC || null,
            livingCondition: familyInfo.livingCondition || null,
            organizationHelp: familyInfo.organizationHelp || null,
            knowSchool: familyInfo.knowSchool || null,
            religion: familyInfo.religion || null,
            churchName: familyInfo.churchName || null,
            canHelpSchool: familyInfo.canHelpSchool || false,
            helpAmount: familyInfo.helpAmount ? parseFloat(familyInfo.helpAmount) : null,
            helpFrequency: familyInfo.helpFrequency || null,
            ...(familyInfo.povertyCard && { povertyCard: familyInfo.povertyCard })
          } as any
        })
      }

      // Return the created student with all related data
      return await tx.student.findUnique({
        where: { studentId: newStudent.studentId },
        include: {
          guardians: true,
          family: true,
          scholarships: true
        }
      })
    })

    return NextResponse.json({ student: result }, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}