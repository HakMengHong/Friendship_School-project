/*
 * Daily Attendance Report PDF Generator
 * 
 * Generates comprehensive daily attendance reports for students, classes, or the entire school.
 * Supports grade filtering and date range formatting.
 */

import puppeteer from 'puppeteer'
import { PDFResult, ReportOptions, AttendanceData, StudentData } from '../core/types'
import {
  mergeReportOptions,
  getLogoBase64,
  getStudentRegistrationCSS,
  generateHTMLFooter,
  getGradeLabel,
  getGenderKhmer,
  formatDateKhmer,
  getAttendanceStatusKhmer,
  DEFAULT_CONFIG
} from '../core/utils'

// Daily attendance report data interfaces
export interface AttendanceReportData {
  reportType: 'daily' | 'monthly' | 'yearly' | 'semester'
  title: string
  date: string
  startDate?: string
  endDate?: string
  academicYear?: string
  month?: string
  year?: string
  semester?: string
  yearly?: string
  class?: string
  schoolName: string
  errorMessage?: string
  availableMonths?: string[]
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
    attendance: {
      present: number
      absent: number
      late: number
      excused: number
      total: number
      rate: number
    }
    monthlyStats?: {
      totalDays: number
      presentDays: number
      absentDays: number
      lateDays: number
      excusedDays: number
      attendanceRate: number
    }
    details: Array<{
      date: string
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
      period: string
      attendanceRate: number
      totalStudents: number
    }>
  }
}

// Generate HTML content for daily attendance report
export const generateAttendanceReportHTML = (data: AttendanceReportData): string => {
  const reportTitle = data.title || 'បញ្ជីអវត្តមាន'
  const periodText = getPeriodText(data)
  
  const logoBase64 = getLogoBase64(data.class)
  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@100;200;300;400;500;600;700;800;900&display=swap');
    
    /* Base font configuration */
    * {
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
    }
    
    body {
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
    }
    
    /* Custom styles for attendance report - not using getStudentRegistrationCSS to avoid font conflicts */
    
    /* Page setup for A4 with 5mm margins */
    @page {
      size: A4;
      margin: 10mm 10mm 10mm 10mm;
    }
    
    /* Base document styles */
    .document {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background: white;
      min-height: 100vh;
    }
    
    /* Custom styles for the new layout */
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
    
    .school-name {
      font-size: 16px;
      margin-top: 8px;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
    }
    
    .national-section {
      flex: 1;
      text-align: center;
      padding-left: 200px;
    }
    
    .national-title {
      font-size: 18px;
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
    
    .report-title-line1 {
      font-size: 18px;
      font-weight: normal;
      margin-bottom: 5px;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
    }
    
    .report-title-line2 {
      font-size: 14px;
      font-weight: normal;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
    }
    
    .attendance-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    
    .attendance-table th,
    .attendance-table td {
      border: 1px solid #000;
      padding: 7px;
      text-align: center;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      font-size: 12px;
    }
    
    .attendance-table th {
      background-color: #f0f0f0;
 
    }
    
    .class-section {
      margin-bottom: 5px;
    }
    
    .class-title {
      font-size: 16px;
      text-align: center;
      text-transform: underline;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
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
      <div class="report-title-line1">បញ្ជីអវត្តមានសិស្ស</div>
      <div class="report-title-line2">${getDateRangeText(data)}</div>
    </div>
    
    ${generateClassGroupedTables(data)}
  </div>
</body>
</html>`

  return html
}

// Generate class-grouped tables for daily attendance report
function generateClassGroupedTables(data: AttendanceReportData): string {
  // Group students by class
  const studentsByClass = data.students.reduce((acc, student) => {
    const className = student.class
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(student)
    return acc
  }, {} as Record<string, typeof data.students>)

  // Sort classes alphabetically
  const sortedClasses = Object.keys(studentsByClass).sort()

  return sortedClasses.map(className => {
    const classStudents = studentsByClass[className]
      .sort((a, b) => {
        // Sort by last name first, then first name
        const nameA = `${a.lastName} ${a.firstName}`.toLowerCase()
        const nameB = `${b.lastName} ${b.firstName}`.toLowerCase()
        return nameA.localeCompare(nameB, 'km')
      })
    const classLabel = getGradeLabel(className)
    
    return `
      <div class="class-section">
        <div class="class-title">${classLabel}</div>
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
            ${classStudents.map((student, index) => {
              const detail = student.details && student.details.length > 0 ? student.details[0] : null
              return `
              <tr>
                <td>${index + 1}</td>
                <td>${student.lastName} ${student.firstName}</td>
                <td>${getGenderKhmer(student.gender)}</td>
                <td>${getAttendanceStatusKhmer(detail?.status || 'present')}</td>
                <td>${getSessionTime(detail?.session || 'AM')}</td>
                <td>${formatDateShort(detail?.date || data.date)}</td>
                <td>${detail?.remarks || '-'}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    `
  }).join('')
}

// Generate daily attendance report PDF
export const generateAttendanceReportPDF = async (
  data: AttendanceReportData,
  options?: Partial<ReportOptions>
): Promise<PDFResult> => {
  const htmlContent = generateAttendanceReportHTML(data)
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
    
    // Simple approach: Let Puppeteer handle page breaks naturally
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
function getDateRangeText(data: AttendanceReportData): string {
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    
    // Khmer month names
    const monthNames = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ]
    
    const startDay = startDate.getDate()
    const startMonth = monthNames[startDate.getMonth()]
    const startYear = startDate.getFullYear()
    
    const endDay = endDate.getDate()
    const endMonth = monthNames[endDate.getMonth()]
    const endYear = endDate.getFullYear()
    
    return `ថ្ងៃទី${startDay} ខែ${startMonth} ឆ្នាំ${startYear} ដល់ ថ្ងៃទី${endDay} ខែ${endMonth} ឆ្នាំ${endYear}`
  } else if (data.date) {
    // Fallback to single date if no date range
    const date = new Date(data.date)
    const monthNames = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ]
    
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    
    return `ថ្ងៃទី${day} ខែ${month} ឆ្នាំ${year}`
  } else {
    return 'ថ្ងៃមិនបានបញ្ជាក់'
  }
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
  
  return `${day}, ${month} ${year}`
}

function getPeriodText(data: AttendanceReportData): string {
  switch (data.reportType) {
    case 'daily':
      return formatDateKhmer(data.date)
    case 'monthly':
      return `${data.month}/${data.year}`
    case 'yearly':
      return data.academicYear || data.year || ''
    default:
      // For date range format like "25/8/2025 ដល់ 26/8/2025"
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)
        const startDay = startDate.getDate()
        const startMonth = startDate.getMonth() + 1
        const startYear = startDate.getFullYear()
        const endDay = endDate.getDate()
        const endMonth = endDate.getMonth() + 1
        const endYear = endDate.getFullYear()
        return `${startDay}/${startMonth}/${startYear} ដល់ ${endDay}/${endMonth}/${endYear}`
      }
      return formatDateKhmer(data.date)
  }
}

function getReportTypeText(type: string): string {
  switch (type) {
    case 'daily':
      return 'របាយការណ៍ប្រចាំថ្ងៃ'
    case 'monthly':
      return 'របាយការណ៍ប្រចាំខែ'
    case 'yearly':
      return 'របាយការណ៍ប្រចាំឆ្នាំ'
    default:
      return 'របាយការណ៍អវត្តមាន'
  }
}
