/*
 * Semester Attendance Report PDF Generator
 * 
 * Generates comprehensive semester attendance reports for students, classes, or the entire school.
 * Supports grade filtering and semester statistics aggregation.
 */

import puppeteer from 'puppeteer'
import { PDFResult, ReportOptions, AttendanceData, StudentData } from '../core/types'
import {
  mergeReportOptions,
  getLogoBase64,
  generateHTMLFooter,
  getGradeLabel,
  getGenderKhmer,
  formatDateKhmer,
  formatDateKhmerShort,
  getAttendanceStatusKhmer,
  DEFAULT_CONFIG
} from '../core/utils'

// Semester attendance report data interfaces
export interface SemesterAttendanceReportData {
  reportType: 'semester'
  title: string
  semester: string
  academicYear: string
  class?: string
  grade?: string
  schoolName: string
  totalStudents: number
  totalPresent: number
  totalAbsent: number
  totalLate: number
  totalExcused: number
  attendanceRate: number
  students: Array<{
    studentId: string
    firstName: string
    lastName: string
    class: string
    gender: string
    semesterStats: {
      presentDays: number
      absentDays: number
      lateDays: number
      excusedDays: number
      totalDays: number
      attendanceRate: number
    }
    details: Array<{
      date: string
      attendanceDate: Date
      status: 'present' | 'absent' | 'late' | 'excused'
      session?: 'AM' | 'PM' | 'FULL'
      courseName: string
      remarks?: string
    }>
  }>
  summary: {
    byClass: Array<{
      className: string
      totalStudents: number
      attendanceRate: number
      present: number
      absent: number
      late: number
      excused: number
    }>
    byStatus: {
      present: number
      absent: number
      late: number
      excused: number
    }
    trends: Array<{
      month: string
      attendanceRate: number
      present: number
      absent: number
      late: number
      excused: number
    }>
  }
}

