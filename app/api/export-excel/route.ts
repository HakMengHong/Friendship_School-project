import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Excel Export API with Khmer Language Support...')

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    
    // Add metadata
    workbook.creator = 'Friendship School System'
    workbook.lastModifiedBy = 'Admin'
    workbook.created = new Date()
    workbook.modified = new Date()

    // Create Student Grades worksheet
    const gradesSheet = workbook.addWorksheet('ពិន្ទុសិស្ស')
    
    // Define columns with Khmer headers
    gradesSheet.columns = [
      { header: 'លេខរៀង', key: 'id', width: 8 },
      { header: 'ឈ្មោះសិស្ស', key: 'name', width: 25 },
      { header: 'ថ្នាក់', key: 'class', width: 15 },
      { header: 'គណិតវិទ្យា', key: 'math', width: 12 },
      { header: 'ភាសាខ្មែរ', key: 'khmer', width: 12 },
      { header: 'អង់គ្លេស', key: 'english', width: 12 },
      { header: 'វិទ្យាសាស្ត្រ', key: 'science', width: 12 },
      { header: 'ពិន្ទុមធ្យម', key: 'average', width: 12 },
      { header: 'កម្រិត', key: 'level', width: 10 }
    ]

    // Style the header row
    const headerRow = gradesSheet.getRow(1)
    headerRow.font = { 
      bold: true, 
      size: 12,
      name: 'Khmer OS'
    }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' }
    }
    headerRow.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    }

    // Sample student data with Khmer names
    const students = [
      {
        id: 1,
        name: 'សុខ សំអាង',
        class: 'ថ្នាក់ទី១២ក',
        math: 85,
        khmer: 92,
        english: 78,
        science: 88,
        average: 85.75,
        level: 'A'
      },
      {
        id: 2,
        name: 'ម៉ៅ សុធារី',
        class: 'ថ្នាក់ទី១១ខ',
        math: 90,
        khmer: 95,
        english: 85,
        science: 82,
        average: 88.0,
        level: 'A+'
      },
      {
        id: 3,
        name: 'វ៉ាន់ សុផល',
        class: 'ថ្នាក់ទី១០គ',
        math: 75,
        khmer: 88,
        english: 92,
        science: 85,
        average: 85.0,
        level: 'A'
      }
    ]

    // Add data rows
    students.forEach((student, index) => {
      const row = gradesSheet.addRow({
        id: student.id,
        name: student.name,
        class: student.class,
        math: student.math,
        khmer: student.khmer,
        english: student.english,
        science: student.science,
        average: student.average,
        level: student.level
      })

      // Style data rows
      row.font = { 
        size: 11,
        name: 'Khmer OS'
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        }
      }

      // Center align numeric columns
      row.getCell('id').alignment = { horizontal: 'center' }
      row.getCell('math').alignment = { horizontal: 'center' }
      row.getCell('khmer').alignment = { horizontal: 'center' }
      row.getCell('english').alignment = { horizontal: 'center' }
      row.getCell('science').alignment = { horizontal: 'center' }
      row.getCell('average').alignment = { horizontal: 'center' }
      row.getCell('level').alignment = { horizontal: 'center' }
    })

    // Create Attendance worksheet
    const attendanceSheet = workbook.addWorksheet('វត្តមាន')
    
    attendanceSheet.columns = [
      { header: 'ថ្ងៃខែ', key: 'date', width: 15 },
      { header: 'ឈ្មោះសិស្ស', key: 'name', width: 25 },
      { header: 'ថ្នាក់', key: 'class', width: 15 },
      { header: 'ស្ថានភាព', key: 'status', width: 12 },
      { header: 'មូលហេតុ', key: 'reason', width: 20 }
    ]

    // Style attendance header
    const attendanceHeader = attendanceSheet.getRow(1)
    attendanceHeader.font = { 
      bold: true, 
      size: 12,
      name: 'Khmer OS'
    }
    attendanceHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    }
    attendanceHeader.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    }

    // Sample attendance data
    const attendanceData = [
      {
        date: '2024-08-15',
        name: 'សុខ សំអាង',
        class: 'ថ្នាក់ទី១២ក',
        status: 'វត្តមាន',
        reason: ''
      },
      {
        date: '2024-08-15',
        name: 'ម៉ៅ សុធារី',
        class: 'ថ្នាក់ទី១១ខ',
        status: 'អវត្តមាន',
        reason: 'ឈឺ'
      },
      {
        date: '2024-08-15',
        name: 'វ៉ាន់ សុផល',
        class: 'ថ្នាក់ទី១០គ',
        status: 'យឺតយ៉ាវ',
        reason: 'ចរាចរណ៍'
      }
    ]

    // Add attendance data
    attendanceData.forEach((record, index) => {
      const row = attendanceSheet.addRow({
        date: record.date,
        name: record.name,
        class: record.class,
        status: record.status,
        reason: record.reason
      })

      row.font = { 
        size: 11,
        name: 'Khmer OS'
      }

      // Color code status
      if (record.status === 'វត្តមាន') {
        row.getCell('status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' }
        }
      } else if (record.status === 'អវត្តមាន') {
        row.getCell('status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC7CE' }
        }
      } else if (record.status === 'យឺតយ៉ាវ') {
        row.getCell('status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB9C' }
        }
      }
    })

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer()

    console.log('✅ Excel file generated successfully!')
    console.log(`📏 File size: ${(buffer.length / 1024).toFixed(2)} KB`)

    // Return the Excel file as a download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="friendship-school-report.xlsx"',
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('❌ Error generating Excel file:', error)
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    )
  }
}
