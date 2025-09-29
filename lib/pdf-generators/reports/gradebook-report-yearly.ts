import puppeteer from 'puppeteer'
import { formatDateKhmer, getLogoBase64 } from '../core/utils'
import { ReportOptions } from '../core/types'

// Constants
// Simplified grading system using A, B, C, D, E, F

// Helper function for rounding numbers
function round(num: number, decimals: number = 1): string {
  return Number(num.toFixed(decimals)).toFixed(decimals)
}

// Grade status calculation (same as grade-report-yearly.ts)
function getGradeStatus(average: number, gradeLevel: string): string {
  const gradeNum = parseInt(gradeLevel) || 0
  
  if (gradeNum >= 1 && gradeNum <= 6) {
    // Grades 1-6: Full average is 10
    if (average >= 9) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (average >= 8) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (average >= 7) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (average >= 6) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (average >= 5) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
  
  if (gradeNum >= 7 && gradeNum <= 9) {
    // Grades 7-9: Full average is 50
    if (average >= 45) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (average >= 40) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (average >= 35) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (average >= 30) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (average >= 25) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
  
  // Fallback for unknown grade levels
  if (average >= 90) return 'A'
  if (average >= 80) return 'B'
  if (average >= 70) return 'C'
  if (average >= 60) return 'D'
  if (average >= 50) return 'E'
  return 'F'
}

// Calculate subject ranks for all students
function calculateSubjectRanks(students: any[]): Record<string, Record<string, string>> {
  const subjectRanks: Record<string, Record<string, string>> = {}
  
  // Get all unique subjects
  const allSubjects = new Set<string>()
  students.forEach(student => {
    if (student.subjects) {
      student.subjects.forEach((subject: any) => {
        allSubjects.add(subject.subjectName)
      })
    }
  })
  
  // Calculate ranks for each subject
  allSubjects.forEach(subjectName => {
    const subjectStudents = students
      .filter(student => student.subjects?.some((s: any) => s.subjectName === subjectName))
      .map(student => ({
        studentId: student.studentId,
        grade: student.subjects?.find((s: any) => s.subjectName === subjectName)?.grade || 0
      }))
      .sort((a, b) => b.grade - a.grade)
    
    subjectRanks[subjectName] = {}
    subjectStudents.forEach((student, index) => {
      subjectRanks[subjectName][student.studentId] = (index + 1).toString()
    })
  })
  
  return subjectRanks
}

// Calculate student data with proper ranking and status
function calculateStudentData(student: any, classLevel: string) {
  // Calculate total grade (sum of all subject grades)
  const totalGrade = student.subjects.reduce((sum: number, subject: any) => sum + (subject.grade || 0), 0)
  
  // Calculate average grade
  const averageGrade = student.subjects.length > 0 ? totalGrade / student.subjects.length : 0
  
  // Get status using the same logic as grade-report-yearly.ts
  const status = getGradeStatus(averageGrade, classLevel)
  
  return {
    ...student,
    totalGrade: totalGrade,
    averageGrade: averageGrade,
    status: status
  }
}

// Calculate different types of ranks for yearly reports
function calculateYearlyRanks(students: any[]): {
  semester1Ranks: Record<string, number>,
  semester2Ranks: Record<string, number>,
  overallRanks: Record<string, number>
} {
  // Sort by semester 1 average
  const sortedBySemester1 = [...students].sort((a, b) => (b.semester1Average || 0) - (a.semester1Average || 0))
  const semester1Ranks: Record<string, number> = {}
  sortedBySemester1.forEach((student, index) => {
    semester1Ranks[student.studentId] = index + 1
  })

  // Sort by semester 2 average
  const sortedBySemester2 = [...students].sort((a, b) => (b.semester2Average || 0) - (a.semester2Average || 0))
  const semester2Ranks: Record<string, number> = {}
  sortedBySemester2.forEach((student, index) => {
    semester2Ranks[student.studentId] = index + 1
  })

  // Sort by overall yearly average
  const sortedByOverall = [...students].sort((a, b) => (b.averageGrade || 0) - (a.averageGrade || 0))
  const overallRanks: Record<string, number> = {}
  sortedByOverall.forEach((student, index) => {
    overallRanks[student.studentId] = index + 1
  })

  return { semester1Ranks, semester2Ranks, overallRanks }
}

// Interface for Yearly Gradebook Report Data
export interface YearlyGradebookReportData {
  reportType: 'yearly'
  academicYear: string
  year: string
  class?: string
  section?: string
  student: {
    studentId: string
    firstName: string
    lastName: string
    gender: string
    photo?: string
    subjects: {
      subjectName: string
      grade: number
      maxGrade: number
      percentage: number
      letterGrade: string
      gradeComment?: string
      subjectRank?: string
    }[]
    totalGrade: number
    averageGrade: number
    semester1Average?: number
    semester2Average?: number
    rank: string
    semester1Rank?: string
    semester2Rank?: string
    overallRank?: string
    status: string
    attendance: {
      absent: number
      late: number
      excused: number
      total: number
      rate: number
    }
  }
  generatedAt: string
}

// Generate HTML for Yearly Gradebook Report
export function generateYearlyGradebookReportHTML(data: YearlyGradebookReportData): string {
  try {
    // Validate data structure
    if (!data || !data.student) {
      throw new Error('Invalid data structure: missing student data')
    }
    
    const logoBase64 = getLogoBase64(data.class)
    const reportDate = formatDateKhmer(new Date())
    
    // Process student data with proper calculations
    const classLevel = data.class || '1'
    const processedStudent = calculateStudentData(data.student, classLevel)
    const studentRank = processedStudent.rank || '1'
    
    // Validate student data
    if (!processedStudent.firstName || !processedStudent.lastName) {
      throw new Error('Invalid student data: missing name information')
    }
    
    console.log(`Generating HTML for student: ${processedStudent.firstName} ${processedStudent.lastName}`)
  
  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំ</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #333;
      background: white;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    .document {
      max-width: 210mm;
      margin: 0 auto;
      padding: 5mm;
      background: white;
    }

    .header-section {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .header-left {
      flex: 0 0 80px;
    }

    .school-logo {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }

    .header-center {
      flex: 1;
      text-align: center;
      padding: 0 15px;
    }

    .kingdom-motto {
      font-size: 15pt;
      font-weight: bold;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
      margin-bottom: 5px;
    }

    .nation-religion-king {
      font-size: 13pt;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
      margin-bottom: 15px;
    }

    .report-title {
      font-size: 13pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      margin-bottom: 10px;
    }

    .class-info {
      font-size: 10pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      margin-bottom: 5px;
    }

    .student-name {
      padding-top: 10px;
      font-size: 12pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
    }

    .header-right {
      flex: 0 0 80px;
      text-align: center;
    }

    .student-photo {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 0;
      border: 2px solid #333;
    }

    .photo-placeholder {
      width: 120px;
      height: 120px;
      border: 2px solid #333;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      background: #f5f5f5;
    }

    .subject-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      border: 1px solid #333;
      font-size: 9pt;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      table-layout: fixed;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 2px solid #333;
      border-top: none;
      font-size: 9pt;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      table-layout: fixed;
    }

    .subject-table th {
      background: #f0f0f0;
      padding: 5px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #333;
    }

    .subject-table td {
      padding: 5px;
      border: 1px solid #333;
    }

    .summary-table td {
      padding: 5px;
      border: 2px solid #333;
    }

    .subject-name {
      font-weight: bold;
    }

    .grade-value {
      text-align: center;
      font-weight: bold;
    }

    .summary-row {
      background: #f9f9f9;
      font-weight: bold;
    }

    .attendance-row {
      background: #f9f9f9;
      font-weight: bold;
      text-align: center;
    }

    .attendance-row td {
      text-align: center;
      font-size: 10pt;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
    }

    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
    }

    .signature-part {
      text-align: center;
      margin: 0 5px;
    }

    .signature-part:first-child {
      flex: 1;
    }

    .signature-part:nth-child(2) {
      flex: 2;
    }

    .signature-part:last-child {
      flex: 1;
    }

    .signature-title {
      font-size: 10pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      margin-bottom: 15px;
    }

    .signature-line {
      height: 20px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="document">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-left">
        ${logoBase64 ? `<img src="${logoBase64}" alt="School Logo" class="school-logo" />` : ''}
      </div>
      
      <div class="header-center">
        <div class="kingdom-motto">ព្រះរាជាណាចក្រកម្ពុជា</div>
        <div class="nation-religion-king">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
        <div class="report-title">លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំ ${data.academicYear}</div>
        <div class="class-info">ថ្នាក់ទី ${data.class}${data.section}</div>
        <div class="student-name">${processedStudent.lastName} ${processedStudent.firstName}</div>
      </div>
      
      <div class="header-right">
        ${processedStudent.photo ? 
          `<img src="${processedStudent.photo}" alt="Student Photo" class="student-photo" />` : 
          `<div class="photo-placeholder">រូបសិស្ស</div>`
        }
      </div>
    </div>

    <!-- Subject Table -->
    <table class="subject-table">
      <thead>
        <tr>
          <th style="width: 30%;">មុខវិជ្ជា</th>
          <th style="width: 12%;">ពិន្ទុ</th>
          <th style="width: 12%;">ចំណាត់ថ្នាក់ពិន្ទុ</th>
          <th style="width: 12%;">និទ្ទេស</th>
          <th style="width: 34%;">ចំនុចដែលត្រូវជួយពង្រឹងបន្ថែម</th>
        </tr>
      </thead>
      <tbody>
        ${processedStudent.subjects.map((subject: any) => `
          <tr>
            <td class="subject-name">${subject.subjectName}</td>
            <td class="grade-value">${round(subject.grade)}</td>
            <td class="grade-value">${subject.subjectRank || 'N/A'}</td>
            <td class="grade-value">${subject.letterGrade}</td>
            <td>${subject.gradeComment}</td>
          </tr>
        `).join('')}
        
      </tbody>
    </table>

    <!-- Summary Table -->
    <table class="summary-table">
      <tbody>
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">ពិន្ទុសរុបឆ្នាំ</td>
          <td class="grade-value" style="width: 25%;">${round(processedStudent.totalGrade, 2)}</td>
          <td class="grade-value" style="width: 25%;">ចំណាត់ថ្នាក់</td>
          <td class="grade-value" style="width: 25%;">និទ្ទេស</td>
        </tr>
        
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">មធ្យមភាគឆមាសទី ១</td>
          <td class="grade-value" style="width: 25%;">${round(processedStudent.semester1Average || 0, 2)}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.semester1Rank || 'N/A'}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.status}</td>
        </tr>
        
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">មធ្យមភាគឆមាសទី ២</td>
          <td class="grade-value" style="width: 25%;">${round(processedStudent.semester2Average || 0, 2)}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.semester2Rank || 'N/A'}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.status}</td>
        </tr>
        
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">មធ្យមភាគប្រចាំឆ្នាំ</td>
          <td class="grade-value" style="width: 25%;">${round(processedStudent.averageGrade, 2)}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.overallRank || 'N/A'}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.status}</td>
        </tr>
        
        <!-- Attendance Row -->
        <tr class="attendance-row">
          <td colspan="4">អវត្តមានប្រចាំឆ្នាំ ច្បាប់: ${processedStudent.attendance.excused} ដង ឥតច្បាប់: ${processedStudent.attendance.absent} ដង យឺត: ${processedStudent.attendance.late} ដង</td>
        </tr>
      </tbody>
    </table>

    <!-- Signature Section -->
    <div class="signature-section">
      <div class="signature-part">
        <div class="signature-title">បានឃើញ និងឯកភាព</div>
        <div class="signature-line">${reportDate}</div>
        <div class="signature-line">នាយិកាសាលា</div>
      </div>

      <div class="signature-part">
        <div class="signature-title">មតិរបស់មាតាបិតា ឫ អាណាព្យាបាលសិស្ស</div>
      </div>

      <div class="signature-part">
        <div class="signature-title">គ្រូបន្ទុកថ្នាក់</div>
        <div class="signature-line">${reportDate}</div>
        <div class="signature-line">គ្រូបន្ទុកថ្នាក់</div>
      </div>
    </div>
  </div>