// Generate HTML content for semester attendance report
export const generateSemesterAttendanceReportHTML = (data: SemesterAttendanceReportData): string => {
  const reportTitle = data.title || 'របាយការណ៍អវត្តមានប្រចាំឆមាស'
  const logoBase64 = getLogoBase64(data.class)
  
  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
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
    
    /* Base font configuration */
    * {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }
    
    body {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }
    
    /* Page setup for A4 with custom margins: top/bottom 10mm, left/right 5mm */
    @page {
      size: A4;
      margin: 10mm 5mm 10mm 5mm;
    }
    
    /* Base document styles */
    .document {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background: white;
    }
    
    /* Custom styles for semester report layout */
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    
    .logo-section {
      flex: 0 0 auto;
      text-align: center;
      padding-left: 50px;
    }
    
    .logo-section img {
      width: 100px;
      height: 100px;
      object-fit: contain;
      display: block;
      margin: 0 auto;
    }
    
    .school-name {
      font-size: 16px;
      margin-top: 8px;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
    }
    
    .national-section {
      flex: 1;
      text-align: center;
      padding-left: 200px;
    }
    
    .national-title {
      font-size: 18px;
      margin-bottom: 5px;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
    }
    
    .national-subtitle {
      font-size: 16px;
      font-weight: normal;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
    }
    
    .report-title {
      text-align: center;
      font-size: 18px;
      margin: 2px 0;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      page-break-after: avoid;
    }
    
    .report-title-single {
      font-size: 18px;
      font-weight: normal;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
    }
    
    .semester-info {
      text-align: center;
      font-size: 14px;
      margin-bottom: 15px;
      color: #666;
    }
    
    .attendance-table {
      width: 100%;
      border-collapse: collapse;
      margin: 5px 0;
    }
    
    .attendance-table th,
    .attendance-table td {
      border: 1px solid #000;
      padding: 4px;
      text-align: center;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 10px;
    }
    
    .attendance-table th {
      background-color: #f0f0f0;
    }
    
    .summary-section {
      margin-top: 30px;
      padding: 15px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
    }
    
    .summary-title {
      font-size: 18px;
      font-weight: normal;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .summary-grid {
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: 15px;
    }
    
    .summary-item {
      text-align: center;
      padding: 10px 20px;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 5px;
      flex: 1;
    }
    
    .summary-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .summary-value {
      font-size: 18px;
      font-weight: normal;
      color: #333;
    }
    
    /* Class grouping styles */
    .class-section {
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    
    /* No data message styles */
    .no-data-section {
      text-align: center;
      padding: 40px 20px;
      background-color: #f9f9f9;
      border: 2px dashed #ccc;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .no-data-icon {
      font-size: 48px;
      color: #999;
      margin-bottom: 20px;
    }
    
    .no-data-title {
      font-size: 20px;
      font-weight: normal;
      color: #666;
      margin-bottom: 15px;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
    }
    
    .no-data-message {
      font-size: 16px;
      color: #888;
      margin-bottom: 20px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header-section">
      <div class="logo-section">
        ${logoBase64 ? `<img src="${logoBase64}" alt="សាលាមិត្តភាព" />` : '<div class="logo-placeholder">សាលាមិត្តភាព</div>'}
        <div class="school-name">សាលាមិត្តភាព</div>
      </div>
      
      <div class="national-section">
        <div class="national-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
        <div class="national-subtitle">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
      </div>
    </div>
    
    <div class="report-title">
      <div class="report-title-single">បញ្ជីអវត្តមានសិស្ស ${getSemesterRangeText(data)}</div>
    </div>
    
    ${data.students.length > 0 ? generateClassGroupedTables(data) : generateNoDataMessage(data)}
    
    <div class="summary-section">
      <div class="summary-title">សរុបរបាយការណ៍ឆមាស ${getSemesterName(data.semester)}</div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">យឺត</div>
          <div class="summary-value">${data.totalLate} ដង</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">អវត្តមាន(មានច្បាប់)</div>
          <div class="summary-value">${data.totalExcused} ដង</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">អវត្តមាន(ឥតច្បាប់)</div>
          <div class="summary-value">${data.totalAbsent} ដង</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">សរុប</div>
          <div class="summary-value">${(data.totalExcused * 0.5) + data.totalAbsent} ដង</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`

  return html
}

// Generate no data message for semester report
function generateNoDataMessage(data: SemesterAttendanceReportData): string {
  const semesterName = getSemesterName(data.semester)
  const errorMessage = (data as any).errorMessage || `គ្មានទិន្នន័យសម្រាប់ឆមាស ${semesterName}/${data.academicYear}។ សូមជ្រើសរើសឆមាសដែលមានទិន្នន័យ។`
  
  return `
    <div class="no-data-section">
      <div class="no-data-icon">📊</div>
      <div class="no-data-title">គ្មានទិន្នន័យ</div>
      <div class="no-data-message">${errorMessage}</div>
    </div>
  `
}

// Generate class grouped tables for semester report
function generateClassGroupedTables(data: SemesterAttendanceReportData): string {
  const studentsByClass = data.students.reduce((acc, student) => {
    const className = student.class
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(student)
    return acc
  }, {} as Record<string, typeof data.students>)

  const sortedClasses = Object.keys(studentsByClass).sort()

  return sortedClasses.map(className => {
    const classStudents = studentsByClass[className]
      .sort((a, b) => {
        // Khmer alphabet order: consonants + independent vowels
        // ក ខ គ ឃ ង ច ឆ ជ ឈ ញ ដ ឋ ឌ ឍ ណ ត ថ ទ ធ ន ប ផ ព ភ ម យ រ ល វ ស ហ ឡ អ
        // ស្រៈពេញតួ: អ អា ឥ ឦ ឧ ឨ ឩ ឪ ឫ ឬ ឭ ឮ ឯ ឰ ឱ ឲ ឳ
        const khmerOrder = 'កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអអាឥឦឧឨឩឪឫឬឭឮឯឰឱឲឳ';
        const getKhmerSortValue = (char: string): number => {
          const index = khmerOrder.indexOf(char);
          return index === -1 ? 999 : index;
        };
        
        const getSortKey = (text: string): number[] => {
          return Array.from(text).map(char => getKhmerSortValue(char));
        };
        
        // Compare last names first
        const aLastKey = getSortKey(a.lastName);
        const bLastKey = getSortKey(b.lastName);
        
        for (let i = 0; i < Math.max(aLastKey.length, bLastKey.length); i++) {
          const aVal = aLastKey[i] || 999;
          const bVal = bLastKey[i] || 999;
          if (aVal !== bVal) return aVal - bVal;
        }
        
        // If last names are equal, compare first names
        const aFirstKey = getSortKey(a.firstName);
        const bFirstKey = getSortKey(b.firstName);
        
        for (let i = 0; i < Math.max(aFirstKey.length, bFirstKey.length); i++) {
          const aVal = aFirstKey[i] || 999;
          const bVal = bFirstKey[i] || 999;
          if (aVal !== bVal) return aVal - bVal;
        }
        
        return 0;
      })
    const classLabel = getGradeLabel(className)

    return `
      <div class="class-section">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>ល.រ</th>
              <th>ឈ្មោះ</th>
              <th>ភេទ</th>
              <th>ប្រភេទ</th>
              <th>ពេលវេលា</th>
              <th>កាលបរិច្ឆេទ</th>
              <th>មូលហេតុ</th>
            </tr>
          </thead>
          <tbody>
            ${classStudents.flatMap((student, studentIndex) => {
              // Get all attendance records for this student
              const attendanceRecords = student.details
                .filter(detail => detail.status === 'present' || detail.status === 'absent' || detail.status === 'late' || detail.status === 'excused')
                .sort((a, b) => new Date(a.attendanceDate).getTime() - new Date(b.attendanceDate).getTime())
              
              // If no attendance records, show one row with semester info
              if (attendanceRecords.length === 0) {
                return `
                  <tr>
                    <td>${studentIndex + 1}</td>
                    <td>${student.lastName} ${student.firstName}</td>
                    <td>${getGenderKhmer(student.gender)}</td>
                    <td>អវត្តមាន</td>
                    <td>មួយថ្ងៃ</td>
                    <td>ឆមាស ${getSemesterName(data.semester)} ${data.academicYear}</td>
                    <td>មិនបានបញ្ជាក់</td>
                  </tr>
                `
              }
              
              // Create a separate row for each attendance record with merged cells
              return attendanceRecords.map((record, recordIndex) => {
                const rowNumber = studentIndex + 1
                const sessionTime = record.session ? getSessionTime(record.session) : 'មួយថ្ងៃ'
                const reason = record.remarks && record.remarks.trim() ? record.remarks.trim() : 'មិនបានបញ្ជាក់'
                const rowspan = attendanceRecords.length
                
                return `
                  <tr>
                    ${recordIndex === 0 ? `<td rowspan="${rowspan}">${rowNumber}</td>` : ''}
                    ${recordIndex === 0 ? `<td rowspan="${rowspan}">${student.lastName} ${student.firstName}</td>` : ''}
                    ${recordIndex === 0 ? `<td rowspan="${rowspan}">${getGenderKhmer(student.gender)}</td>` : ''}
                    <td>${getAttendanceStatusKhmer(record.status)}</td>
                    <td>${sessionTime}</td>
                    <td>${formatDateKhmerShort(record.attendanceDate)}</td>
                    <td>${reason}</td>
                  </tr>
                `
              })
            }).join('')}
          </tbody>
        </table>
      </div>
    `
  }).join('')
}

// Generate semester attendance report PDF
export async function generateSemesterAttendanceReportPDF(
  data: SemesterAttendanceReportData,
  options?: Partial<ReportOptions>
): Promise<PDFResult> {
  try {
    const htmlContent = generateSemesterAttendanceReportHTML(data)
    const reportOptions = mergeReportOptions(options)
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      await page.setDefaultTimeout(60000)
      await page.setDefaultNavigationTimeout(60000)
      
      // Set proper encoding and viewport
      await page.setViewport({ width: 1200, height: 800 })
      await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })
      
      // Wait for fonts to load
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simple approach: Let Puppeteer handle page breaks naturally
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '5mm',
          bottom: '10mm',
          left: '5mm'
        },
        preferCSSPageSize: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 5mm 0 0; margin: 0;">
            បញ្ជីអវត្តមានសិស្ស
          </div>
        `,
        footerTemplate: `
          <div style="font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 5mm 0 0; margin: 0;">
            ទំព័រទី <span class="pageNumber"></span> នៃ <span class="totalPages"></span>
          </div>
        `
      })

      return {
        buffer: Buffer.from(pdfBuffer),
        size: pdfBuffer.length,
        generatedAt: new Date()
      }
    } finally {
      await browser.close()
    }
  } catch (error) {
    throw new Error(`Failed to generate semester attendance report PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper functions
function getSemesterText(data: SemesterAttendanceReportData): string {
  const semesterName = getSemesterName(data.semester)
  return `ឆមាស ${semesterName} ឆ្នាំសិក្សា ${data.academicYear}`
}

function getSemesterName(semester: string): string {
  switch (semester) {
    case '1':
      return 'ទី ១'
    case '2':
      return 'ទី ២'
    default:
      return semester
  }
}

function getSemesterRangeText(data: SemesterAttendanceReportData): string {
  const semesterName = getSemesterName(data.semester)
  const classLabel = data.class ? getGradeLabel(data.class) : 'ថ្នាក់ទី N/A'
  return `${classLabel} ឆមាស ${semesterName} ឆ្នាំ${data.academicYear}`
}

function getSessionTime(session: string): string {
  switch (session) {
    case 'AM':
      return 'ពេលព្រឹក'
    case 'PM':
      return 'ពេលថ្ងៃ'
    case 'FULL':
      return 'មួយថ្ងៃ'
    default:
      return 'គ្មានពេលវេលា'
  }
}

function getMonthName(month: string): string {
  const monthNames = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  const monthIndex = parseInt(month) - 1
  return monthNames[monthIndex] || month
}

function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  
  // Khmer month names
  const monthNames = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  
  const day = d.getDate()
  const month = monthNames[d.getMonth()]
  const year = d.getFullYear()
  
  return `${day} ${month} ${year}`
}