import puppeteer from 'puppeteer'
import { formatDateKhmer, getLogoBase64 } from '../core/utils'
import { ReportOptions } from '../core/types'

// Constants
const MONTH_NAMES = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']

// Helper function for rounding numbers
function round(num: number, decimals: number = 1): string {
  return Number(num.toFixed(decimals)).toFixed(decimals)
}

// Attendance-based grade penalty calculation
// For every 4 absences (ដង), student loses 10% of their grade
// Formula: 1 absence = 2.5% penalty, max penalty = 10%
// Total absences = (excused * 0.5) + absent
function applyAttendancePenalty(originalGrade: number, totalAbsences: number = 0): number {
  // Calculate penalty rate: max 10% (1.0 factor) when totalAbsences >= 4
  const penaltyRate = Math.min(totalAbsences / 4, 1) * 0.1
  
  // Apply penalty: grade * (1 - penaltyRate)
  // Example: grade=10, totalAbsences=4 → 10 * (1 - 0.1) = 9
  const adjustedGrade = originalGrade * (1 - penaltyRate)
  
  return adjustedGrade
}

// Helper function to determine maxScore based on grade level and subject
// Database subjects: គណិតវិទ្យា, ភាសាខ្មែរ, តែងសេចក្តី, សរសេរតាមអាន, រូបវិទ្យា, គីមីវិទ្យា, ជីវវិទ្យា, 
//                    ផែនដីវិទ្យា, សីលធម៌-ពលរដ្ឋវិទ្យា, ភូមិវិទ្យា, ប្រវត្តិវិទ្យា, អង់គ្លេស
function getSubjectMaxScore(subjectName: string, gradeNum: number): number {
  // Grade 1-6: maxScore = 10
  if (gradeNum >= 1 && gradeNum <= 6) {
    return 10
  }
  
  // Grade 7-8: maxScore = 50, BUT ភាសាខ្មែរ (Khmer) and គណិតវិទ្យា (Math) = 100
  if (gradeNum >= 7 && gradeNum <= 8) {
    // Match exact subject names from database
    if (subjectName === 'គណិតវិទ្យា') return 100  // Math
    if (subjectName === 'ភាសាខ្មែរ') return 100   // Khmer
    return 50  // All other subjects
  }
  
  // Grade 9: Each subject has specific maxScore (exact database names)
  if (gradeNum === 9) {
    if (subjectName === 'តែងសេចក្តី') return 50           // Writing composition
    if (subjectName === 'សរសេរតាមអាន') return 50         // Dictation
    if (subjectName === 'គណិតវិទ្យា') return 100         // Math
    if (subjectName === 'រូបវិទ្យា') return 35           // Physics
    if (subjectName === 'គីមីវិទ្យា') return 25          // Chemistry
    if (subjectName === 'ជីវវិទ្យា') return 35           // Biology
    if (subjectName === 'ផែនដីវិទ្យា') return 25         // Earth Science
    if (subjectName === 'សីលធម៌-ពលរដ្ឋវិទ្យា') return 35  // Civic Education
    if (subjectName === 'ភូមិវិទ្យា') return 32           // Geography
    if (subjectName === 'ប្រវត្តិវិទ្យា') return 33       // History
    if (subjectName === 'អង់គ្លេស') return 50            // English
    return 50 // Default for unknown subjects
  }
  
  // Default fallback
  return 100
}

// Helper function to get letter grade based on adjusted score and maxScore
function getLetterGrade(score: number, maxScore: number): string {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
  
  if (percentage >= 90) return 'A'   // ល្អ​ប្រសើរ >= 90%
  if (percentage >= 80) return 'B'   // ល្អ​ណាស់ >= 80%
  if (percentage >= 70) return 'C'   // ល្អ >= 70%
  if (percentage >= 60) return 'D'   // ល្អ​បង្គួរ >= 60%
  if (percentage >= 50) return 'E'   // ល្អ​បង្គួរ >= 50%
  return 'F' // ខ្សោយ < 50%
}

// Grade status calculation (consistent with other report generators)
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

