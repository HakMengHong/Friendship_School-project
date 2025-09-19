/*
 * Yearly Attendance Report PDF Generator
 * 
 * Generates comprehensive yearly attendance reports for students, classes, or the entire school.
 * Supports grade filtering and yearly statistics aggregation with semester breakdowns.
 */

import puppeteer from 'puppeteer'
import { PDFResult, ReportOptions } from '../core/types'
import {
  mergeReportOptions,
  getLogoBase64,
  getGradeLabel,
  getGenderKhmer,
  getAttendanceStatusKhmer,
  formatDateKhmerShort
} from '../core/utils'

// Yearly attendance report data interfaces
export interface YearlyAttendanceReportData {
  reportType: 'yearly'
  title: string
  yearly: string
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
    yearlyStats: {
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

// Generate HTML content for yearly attendance report
export const generateYearlyAttendanceReportHTML = (data: YearlyAttendanceReportData): string => {
  const logoBase64 = getLogoBase64(data.class)
  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Khmer+OS+Siemreap:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Khmer+MEF2:wght@400;700&display=swap');
    
    @font-face {
      font-family: 'Khmer OS Siemreap';
      src: url('https://fonts.googleapis.com/css2?family=Khmer+OS+Siemreap:wght@400;700&display=swap');
      font-weight: normal;
      font-style: normal;
    }
    
    @font-face {
      font-family: 'Khmer MEF2';
      src: url('https://fonts.googleapis.com/css2?family=Khmer+MEF2:wght@400;700&display=swap');
      font-weight: normal;
      font-style: normal;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: white;
    }
    
    /* Page setup for A4 with 10mm margins */
    @page {
      size: A4;
      margin: 10mm 10mm 10mm 10mm;
    }
    
    .document {
      max-width: 100%;
      margin: 0 auto;
      padding: 0;
    }
    
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
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
    
    .logo-placeholder {
      width: 100px;
      height: 100px;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      text-align: center;
      background-color: #f5f5f5;
      margin: 0 auto;
    }
    
    .school-name {
      font-size: 16px;
      margin-top: 8px;
       font-weight: normal;;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
    }
    
    .national-section {
      flex: 1;
      text-align: center;
      padding-right: 50px;
    }
    
    .national-title {
      font-size: 18px;
      font-weight: normal;
      margin-bottom: 5px;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
    }
    
    .national-subtitle {
      font-size: 16px;
      font-weight: normal;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
    }
    
    .report-title {
      text-align: center;
      font-size: 18px;
      margin: 2px 0;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
    }
    
    .report-title-single {
      font-size: 18px;
      font-weight: normal;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
    }
    
    .year-info {
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
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
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
      font-size: 14px;
       font-weight: normal;;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .summary-item {
      text-align: center;
      padding: 10px;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    
    .summary-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .summary-value {
      font-size: 14px;
       font-weight: normal;;
      color: #333;
    }
    
    .class-section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .class-title {
      font-size: 14px;
       font-weight: normal;;
      margin-bottom: 10px;
      text-align: center;
      background-color: #f0f0f0;
      padding: 8px;
      border: 1px solid #ccc;
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
       font-weight: normal;;
      color: #666;
      margin-bottom: 15px;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
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
      <div class="report-title-single">បញ្ជីអវត្តមានសិស្ស ${getYearRangeText(data)}</div>
    </div>
    
    ${data.students.length > 0 ? generateClassGroupedTables(data) : generateNoDataMessage(data)}
    
    <div class="summary-section">
      <div class="summary-title">សរុបរបាយការណ៍ឆ្នាំសិក្សា ${data.academicYear}</div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">អវត្តមាន(មានច្បាប់)សរុប</div>
          <div class="summary-value">${data.totalExcused} ដង</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">អវត្តមានសរុប</div>
          <div class="summary-value">${data.totalAbsent} ដង</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">យឺតសរុប</div>
          <div class="summary-value">${data.totalLate} ដង</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`

  return html
}

// Generate class grouped tables
function generateClassGroupedTables(data: YearlyAttendanceReportData): string {
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
        const nameA = `${a.lastName} ${a.firstName}`.toLowerCase()
        const nameB = `${b.lastName} ${b.firstName}`.toLowerCase()
        return nameA.localeCompare(nameB, 'km')
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
              
              // If no attendance records, show one row with year info
              if (attendanceRecords.length === 0) {
                return `
                  <tr>
                    <td>${studentIndex + 1}</td>
                    <td>${student.lastName} ${student.firstName}</td>
                    <td>${getGenderKhmer(student.gender)}</td>
                    <td>អវត្តមាន</td>
                    <td>មួយថ្ងៃ</td>
                    <td>ឆ្នាំសិក្សា ${data.academicYear}</td>
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

// Generate no data message
function generateNoDataMessage(data: YearlyAttendanceReportData): string {
  const errorMessage = (data as any).errorMessage || `គ្មានទិន្នន័យសម្រាប់ឆ្នាំសិក្សា ${data.academicYear}។ សូមជ្រើសរើសឆ្នាំសិក្សាដែលមានទិន្នន័យ។`
  
  return `
    <div class="no-data-section">
      <div class="no-data-icon">📊</div>
      <div class="no-data-title">គ្មានទិន្នន័យ</div>
      <div class="no-data-message">${errorMessage}</div>
    </div>
  `
}

// Generate yearly attendance report PDF
export const generateYearlyAttendanceReportPDF = async (
  data: YearlyAttendanceReportData,
  options?: Partial<ReportOptions>
): Promise<PDFResult> => {
  const htmlContent = generateYearlyAttendanceReportHTML(data)
  const reportOptions = mergeReportOptions(options)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--font-render-hinting=none',
      '--disable-font-subpixel-positioning',
      '--allow-file-access-from-files',
      '--allow-file-access'
    ]
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
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 10mm 0 0; margin: 0;">
          បញ្ជីអវត្តមានសិស្ស
        </div>
      `,
      footerTemplate: `
        <div style="font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 10mm 0 0; margin: 0;">
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
}

// Helper functions
function getYearRangeText(data: YearlyAttendanceReportData): string {
  const classLabel = data.class ? getGradeLabel(data.class) : 'ថ្នាក់ទី N/A'
  return `${classLabel} ឆ្នាំសិក្សា ${data.academicYear}`
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