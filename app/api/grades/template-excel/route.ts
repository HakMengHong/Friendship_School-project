import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Fallback Template Excel API called')
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const semesterId = searchParams.get('semesterId')
    const schoolYearId = searchParams.get('schoolYearId')
    const subjectIds = searchParams.get('subjectIds') // Changed from subjectId to subjectIds

    console.log('📋 Parameters:', { courseId, semesterId, schoolYearId, subjectIds })

    if (!courseId || !semesterId || !schoolYearId || !subjectIds) {
      console.error('❌ Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameters: courseId, semesterId, schoolYearId, subjectIds' },
        { status: 400 }
      )
    }

    // Parse subject IDs from comma-separated string
    const subjectIdArray = subjectIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    
    if (subjectIdArray.length === 0) {
      console.error('❌ No valid subject IDs provided')
      return NextResponse.json(
        { error: 'No valid subject IDs provided' },
        { status: 400 }
      )
    }

    console.log('📊 Creating Excel workbook...')
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    
    // Add metadata
    workbook.creator = 'Friendship School System'
    workbook.lastModifiedBy = 'Admin'
    workbook.created = new Date()
    workbook.modified = new Date()
    
    // Set workbook view options for full screen, no headings, no gridlines, no formula bar
    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 10000,
        firstSheet: 0,
        activeTab: 0,
        visibility: 'visible'
      }
    ]
    
    // Set workbook properties for full screen experience
    // Note: ExcelJS has limited support for workbook properties
    // The main full screen settings are in the worksheet views

    console.log('📋 Creating worksheet...')
    
    // Fetch real data from database first
    console.log('👥 Fetching real data from database...')
    
    const [course, schoolYear, semester, subjects, students] = await Promise.all([
      prisma.course.findUnique({
        where: { courseId: parseInt(courseId) },
        include: { schoolYear: true }
      }),
      prisma.schoolYear.findUnique({
        where: { schoolYearId: parseInt(schoolYearId) }
      }),
      prisma.semester.findUnique({
        where: { semesterId: parseInt(semesterId) }
      }),
      prisma.subject.findMany({
        where: { subjectId: { in: subjectIdArray } }
      }),
      prisma.student.findMany({
        where: {
          enrollments: {
            some: {
              courseId: parseInt(courseId),
              drop: false
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      })
    ])

    console.log('📊 Fetched data:', {
      course: course?.courseName,
      schoolYear: schoolYear?.schoolYearCode,
      semester: semester?.semester,
      subjectsCount: subjects.length,
      studentsCount: students.length
    })

    // Validate that we have all required data with better error messages
    if (!course) {
      console.error(`❌ Course with ID ${courseId} not found`)
      return NextResponse.json(
        { error: `Course with ID ${courseId} not found. Please check if the course exists.` },
        { status: 404 }
      )
    }
    if (subjects.length === 0) {
      console.error(`❌ No subjects found for IDs: ${subjectIdArray.join(', ')}`)
      return NextResponse.json(
        { error: `No subjects found for the provided IDs. Please check if the subjects exist.` },
        { status: 404 }
      )
    }
    if (students.length === 0) {
      console.error(`❌ No enrolled students found for course ${course.courseName}`)
      return NextResponse.json(
        { error: `No enrolled students found for course ${course.courseName}. Please check if students are enrolled in this course.` },
        { status: 404 }
      )
    }

    // Get current month as number and year
    const currentMonth = new Date().getMonth() + 1 // 1-12
    const currentYear = new Date().getFullYear()
    
    // Create Instructions sheet first
    const instructionsSheet = workbook.addWorksheet('ការណែនាំ')
    
    // Set instructions sheet properties
    instructionsSheet.properties = {
      defaultRowHeight: 35,
      defaultColWidth: 10,
      tabColor: { argb: 'FFFFFFFF' },
      outlineLevelCol: 0,
      outlineLevelRow: 0,
      outlineProperties: { summaryBelow: true, summaryRight: true },
      dyDescent: 0,
      showGridLines: false
    }
    
    // Hide gridlines, headings, and formula bar for instructions sheet
    instructionsSheet.views = [
      {
        state: 'normal',
        zoomScale: 100,
        zoomScaleNormal: 100,
        showGridLines: false, // Hide gridlines
        showRowColHeaders: false, // Hide row/column headers
        rightToLeft: false
      }
    ]
    
    // Create worksheets for each subject
    const subjectSheets = subjects.map(subject => {
      const subjectName = subject.subjectName || `មុខវិជ្ជាទី ${subject.subjectId}`
      return {
        subject,
        worksheet: workbook.addWorksheet(subjectName)
      }
    })
    
    // Add logo based on grade level to all subject sheets
    console.log('🖼️ Adding logo based on grade level...')
    try {
      let logoPath = ''
      const gradeNumber = parseInt(course?.grade || '0')
      
      if (gradeNumber >= 1 && gradeNumber <= 6) {
        logoPath = path.join(process.cwd(), 'public', "Friendship Primary School's Logo.png")
      } else if (gradeNumber >= 7 && gradeNumber <= 9) {
        logoPath = path.join(process.cwd(), 'public', "Friendship High School's Logo.png")
      } else {
        logoPath = path.join(process.cwd(), 'public', 'logo.png')
      }
      
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath)
        const imageId = workbook.addImage({
          base64: logoBuffer.toString('base64'),
          extension: 'png'
        })
        
        // Add logo to all subject sheets
        subjectSheets.forEach(({ worksheet }) => {
          worksheet.addImage(imageId, 'A1:B3')
        })
        
        console.log('✅ Logo added successfully to all sheets')
      } else {
        console.log('⚠️ Logo file not found:', logoPath)
      }
    } catch (error) {
      console.log('❌ Error adding logo:', error)
    }
    
    // Set worksheet properties for all subject sheets
    subjectSheets.forEach(({ worksheet }) => {
      worksheet.properties = {
        defaultRowHeight: 35,
        defaultColWidth: 10,
        tabColor: { argb: 'FFFFFFFF' },
        outlineLevelCol: 0,
        outlineLevelRow: 0,
        outlineProperties: { summaryBelow: true, summaryRight: true },
        dyDescent: 0,
        showGridLines: false
      }
      
      // Hide gridlines, headings, and formula bar with full screen settings
      worksheet.views = [
        {
          state: 'frozen',
          ySplit: 6, // Freeze first 6 rows
          topLeftCell: 'A7', // Start from row 7
          zoomScale: 100, // Normal zoom
          zoomScaleNormal: 100,
          showGridLines: false, // Hide gridlines
          showRowColHeaders: false, // Hide row/column headers
          rightToLeft: false
        }
      ]
    })
    
    // Define columns matching Book1.xlsx structure with hidden ID columns
    const columns = [
      { header: '', key: 'rowNumber', width: 6 },
      { header: 'ឈ្មោះ', key: 'studentName', width: 20 },
      { header: 'ភេទ', key: 'gender', width: 6 },
      { header: 'កិច្ចការផ្ទះ 1', key: 'homework1', width: 6 },
      { header: 'កិច្ចការផ្ទះ 2', key: 'homework2', width: 6 },
      { header: 'កិច្ចការផ្ទះ 3', key: 'homework3', width: 6 },
      { header: 'កិច្ចការផ្ទះ 4', key: 'homework4', width: 6 },
      { header: 'កិច្ចការផ្ទះសរុប', key: 'homeworkTotal', width: 10 },
      { header: 'វិញ្ញាសា', key: 'exam', width: 10 },
      { header: 'សរុបពិន្ទុប្រចាំខែ', key: 'monthlyTotal', width: 10 },
      { header: 'សេចក្តីណែនាំផ្សេងៗ', key: 'notes', width: 40 },
      // Hidden ID columns for import process
      { header: 'StudentID', key: 'studentId', width: 0 }, // Hidden column
      { header: 'SubjectID', key: 'subjectId', width: 0 }, // Hidden column
      { header: 'CourseID', key: 'courseId', width: 0 }, // Hidden column
      { header: 'SemesterID', key: 'semesterId', width: 0 }, // Hidden column
      { header: 'SchoolYearID', key: 'schoolYearId', width: 0 }, // Hidden column
      { header: 'Month', key: 'month', width: 0 }, // Hidden column
      { header: 'Year', key: 'year', width: 0 } // Hidden column
    ]

    // Set columns for all subject sheets
    subjectSheets.forEach(({ worksheet }) => {
      worksheet.columns = columns
    })

    console.log('🎨 Styling header rows for all sheets...')
    
    // Style the header row for all subject sheets
    subjectSheets.forEach(({ worksheet }) => {
      const headerRow = worksheet.getRow(1)
      headerRow.font = { 
        size: 14,
        name: 'Khmer MEF2'
      }
      headerRow.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      }
      headerRow.height = 30
    })

    console.log('📝 Adding header information to all sheets...')
    
    // Add header information for each subject sheet
    subjectSheets.forEach(({ worksheet, subject }) => {
      // Row 1: Title (merged across all columns)
      worksheet.mergeCells('A1:K1')
      worksheet.getCell('A1').value = `ពិន្ទុ${subject.subjectName} ខែ${currentMonth} ឆ្នាំ${currentYear}`
      worksheet.getCell('A1').font = { 
        size: 19, 
        name: 'Khmer MEF2',
        color: { argb: 'FF000000' }
      }
      worksheet.getCell('A1').alignment = { 
        horizontal: 'center', 
        vertical: 'middle',
        wrapText: true
      }
      // No fill color
      // No border for title row
      // Row 1 height = Row 2 height + Row 3 height
      const row2Height = 32
      const row3Height = 32
      const row1Height = row2Height + row3Height // 80px
      worksheet.getRow(1).height = row1Height
    })
    
    // Add Row 2: Year and semester info for all subject sheets
    subjectSheets.forEach(({ worksheet }) => {
      const row2Height = 32
      worksheet.getRow(2).height = row2Height
      worksheet.mergeCells('C2:D2')
      worksheet.getCell('C2').value = 'ឆ្នាំ :'
      worksheet.getCell('C2').font = { name: 'Khmer OS Siemreap', size: 11 }
      worksheet.getCell('C2').alignment = { horizontal: 'right', vertical: 'middle', wrapText: true }
      worksheet.getCell('C2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      // No border for yellow fill cells
      worksheet.mergeCells('E2:G2')
      worksheet.getCell('E2').value = currentYear
      worksheet.getCell('E2').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('E2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('E2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      // No border for yellow fill cells
      worksheet.getCell('H2').value = 'ឆមាស :'
      worksheet.getCell('H2').font = { name: 'Khmer OS Siemreap', size: 11 }
      worksheet.getCell('H2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      worksheet.getCell('H2').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
      // No border for yellow fill cells
      // Extract number from semester (e.g., "ឆមាសទី១" -> "1")
      const semesterNumber = semester?.semester?.replace(/[^\d]/g, '') || semesterId
      worksheet.getCell('I2').value = semesterNumber
      worksheet.getCell('I2').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('I2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('I2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      // No border for yellow fill cells
      worksheet.getCell('J2').value = 'ឆ្នាំសិក្សា :'
      worksheet.getCell('J2').font = { name: 'Khmer OS Siemreap', size: 11 }
      worksheet.getCell('J2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      worksheet.getCell('J2').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
      // No border for yellow fill cells
      worksheet.getCell('K2').value = schoolYear?.schoolYearCode || schoolYearId
      worksheet.getCell('K2').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('K2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('K2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      // No border for yellow fill cells
    })
    
    // Add Row 3: Month, subject and class info for all subject sheets
    subjectSheets.forEach(({ worksheet, subject }) => {
      const row3Height = 32
      worksheet.getRow(3).height = row3Height
      worksheet.mergeCells('C3:D3')
      worksheet.getCell('C3').value = 'ខែ :'
      worksheet.getCell('C3').font = { name: 'Khmer OS Siemreap', size: 11 }
      worksheet.getCell('C3').alignment = { horizontal: 'right', vertical: 'middle', wrapText: true }
      worksheet.getCell('C3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      // No border for yellow fill cells
      worksheet.mergeCells('E3:G3')
      worksheet.getCell('E3').value = currentMonth
      worksheet.getCell('E3').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('E3').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('E3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      // No border for yellow fill cells
      worksheet.getCell('H3').value = 'ថ្នាក់ទី :'
      worksheet.getCell('H3').font = { name: 'Khmer OS Siemreap', size: 11 }
      worksheet.getCell('H3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      worksheet.getCell('H3').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
      // No border for yellow fill cells
      // Format course to show "grade + section" like "1A", "2B", etc.
      const courseDisplay = course ? `${course.grade}${course.section}` : courseId
      worksheet.getCell('I3').value = courseDisplay
      worksheet.getCell('I3').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('I3').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('I3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      // No border for yellow fill cells
      worksheet.getCell('J3').value = 'មុខវិជ្ជា :'
      worksheet.getCell('J3').font = { name: 'Khmer OS Siemreap', size: 11 }
      worksheet.getCell('J3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      worksheet.getCell('J3').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
      // No border for yellow fill cells
      worksheet.getCell('K3').value = subject.subjectName
      worksheet.getCell('K3').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('K3').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('K3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
      // No border for yellow fill cells
    })

    console.log('📋 Adding column headers to all sheets...')
    
    // Add column headers for all subject sheets
    subjectSheets.forEach(({ worksheet }) => {
      // Add column headers matching Book1.xlsx structure (rows 4-6)
      // Row 4: Main headers with enhanced styling
      worksheet.getRow(4).height = 38
      worksheet.getRow(5).height = 32
      worksheet.getRow(6).height = 32
      
      // Add row number header
      worksheet.mergeCells('A4:A6')
      worksheet.getCell('A4').value = 'ល.រ'
      worksheet.getCell('A4').font = { name: 'Khmer MEF2', size: 12, color: { argb: 'FF000000' } }
      worksheet.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      // No fill color
      worksheet.getCell('A4').border = {
        top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
      }
      
      worksheet.mergeCells('B4:B6')
      worksheet.getCell('B4').value = 'ឈ្មោះ'
      worksheet.getCell('B4').font = { name: 'Khmer MEF2', size: 12, color: { argb: 'FF000000' } }
      worksheet.getCell('B4').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      // No fill color
      worksheet.getCell('B4').border = {
        top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
      }
      
      worksheet.mergeCells('C4:C6')
      worksheet.getCell('C4').value = 'ភេទ'
      worksheet.getCell('C4').font = { name: 'Khmer MEF2', size: 12, color: { argb: 'FF000000' } }
      worksheet.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      // No fill color
      worksheet.getCell('C4').border = {
        top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
      }
      
      worksheet.mergeCells('D4:G4')
      worksheet.getCell('D4').value = 'កិច្ចការផ្ទះ'
      worksheet.getCell('D4').font = { name: 'Khmer MEF2', size: 12, color: { argb: 'FF000000' } }
      worksheet.getCell('D4').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      // No fill color
      worksheet.getCell('D4').border = {
        top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
      }
      
      worksheet.getCell('H4').value = '0'
      worksheet.getCell('H4').font = { name: 'Khmer MEF2', size: 12, color: { argb: 'FF000000' }, bold: true }
      worksheet.getCell('H4').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('H4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF44B3E1' } }
      worksheet.getCell('H4').numFmt = '0' // Round to 2 decimal places
      worksheet.getCell('H4').border = {
        top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
      }
      
      worksheet.getCell('I4').value = { formula: '100-H4' } // Auto-calculate to ensure sum is 100
      worksheet.getCell('I4').font = { name: 'Khmer MEF2', size: 12, color: { argb: 'FF000000' }, bold: true }
      worksheet.getCell('I4').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('I4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF44B3E1' } }
      worksheet.getCell('I4').numFmt = '0' // Round to 2 decimal places
      worksheet.getCell('I4').border = {
        top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
      }
      
      worksheet.mergeCells('J4:J6')
      worksheet.getCell('J4').value = 'សរុបពិន្ទុប្រចាំខែ'
      worksheet.getCell('J4').font = { name: 'Khmer MEF2', size: 12, color: { argb: 'FF000000' } }
      worksheet.getCell('J4').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      // No fill color
      worksheet.getCell('J4').border = {
        top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
      }
      
      worksheet.mergeCells('K4:K6')
      worksheet.getCell('K4').value = 'សេចក្តីណែនាំផ្សេងៗ'
      worksheet.getCell('K4').font = { name: 'Khmer MEF2', size: 12, color: { argb: 'FF000000' } }
      worksheet.getCell('K4').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      // No fill color
      worksheet.getCell('K4').border = {
        top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
        right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
      }
      
      // Row 5: Sub-headers
      worksheet.mergeCells('D5:F5')
      worksheet.getCell('D5').value = 'ចំនួនកិច្ចការផ្ទះ'
      worksheet.getCell('D5').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FFFF0000' } }
      worksheet.getCell('D5').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('D5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2DCDB' } }
      worksheet.getCell('D5').border = {
        top: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        left: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        right: { style: 'thin', color: { argb: 'FF1A3A5C' } }
      }
      worksheet.getCell('G5').value = 4 // Default to 4 for user input
      worksheet.getCell('G5').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' }, bold: true }
      worksheet.getCell('G5').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('G5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }
      worksheet.getCell('G5').numFmt = '0' // Round to 2 decimal places
      worksheet.getCell('G5').border = {
        top: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        left: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        right: { style: 'thin', color: { argb: 'FF1A3A5C' } }
      }
      worksheet.mergeCells('H5:H6')
      worksheet.getCell('H5').value = 'កិច្ចការផ្ទះសរុប'
      worksheet.getCell('H5').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('H5').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      // No fill color
      worksheet.getCell('H5').border = {
        top: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        left: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        right: { style: 'thin', color: { argb: 'FF1A3A5C' } }
      }
      worksheet.mergeCells('I5:I6')
      worksheet.getCell('I5').value = 'វិញ្ញាសា'
      worksheet.getCell('I5').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('I5').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      // No fill color
      worksheet.getCell('I5').border = {
        top: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        left: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        right: { style: 'thin', color: { argb: 'FF1A3A5C' } }
      }
      
      // Row 6: Assignment numbers
      worksheet.getCell('D6').value = 'ស.1'
      worksheet.getCell('D6').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('D6').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('D6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0E6F5' } }
      worksheet.getCell('D6').border = {
        top: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        left: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        right: { style: 'thin', color: { argb: 'FF1A3A5C' } }
      }
      worksheet.getCell('E6').value = 'ស.2'
      worksheet.getCell('E6').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('E6').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('E6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0E6F5' } }
      worksheet.getCell('E6').border = {
        top: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        left: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        right: { style: 'thin', color: { argb: 'FF1A3A5C' } }
      }
      worksheet.getCell('F6').value = 'ស.3'
      worksheet.getCell('F6').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('F6').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('F6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0E6F5' } }
      worksheet.getCell('F6').border = {
        top: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        left: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        right: { style: 'thin', color: { argb: 'FF1A3A5C' } }
      }
      worksheet.getCell('G6').value = 'ស.4'
      worksheet.getCell('G6').font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FF000000' } }
      worksheet.getCell('G6').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell('G6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0E6F5' } }
      worksheet.getCell('G6').border = {
        top: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        left: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        bottom: { style: 'thin', color: { argb: 'FF1A3A5C' } },
        right: { style: 'thin', color: { argb: 'FF1A3A5C' } }
      }
    })

    console.log('👥 Adding real student data to all sheets...')
    
    // Add student data to each subject sheet
    subjectSheets.forEach(({ worksheet, subject }) => {
      let rowIndex = 7 // Start from row 7 to leave space for headers

      // Use real students from database
      students.forEach((student, index) => {
        const row = worksheet.getRow(rowIndex)
        row.height = 35
             
             // Fill student data matching Book1.xlsx structure with enhanced styling
             row.getCell(1).value = index + 1 // Row number (A)
             row.getCell(1).font = { name: 'Khmer OS Siemreap', size: 11 }
             row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
             // No fill color
             row.getCell(1).border = {
               top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
             }
             
             row.getCell(2).value = `${student.lastName} ${student.firstName}` // Student name (B) - using real student data
             row.getCell(2).font = { name: 'Khmer OS Siemreap', size: 11 }
             row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
             // No fill color
             row.getCell(2).border = {
               top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
             }
             
             row.getCell(3).value = student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender // Gender (C) - Convert to Khmer
             row.getCell(3).font = { name: 'Khmer OS Siemreap', size: 11 }
             row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
             // No fill color
             row.getCell(3).border = {
               top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
             }
             
             // Homework columns with input styling
             for (let col = 4; col <= 7; col++) {
               row.getCell(col).value = 0 // Default to 0 for user input
               row.getCell(col).font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FFFF0000' } }
               row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
               row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2DCDB' } }
               row.getCell(col).numFmt = '0.00' // Round to 2 decimal places
               row.getCell(col).border = {
                 top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
                 left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
                 bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
                 right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
               }
             }
             
             // Total and exam columns
             row.getCell(8).value = { formula: 'IF(B' + rowIndex + '="","",IF($G$5=0,0,SUM(OFFSET(D' + rowIndex + ',0,0,1,$G$5))/$G$5))' } // Homework total (H)
             row.getCell(8).font = { name: 'Khmer OS Siemreap', size: 11, bold: true }
             row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
             row.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0E6F5' } }
             row.getCell(8).numFmt = '0.00' // Round to 2 decimal places
             row.getCell(8).border = {
               top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
             }
             
             row.getCell(9).value = 0 // Exam score (I) - default to 0
             row.getCell(9).font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FFFF0000' } }
             row.getCell(9).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
             row.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2DCDB' } }
             row.getCell(9).numFmt = '0.00' // Round to 2 decimal places
             row.getCell(9).border = {
               top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
             }
             
             row.getCell(10).value = { formula: 'IF(B' + rowIndex + '="","",IF($G$5=0,(($I$4*(I' + rowIndex + '/10))/10)+($H$4/10),($H$4*(H' + rowIndex + '/10)+$I$4*(I' + rowIndex + '/10))/10))' } // Monthly total (J)
             row.getCell(10).font = { name: 'Khmer OS Siemreap', size: 11, color: { argb: 'FFFF0000' }, bold: true }
             row.getCell(10).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
             row.getCell(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0E6F5' } }
             row.getCell(10).numFmt = '0.00' // Round to 2 decimal places
             row.getCell(10).border = {
               top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
             }
             
             row.getCell(11).value = '' // Notes (K)
             row.getCell(11).font = { name: 'Khmer OS Siemreap', size: 11 }
             row.getCell(11).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
             // No fill color
             row.getCell(11).border = {
               top: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               left: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
               right: { style: 'medium', color: { argb: 'FF1A3A5C' } }
             }

        // Add hidden ID columns for import process (columns L, M, N, O, P, Q, R)
        row.getCell(12).value = student.studentId // StudentID (L)
        row.getCell(13).value = subject.subjectId // SubjectID (M)
        row.getCell(14).value = course.courseId // CourseID (N)
        row.getCell(15).value = semester?.semesterId || parseInt(semesterId) // SemesterID (O)
        row.getCell(16).value = schoolYear?.schoolYearId || parseInt(schoolYearId) // SchoolYearID (P)
        row.getCell(17).value = currentMonth // Month (Q)
        row.getCell(18).value = currentYear // Year (R)
        
        rowIndex++
      })
    })

    // Hide the ID columns by setting width to 0 and making them invisible for all sheets
    subjectSheets.forEach(({ worksheet }) => {
      worksheet.getColumn(12).width = 0 // StudentID column
      worksheet.getColumn(13).width = 0 // SubjectID column
      worksheet.getColumn(14).width = 0 // CourseID column
      worksheet.getColumn(15).width = 0 // SemesterID column
      worksheet.getColumn(16).width = 0 // SchoolYearID column
      worksheet.getColumn(17).width = 0 // Month column
      worksheet.getColumn(18).width = 0 // Year column
    })

    console.log('📋 Instructions sheet already created...')

    console.log('🔒 Adding sheet protection to all sheets...')
    
    // Protect the instructions sheet
    instructionsSheet.protect('FSchool2009', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
      objects: false,
      scenarios: false
    })
    
    console.log('🔒 Instructions sheet protected successfully')
    
    // Protect all subject sheets but allow editing in specific cells
    subjectSheets.forEach(({ worksheet }) => {
      // Password: FSchool2009 (users can unprotect if needed)
      worksheet.protect('FSchool2009', {
        selectLockedCells: true,
        selectUnlockedCells: true,
        formatCells: false,
        formatColumns: false,
        formatRows: false,
        insertColumns: false,
        insertRows: false,
        insertHyperlinks: false,
        deleteColumns: false,
        deleteRows: false,
        sort: false,
        autoFilter: false,
        pivotTables: false,
        objects: false,
        scenarios: false
      })
    })
    
    // Unlock specific cells for user input on all sheets
    const unlockedCells = ['H4', 'G5', 'D7', 'E7', 'F7', 'G7', 'I7', 'K7']
    
    subjectSheets.forEach(({ worksheet }) => {
      unlockedCells.forEach(cellRef => {
        const cell = worksheet.getCell(cellRef)
        cell.protection = { locked: false }
      
        // Add specific validation based on cell type
        if (cellRef === 'G5') {
          // G5: Integer only, 1-4
          cell.dataValidation = {
            type: 'whole',
            operator: 'between',
            formulae: [0, 4],
            allowBlank: true,
            showInputMessage: true,
            showErrorMessage: true,
            errorTitle: 'Invalid Input',
            error: 'Please enter a whole number between 0 and 4',
            promptTitle: 'Number Input',
            prompt: 'Enter a whole number between 0 and 4'
          }
          console.log(`🔢 Added integer validation (0-4) to cell: ${cellRef}`)
        } else if (cellRef === 'H4') {
          // H4: Integer only, 1-100
          cell.dataValidation = {
            type: 'whole',
            operator: 'between',
            formulae: [1, 100],
            allowBlank: true,
            showInputMessage: true,
            showErrorMessage: true,
            errorTitle: 'Invalid Input',
            error: 'Please enter a whole number between 1 and 100',
            promptTitle: 'Number Input',
            prompt: 'Enter a whole number between 1 and 100'
          }
          console.log(`🔢 Added integer validation (1-100) to cell: ${cellRef}`)
        } else if (cellRef === 'I4') {
          // I4: Formula cell - no validation needed
          console.log(`📊 Formula cell (auto-calculated): ${cellRef}`)
        } else if (['D', 'E', 'F', 'G', 'I'].includes(cellRef.charAt(0))) {
          // Grade cells: Decimal, 0-100
          cell.dataValidation = {
            type: 'decimal',
            operator: 'between',
            formulae: [0, 100],
            allowBlank: true,
            showInputMessage: true,
            showErrorMessage: true,
            errorTitle: 'Invalid Input',
            error: 'Please enter a number between 0 and 100',
            promptTitle: 'Grade Input',
            prompt: 'Enter a grade between 0 and 100'
          }
          console.log(`🔢 Added decimal validation (0-100) to cell: ${cellRef}`)
        } else {
          console.log(`📝 Text input allowed for cell: ${cellRef}`)
        }
      })
    })
    
    // Also unlock cells in the student data section (rows 7 onwards) for all sheets
    subjectSheets.forEach(({ worksheet }) => {
      // Unlock homework columns (D, E, F, G), exam column (I), and notes column (K) for all student rows
      for (let row = 7; row <= 35; row++) { // Assuming max 21 students (rows 7-21)
        const homeworkColumns = ['D', 'E', 'F', 'G']
        const examColumn = 'I'
        const notesColumn = 'K'
        
        // Add validation to homework columns (numbers only)
        homeworkColumns.forEach(col => {
          const cellRef = `${col}${row}`
          const cell = worksheet.getCell(cellRef)
          cell.protection = { locked: false }
          cell.dataValidation = {
            type: 'decimal',
            operator: 'between',
            formulae: [0, 100],
            allowBlank: true,
            showInputMessage: true,
            showErrorMessage: true,
            errorTitle: 'Invalid Input',
            error: 'Please enter a number between 0 and 100',
            promptTitle: 'Grade Input',
            prompt: 'Enter a grade between 0 and 100'
          }
        })
        
        // Add validation to exam column (numbers only)
        const examCell = worksheet.getCell(`${examColumn}${row}`)
        examCell.protection = { locked: false }
        examCell.dataValidation = {
          type: 'decimal',
          operator: 'between',
          formulae: [0, 100],
          allowBlank: true,
          showInputMessage: true,
          showErrorMessage: true,
          errorTitle: 'Invalid Input',
          error: 'Please enter a number between 0 and 100',
          promptTitle: 'Grade Input',
          prompt: 'Enter a grade between 0 and 100'
        }
        
        // Notes column (text input, no validation)
        const notesCell = worksheet.getCell(`${notesColumn}${row}`)
        notesCell.protection = { locked: false }
        // No data validation for notes - allows any text input
        
        // Lock homework total column (H) since it's a formula cell
        const homeworkTotalCell = worksheet.getCell(`H${row}`)
        homeworkTotalCell.protection = { locked: true }
        console.log(`🔒 Locked formula cell: H${row}`)
        
        // Lock monthly total column (J) since it's a formula cell
        const monthlyTotalCell = worksheet.getCell(`J${row}`)
        monthlyTotalCell.protection = { locked: true }
        console.log(`🔒 Locked formula cell: J${row}`)
      }
    })    
    
    // Add content to Instructions sheet
    console.log('📝 Adding instructions to first sheet...')
    
    // Set column widths for instructions sheet
    instructionsSheet.getColumn('A').width = 15
    instructionsSheet.getColumn('B').width = 70
    
    // Title
    instructionsSheet.getCell('A1').value = 'ការណែនាំការប្រើប្រាស់គំរូពិន្ទុ'
    instructionsSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF000080' }, name: 'Khmer OS Siemreap' }
    instructionsSheet.getCell('A1').alignment = { horizontal: 'center' }
    instructionsSheet.mergeCells('A1:B1')
    
    // Instructions content
    const instructions = [
      { step: '១.', instruction: 'បំពេញពិន្ទុកិច្ចការផ្ទះ (ជួរ D, E, F, G) តាមចំនួនកិច្ចការផ្ទះ (ក្រឡា G5)' },
      { step: '២.', instruction: 'បំពេញពិន្ទុប្រចាំខែ (ជួរ J) សម្រាប់ពិន្ទុសរុបប្រចាំខែ' },
      { step: '៣.', instruction: 'បំពេញសេចក្តីណែនាំ (ជួរ K) បើមាន' },
      { step: '៤.', instruction: 'ក្រឡាដែលមានពណ៌លឿង គឺជាក្រឡាដែលអ្នកអាចកែប្រែបាន' },
      { step: '៥.', instruction: 'ក្រឡាដែលមានពណ៌ស គឺជាក្រឡាដែលគណនាដោយស្វ័យប្រវត្តិ' },
      { step: '៦.', instruction: 'ក្រឡាដែលមានពណ៌ក្រហម គឺជាក្រឡាសំខាន់ៗ' },
      { step: '៧.', instruction: 'ពិន្ទុត្រូវតែជាលេខពី ០ ដល់ ១០០ ប៉ុណ្ណោះ' },
      { step: '៨.', instruction: 'បន្ទាប់ពីបំពេញពិន្ទុរួច សូមរក្សាទុកឯកសារ និងផ្ទុកឡើងវិញ' }
    ]
    
    let currentRow = 3
    instructions.forEach((item, index) => {
      instructionsSheet.getCell(`A${currentRow}`).value = item.step
      instructionsSheet.getCell(`A${currentRow}`).font = { bold: true, size: 12, name: 'Khmer OS Siemreap' }
      
      instructionsSheet.getCell(`B${currentRow}`).value = item.instruction
      instructionsSheet.getCell(`B${currentRow}`).font = { size: 12, name: 'Khmer OS Siemreap' }
      instructionsSheet.getCell(`B${currentRow}`).alignment = { wrapText: true }
      
      currentRow++
    })
    
    // Add important notes
    currentRow += 2
    instructionsSheet.getCell(`A${currentRow}`).value = 'សំគាល់សំខាន់៖'
    instructionsSheet.getCell(`A${currentRow}`).font = { bold: true, size: 14, color: { argb: 'FFCC0000' }, name: 'Khmer OS Siemreap' }
    instructionsSheet.mergeCells(`A${currentRow}:B${currentRow}`)
    
    currentRow++
    const importantNotes = [
      '• កុំលុប ឬកែប្រែឈ្មោះសិស្ស',
      '• កុំលុប ឬកែប្រែព័ត៌មានផ្សេងៗក្នុងជួរទី ១-៣',
      '• ក្រឡាដែលមានពណ៌លឿងប៉ុណ្ណោះដែលអាចកែប្រែបាន',
      '• ប្រសិនបើមានបញ្ហា សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ'
    ]
    
    importantNotes.forEach((note, index) => {
      instructionsSheet.getCell(`B${currentRow}`).value = note
      instructionsSheet.getCell(`B${currentRow}`).font = { size: 11, color: { argb: 'FF666666' }, name: 'Khmer OS Siemreap' }
      instructionsSheet.getCell(`B${currentRow}`).alignment = { wrapText: true }
      currentRow++
    })
    
    // Style the instructions sheet
    instructionsSheet.getRow(1).height = 50
    instructionsSheet.getRow(2).height = 20
    
    // Add borders to important cells
    for (let row = 1; row <= currentRow; row++) {
      for (let col = 1; col <= 3; col++) {
        const cell = instructionsSheet.getCell(row, col)
        if (cell.value) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
      }
    }
    
    console.log('💾 Generating Excel buffer...')
    
    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer()
    
    console.log('✅ Excel buffer generated successfully, size:', buffer.byteLength)

    // Set response headers
    const filename = `grade_template_${new Date().toISOString().split('T')[0]}.xlsx`
    
    console.log('📤 Returning Excel file:', filename)
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error generating fallback template:', error)
    console.error('❌ Error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      name: error?.name || 'Unknown error type'
    })
    return NextResponse.json(
      { 
        error: 'Failed to generate fallback template',
        details: error?.message || 'Unknown error occurred',
        stack: error?.stack || 'No stack trace available'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
