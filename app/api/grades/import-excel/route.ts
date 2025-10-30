import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import ExcelJS from 'exceljs'
import { logActivity, ActivityMessages } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const courseId = formData.get('courseId') as string
    const semesterId = formData.get('semesterId') as string
    const schoolYearId = formData.get('schoolYearId') as string
    const userId = formData.get('userId') as string

    if (!file || !courseId || !semesterId || !schoolYearId) {
      return NextResponse.json(
        { error: 'បាត់ប៉ារ៉ាម៉ែត្រចាំបាច់: ឯកសារ, ថ្នាក់, សម័យ, ឆ្នាំសិក្សា' },
        { status: 400 }
      )
    }

    console.log('👤 User ID from request:', userId)

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'ប្រភេទឯកសារមិនត្រឹមត្រូវ។ សូមផ្ទុកឯកសារ Excel (.xlsx ឬ .xls)' },
        { status: 400 }
      )
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    // Get all worksheets (first is instructions, rest are subject templates)
    const worksheetNames = workbook.worksheets.map(ws => ws.name)
    console.log('📋 Available worksheets:', worksheetNames)
    
    if (workbook.worksheets.length < 2) {
      return NextResponse.json(
        { error: 'ឯកសារ Excel ត្រូវមានយ៉ាងហោចណាស់ 2 វគ្គ (ការណែនាំ + គំរូមុខវិជ្ជា)' },
        { status: 400 }
      )
    }
    
    // Get all subject worksheets (skip the first one which is instructions)
    const subjectSheets = workbook.worksheets.slice(1) // Skip instructions sheet
    console.log(`📊 Processing ${subjectSheets.length} subject worksheets:`, subjectSheets.map(ws => ws.name))

    // Get subjects for this course
    const subjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    })

    // Get course details
    const course = await prisma.course.findUnique({
      where: { courseId: parseInt(courseId) },
      include: {
        enrollments: {
          include: {
            student: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'រកមិនឃើញថ្នាក់' }, { status: 404 })
    }

    // No need for student map since we're using IDs directly from the Excel file

    // Parse Excel data for all subjects
    const gradesToCreate: any[] = []
    const gradesToUpdate: any[] = []
    const errors: string[] = []

    console.log(`📊 Found ${course.enrollments.length} students in course`)
    console.log(`📊 Course details: ${course.courseName} (ID: ${course.courseId})`)
    console.log(`👤 Importing user ID: ${userId}`)

    // Process each subject worksheet
    for (const gradesSheet of subjectSheets) {
      const subjectName = gradesSheet.name
      console.log(`📊 Processing worksheet: "${subjectName}"`)
      console.log(`📊 Subject name length: ${subjectName.length} characters`)
      console.log(`📊 Subject name bytes: ${Buffer.from(subjectName, 'utf8').length}`)
      
      // Try exact match first
      let subject = await prisma.subject.findFirst({
        where: { subjectName: subjectName }
      })
      
      // If exact match fails, try trimming whitespace
      if (!subject) {
        const trimmedName = subjectName.trim()
        console.log(`🔄 Trying trimmed name: "${trimmedName}"`)
        subject = await prisma.subject.findFirst({
          where: { subjectName: trimmedName }
        })
      }
      
      // If still no match, try case-insensitive search
      if (!subject) {
        console.log(`🔄 Trying case-insensitive search for: "${subjectName}"`)
        subject = await prisma.subject.findFirst({
          where: { 
            subjectName: {
              equals: subjectName,
              mode: 'insensitive'
            }
          }
        })
      }

      if (!subject) {
        console.log(`⚠️ Subject "${subjectName}" not found in database, skipping worksheet`)
        console.log(`⚠️ Available subjects in database:`)
        const allSubjects = await prisma.subject.findMany({
          select: { subjectName: true, subjectId: true }
        })
        allSubjects.forEach(s => console.log(`   - "${s.subjectName}" (ID: ${s.subjectId})`))
        errors.push(`Subject "${subjectName}" not found in database`)
        continue
      }

      console.log(`📊 Processing grades for subject: ${subject.subjectName} (ID: ${subject.subjectId})`)

      // Start from row 7 (skip headers and course info)
      for (let rowIndex = 7; rowIndex <= gradesSheet.rowCount; rowIndex++) {
        const row = gradesSheet.getRow(rowIndex)
        const studentName = row.getCell(2).value?.toString()?.trim()
        
        if (!studentName) continue // Skip empty rows

        // Get IDs from hidden columns (L, M, N, O, P, Q, R)
        const studentId = row.getCell(12).value // Column L (StudentID)
        const subjectId = row.getCell(13).value // Column M (SubjectID) 
        const courseId = row.getCell(14).value // Column N (CourseID)
        const semesterId = row.getCell(15).value // Column O (SemesterID)
        const schoolYearId = row.getCell(16).value // Column P (SchoolYearID)
        const month = row.getCell(17).value // Column Q (Month)
        const year = row.getCell(18).value // Column R (Year)

        // Validate IDs
        if (!studentId || !subjectId || !courseId || !semesterId || !schoolYearId || !month || !year) {
          errors.push(`Missing ID data for student: ${studentName}`)
          continue
        }

        // Get monthly total (column J) and notes (column K)
        const monthlyTotalValue = row.getCell(10).value // Column J (សរុបពិន្ទុប្រចាំខែ)
        const notes = row.getCell(11).value?.toString() || '' // Column K (សេចក្តីណែនាំផ្សេងៗ)

        console.log(`🔍 Processing row ${rowIndex}: ${studentName}`)
        console.log(`   Monthly Total Value: ${monthlyTotalValue} (type: ${typeof monthlyTotalValue})`)
        if (typeof monthlyTotalValue === 'object' && monthlyTotalValue !== null) {
          console.log(`   Formula Object Keys:`, Object.keys(monthlyTotalValue))
          console.log(`   Formula Object Values:`, Object.values(monthlyTotalValue))
        }
        console.log(`   Notes: ${notes}`)

        // Handle both formula results and direct values
        let gradeValue = null
        let grade = null
        
        if (monthlyTotalValue !== null && monthlyTotalValue !== undefined && monthlyTotalValue !== '') {
          // If it's a formula result object, try to get the calculated value
          if (typeof monthlyTotalValue === 'object' && monthlyTotalValue !== null) {
            // Try different properties that might contain the result
            if ('result' in monthlyTotalValue) {
              gradeValue = (monthlyTotalValue as any).result
            } else if ('value' in monthlyTotalValue) {
              gradeValue = (monthlyTotalValue as any).value
            } else if ('text' in monthlyTotalValue) {
              gradeValue = (monthlyTotalValue as any).text
            } else {
              // If it's an object but we can't extract a value, try to stringify it
              console.log(`⚠️ Unknown formula object structure for ${studentName}:`, Object.keys(monthlyTotalValue))
              gradeValue = monthlyTotalValue.toString()
            }
          } else {
            gradeValue = monthlyTotalValue
          }
          
          grade = parseFloat(gradeValue.toString())
          
          if (isNaN(grade) || grade < 0 || grade > 100) {
            console.log(`❌ Invalid grade for ${studentName}: ${gradeValue} (parsed: ${grade})`)
            // If it's a formula object that couldn't be parsed, try to default to 0
            if (typeof monthlyTotalValue === 'object' && monthlyTotalValue !== null) {
              console.log(`🔄 Formula object couldn't be parsed, defaulting to grade 0 for ${studentName}`)
              gradeValue = 0
              grade = 0
            } else {
              errors.push(`Invalid grade for ${studentName}: ${gradeValue}`)
              continue
            }
          }
          console.log(`📝 Processing grade for student ${studentName} (ID: ${studentId}): ${grade}`)
        } else if (monthlyTotalValue !== null && monthlyTotalValue !== undefined && 
                   (monthlyTotalValue.toString() === '0' || parseFloat(monthlyTotalValue.toString()) === 0)) {
          // Explicitly handle grade 0 as a valid value
          gradeValue = 0
          grade = 0
          console.log(`📝 Processing grade 0 for student ${studentName} (ID: ${studentId})`)
        } else {
          // Handle null/empty cells by defaulting to grade 0
          gradeValue = 0
          grade = 0
          console.log(`📝 Processing null/empty cell (${monthlyTotalValue}) as grade 0 for student ${studentName} (ID: ${studentId})`)
        }

        console.log(`📝 Processing grade for student ${studentName} (ID: ${studentId}): ${grade}`)

        // Format gradeDate using the month and year from Excel file
        const monthStr = String(month).padStart(2, '0')
        const yearStr = String(year).slice(-2)
        const formattedGradeDate = `${monthStr}/${yearStr}`

        // Check if grade already exists for the same student, course, subject, semester, and date
        const existingGrade = await prisma.grade.findFirst({
          where: {
            studentId: parseInt(studentId.toString()),
            courseId: parseInt(courseId.toString()),
            subjectId: parseInt(subjectId.toString()),
            semesterId: parseInt(semesterId.toString()),
            gradeDate: formattedGradeDate // Include date to prevent cross-month updates
          },
          select: { gradeId: true } // Only select what we need
        })

        const gradeData = {
          studentId: parseInt(studentId.toString()),
          courseId: parseInt(courseId.toString()),
          subjectId: parseInt(subjectId.toString()),
          semesterId: parseInt(semesterId.toString()),
          gradeDate: formattedGradeDate,
          grade: grade,
          gradeComment: notes || null,
          userId: userId ? parseInt(userId) : null // Use the user ID from the request
        }

        if (existingGrade) {
          console.log(`🔄 Updating existing grade for student ${studentName} (ID: ${studentId}) for ${formattedGradeDate}`)
          gradesToUpdate.push({
            where: { gradeId: existingGrade.gradeId },
            data: gradeData
          })
        } else {
          console.log(`➕ Creating new grade for student ${studentName} (ID: ${studentId}) for ${formattedGradeDate}`)
          gradesToCreate.push(gradeData)
        }
      }
    }

    // Execute database operations using the same structure as manual grade entry
    const results = {
      created: 0,
      updated: 0,
      errors: errors.length
    }

    // Create new grades using the same API structure
    for (const gradeData of gradesToCreate) {
      try {
        console.log(`📝 Creating grade for student ${gradeData.studentId}: ${gradeData.grade} by user ${gradeData.userId}`)
        const createdGrade =         await prisma.grade.create({
          data: {
            studentId: gradeData.studentId,
            subjectId: gradeData.subjectId,
            semesterId: gradeData.semesterId,
            courseId: gradeData.courseId,
            gradeDate: gradeData.gradeDate,
            grade: gradeData.grade,
            gradeComment: gradeData.gradeComment,
            userId: gradeData.userId
          }
        })
        console.log(`✅ Grade created successfully: ${createdGrade.gradeId}`)
        results.created++
      } catch (error) {
        console.error('❌ Error creating grade:', error)
        errors.push(`Failed to create grade for student ${gradeData.studentId}: ${error}`)
      }
    }

    // Update existing grades using the same API structure
    for (const updateData of gradesToUpdate) {
      try {
        console.log(`📝 Updating grade for student ${updateData.data.studentId}: ${updateData.data.grade} by user ${updateData.data.userId}`)
        const updatedGrade = await prisma.grade.update({
          where: { gradeId: updateData.where.gradeId },
          data: {
            grade: updateData.data.grade,
            gradeComment: updateData.data.gradeComment,
            gradeDate: updateData.data.gradeDate,
            userId: updateData.data.userId
          }
        })
        console.log(`✅ Grade updated successfully: ${updatedGrade.gradeId}`)
        results.updated++
      } catch (error) {
        console.error('❌ Error updating grade:', error)
        errors.push(`Failed to update grade for student ${updateData.data.studentId}: ${error}`)
      }
    }

    // Add summary of processed subjects
    const processedSubjects = subjectSheets.map(ws => ws.name).filter(name => 
      !errors.some(error => error.includes(`Subject "${name}" not found`))
    )
    
    console.log(`✅ Successfully processed subjects: ${processedSubjects.join(', ')}`)
    console.log(`📊 Final results: Created ${results.created} grades, Updated ${results.updated} grades, ${results.errors} errors`)

    // Log activity
    if (userId) {
      await logActivity(
        parseInt(userId),
        ActivityMessages.IMPORT_GRADES,
        `នាំចូលពិន្ទុពី Excel - ${results.created + results.updated} ពិន្ទុ (${processedSubjects.join(', ')})`
      )
    }

    return NextResponse.json({
      success: true,
      message: `ជោគជ័យក្នុងការនាំចូលពិន្ទុសម្រាប់មុខវិជ្ជា: ${processedSubjects.join(', ')}. បានបង្កើត: ${results.created} ពិន្ទុថ្មី, បានធ្វើបច្ចុប្បន្នភាព: ${results.updated} ពិន្ទុដែលមាន, កំហុស: ${results.errors}`,
      results,
      processedSubjects,
      errors: errors.slice(0, 10) // Return first 10 errors
    })

  } catch (error) {
    console.error('Error importing grades from Excel:', error)
    return NextResponse.json(
      { error: 'មិនអាចនាំចូលពិន្ទុពី Excel បានទេ' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