// Monthly Gradebook Report Data Interface (Individual Student)
export interface MonthlyGradebookReportData {
  reportType: 'monthly'
  academicYear: string
  month: string
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
    rank: string
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

// Generate HTML for Monthly Gradebook Report
export function generateMonthlyGradebookReportHTML(data: MonthlyGradebookReportData): string {
  try {
    // Validate data structure
    if (!data || !data.student) {
      throw new Error('Invalid data structure: missing student data')
    }
    
    const logoBase64 = getLogoBase64(data.class)
    const monthNames = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
    const monthName = monthNames[parseInt(data.month) - 1] || data.month
    const reportDate = formatDateKhmer(new Date())
    
    // Use student data directly (already calculated in API)
    const student = data.student
    const studentRank = student.rank || '1'
    
    // Calculate total absences for attendance penalty
    // Formula: (excused * 0.5) + absent
    const totalAbsences = (student.attendance.excused * 0.5) + student.attendance.absent
    
    // Get class level for maxScore calculation
    const classLevel = data.class || '9'
    const gradeNum = parseInt(classLevel)
    
    // Apply attendance penalty to each subject grade and recalculate letter grades
    const adjustedSubjects = student.subjects.map(subject => {
      const adjustedGrade = applyAttendancePenalty(subject.grade, totalAbsences)
      const correctMaxScore = getSubjectMaxScore(subject.subjectName, gradeNum)
      return {
        ...subject,
        originalGrade: subject.grade,
        grade: adjustedGrade,
        maxGrade: correctMaxScore,  // Update with correct maxScore
        letterGrade: getLetterGrade(adjustedGrade, correctMaxScore)  // Recalculate based on adjusted grade
      }
    })
    
    // Calculate adjusted totals and averages
    const adjustedTotalGrade = applyAttendancePenalty(student.totalGrade, totalAbsences)
    const adjustedAverageGrade = applyAttendancePenalty(student.averageGrade, totalAbsences)
    
    // Calculate status using adjusted average
    const calculatedStatus = getGradeStatus(adjustedAverageGrade, classLevel)
    
    // Validate student data
    if (!student.firstName || !student.lastName) {
      throw new Error('Invalid student data: missing name information')
    }
    
    console.log(`Generating HTML for student: ${student.firstName} ${student.lastName}`)
    console.log(`Total absences: ${totalAbsences} ដង, Original average: ${student.averageGrade}, Adjusted average: ${adjustedAverageGrade}`)
  
  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>លទ្ធផលនៃការសិក្សាប្រចាំខែ</title>
  <style>
    /* Khmer font definitions */
    @font-face {
      font-family: 'Khmer MEF2';
      src: url('/fonts/khmer_mef2_regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Khmer OS Siemreap';
      src: url('/fonts/khmer_os_siemreap.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
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
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      margin-bottom: 5px;
    }

    .nation-religion-king {
      font-size: 13pt;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      margin-bottom: 15px;
    }

    .report-title {
      font-size: 13pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      margin-bottom: 10px;
    }

    .class-info {
      font-size: 10pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      margin-bottom: 5px;
    }

    .student-name {
      padding-top: 10px;
      font-size: 12pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }

    .header-right {
      flex: 0 0 80px;
      text-align: center;
    }

    .student-photo {
      width: 96px;
      height: 128px;
      object-fit: cover;
      border-radius: 0;
      border: 2px solid #333;
      margin-right: 20px;
    }

    .photo-placeholder {
      width: 96px;
      height: 128px;
      border: 2px solid #333;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      background: #f5f5f5;
      margin-right: 20px;
    }

    .subject-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      border: 1px solid #333;
      font-size: 9pt;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      table-layout: fixed;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 2px solid #333;
      border-top: none;
      font-size: 9pt;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
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
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
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
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      margin-bottom: 15px;
    }

    .signature-line {
      height: 20px;
      margin-bottom: 10px;
      white-space: nowrap;
      font-size: 9pt;
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
        <div class="report-title">លទ្ធផលនៃការសិក្សាប្រចាំខែ ${monthName} ឆ្នាំ ${data.year}</div>
        <div class="class-info">ថ្នាក់ទី ${data.class}${data.section}</div>
        <div class="student-name">${student.lastName} ${student.firstName}</div>
      </div>
      
      <div class="header-right">
        ${student.photo ? 
          `<img src="${student.photo}" alt="Student Photo" class="student-photo" />` : 
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
        ${adjustedSubjects.map((subject: any) => `
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
          <td class="grade-value" style="width: 25%;">សរុបពិន្ទុប្រចាំខែ</td>
          <td class="grade-value" style="width: 25%;">${round(adjustedTotalGrade, 2)}</td>
          <td class="grade-value" style="width: 25%;">មធ្យមភាគពិន្ទុប្រចាំខែ</td>
          <td class="grade-value" style="width: 25%;">${round(adjustedAverageGrade, 2)}</td>
        </tr>
        
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">ចំណាត់ថ្នាក់</td>
          <td class="grade-value" style="width: 25%;">${studentRank}</td>
          <td class="grade-value" style="width: 25%;">និទ្ទេស</td>
          <td class="grade-value" style="width: 25%;">${calculatedStatus}</td>
        </tr>
        
        <!-- Attendance Row -->
        <tr class="attendance-row">
          <td colspan="4">អវត្តមានប្រចាំខែ ${monthName} យឺត: ${student.attendance.late} ដង ច្បាប់: ${student.attendance.excused} ដង ឥតច្បាប់: ${student.attendance.absent} ដង សរុប: ${(student.attendance.excused * 0.5) + student.attendance.absent} ដង</td>
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
        <div class="signature-line">${reportDate}</div>
        <div class="signature-line">គ្រូបន្ទុកថ្នាក់</div>
      </div>
    </div>
  </div>
</body>
</html>
  `
  } catch (error) {
    console.error('Error generating HTML for monthly gradebook report:', error)
    throw new Error(`Failed to generate HTML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Generate PDF for Monthly Gradebook Report
export async function generateMonthlyGradebookReportPDF(data: MonthlyGradebookReportData, options: ReportOptions = {
  format: 'A4',
  orientation: 'portrait',
  margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
  includeHeader: true,
  includeFooter: true
}): Promise<Buffer> {
  const html = generateMonthlyGradebookReportHTML(data)
  
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
      waitUntil: 'domcontentloaded', // Changed from networkidle0 for faster rendering
      timeout: 90000 // Increased timeout for complex calculations
    })
    
    // Wait for fonts to render
    await new Promise(resolve => setTimeout(resolve, 2000))
    
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
