import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pdfManager } from '@/lib/pdf-generators/core/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/core/types'
import { logActivity, ActivityMessages } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const { studentId, userId } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Fetch student data with related information
    const student = await prisma.student.findUnique({
      where: { studentId: parseInt(studentId) },
      include: {
        guardians: true,
        family: true,
        enrollments: {
          include: {
            course: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Prepare student registration data
    const studentRegistrationData = {
      studentId: student.studentId.toString(),
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      dob: student.dob.toISOString().split('T')[0],
      age: (student as any).age?.toString() || '',
      class: student.class,
      phone: student.phone || '',
      emergencyContact: student.emergencyContact || '',
      studentHouseNumber: student.studentHouseNumber || '',
      studentVillage: student.studentVillage || '',
      studentDistrict: student.studentDistrict || '',
      studentProvince: student.studentProvince || '',
      studentBirthDistrict: student.studentBirthDistrict || '',
      previousSchool: student.previousSchool || '',
      transferReason: student.transferReason || '',
      vaccinated: student.vaccinated || false,
      schoolYear: student.schoolYear || '2024-2025',
      needsClothes: student.needsClothes || false,
      needsMaterials: student.needsMaterials || false,
      needsTransport: student.needsTransport || false,
      registrationDate: student.registrationDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      status: student.status || 'active',
      religion: student.religion || '',
      health: student.health || '',
      guardians: (student.guardians || []).map(guardian => ({
        firstName: guardian.firstName || '',
        lastName: guardian.lastName || '',
        relation: guardian.relation || '',
        phone: guardian.phone || '',
        occupation: guardian.occupation || '',
        income: guardian.income || '',
        childrenCount: guardian.childrenCount?.toString() || '',
        houseNumber: guardian.houseNumber || '',
        village: guardian.village || '',
        district: guardian.district || '',
        province: guardian.province || '',
        birthDistrict: guardian.birthDistrict || '',
        believeJesus: guardian.believeJesus || false,
        church: guardian.church || ''
      })),
      familyInfo: {
        livingWith: student.family?.livingWith || '',
        ownHouse: student.family?.ownHouse || false,
        durationInKPC: student.family?.durationInKPC || '',
        livingCondition: student.family?.livingCondition || '',
        religion: student.family?.religion || '',
        churchName: student.family?.churchName || '',
        helpAmount: student.family?.helpAmount || '',
        helpFrequency: student.family?.helpFrequency || '',
        knowSchool: student.family?.knowSchool || '',
        organizationHelp: student.family?.organizationHelp || '',
        childrenInCare: (student.family as any)?.childrenInCare || ''
      },
      generatedAt: new Date().toISOString()
    }

    // Generate PDF
    const result = await pdfManager.generatePDF(ReportType.STUDENT_REGISTRATION, studentRegistrationData)

    // Create safe filename for download
    const safeFilename = `student-registration-${studentId}-${student.firstName}-${student.lastName}.pdf`
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens

    // Log activity
    if (userId) {
      await logActivity(
        userId,
        ActivityMessages.GENERATE_REGISTRATION_FORM,
        `បង្កើតទម្រង់ចុះឈ្មោះសិស្ស ${student.lastName} ${student.firstName}`
      )
    }

    // Stream PDF directly to client
    return new NextResponse(result.buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': result.buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error generating student registration PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate student registration PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