</body>
</html>
  `
  } catch (error) {
    console.error('Error generating yearly gradebook report HTML:', error)
    throw error
  }
}

// Generate PDF for individual yearly gradebook report
export async function generateYearlyGradebookReportPDF(data: YearlyGradebookReportData, options?: ReportOptions): Promise<Buffer> {
  const html = generateYearlyGradebookReportHTML(data)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // Set viewport for better rendering
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    
    // Set content with better options
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    // Wait a bit more for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

// Generate combined PDF for multiple yearly gradebook reports
export async function generateCombinedYearlyGradebookPDF(individualReports: YearlyGradebookReportData[]): Promise<Buffer> {
  console.log(`Generating combined yearly gradebook PDF for ${individualReports.length} students`)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    
    // Set viewport for better rendering
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    
    // Process all student HTMLs and combine them
    const combinedHTML = await processStudentHTMLs(individualReports, generateYearlyGradebookReportHTML)
    
    // Set content with better options
    await page.setContent(combinedHTML, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    // Wait a bit more for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false
    })
    
    console.log(`Successfully generated combined yearly gradebook PDF`)
    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('Error generating combined yearly gradebook PDF:', error)
    throw new Error(`Failed to generate combined yearly gradebook: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    await browser.close()
  }
}

// Helper function to process student HTMLs and combine them
async function processStudentHTMLs(
  individualReports: YearlyGradebookReportData[], 
  generateHTMLFunction: (data: YearlyGradebookReportData) => string
): Promise<string> {
  console.log(`Processing ${individualReports.length} individual yearly reports`)
  
  const studentHTMLs = individualReports.map((reportData, index) => {
    console.log(`Processing student ${index + 1}/${individualReports.length}: ${reportData.student.firstName} ${reportData.student.lastName}`)
    return generateHTMLFunction(reportData)
  })
  
  // Extract CSS from the first student's HTML
  const firstHTML = studentHTMLs[0]
  const styleMatch = firstHTML.match(/<style>([\s\S]*?)<\/style>/)
  const extractedCSS = styleMatch ? styleMatch[1] : ''
  
  // Extract body content from all student HTMLs
  const bodyContents = studentHTMLs.map(html => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)
    return bodyMatch ? bodyMatch[1] : html
  })
  
  // Combine all body contents with page breaks
  const combinedBody = bodyContents.map((bodyContent, index) => {
    if (index === 0) return bodyContent
    return `<div style="page-break-before: always;">${bodyContent}</div>`
  }).join('')
  
  // Create combined HTML
  const combinedHTML = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំ</title>
  <style>
    ${extractedCSS}
  </style>
</head>
<body>
  ${combinedBody}
</body>
</html>
  `
  
  console.log(`Successfully combined ${studentHTMLs.length} student HTMLs`)
  return combinedHTML
}
