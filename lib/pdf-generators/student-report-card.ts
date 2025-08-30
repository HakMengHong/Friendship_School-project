/*
 * Student Report Card PDF Generator
 * 
 * Generates professional student report cards with grades,
 * attendance, and teacher comments.
 */

import puppeteer from 'puppeteer'
import { PDFResult, ReportOptions } from './types'
import {
  generateSafeFilename,
  savePDFFile,
  mergeReportOptions,
  generateHTMLHeader,
  generateHTMLFooter,
  getGradeLabel,
  getGenderKhmer,
  formatDateKhmer,
  DEFAULT_CONFIG
} from './utils'

// Student report card data interface
export interface StudentReportCardData {
  studentId: string
  firstName: string
  lastName: string
  gender: string
  class: string
  schoolYear: string
  semester: string
  reportDate: string
  grades: Array<{
    subjectName: string
    score: number
    grade: string
    remarks: string
  }>
  attendance: {
    totalDays: number
    presentDays: number
    absentDays: number
    lateDays: number
    attendanceRate: number
  }
  teacherComments: string
  principalComments: string
  overallGrade: string
  rankInClass?: number
  totalStudents?: number
}

// Generate HTML content for student report card
export const generateStudentReportCardHTML = (data: StudentReportCardData): string => {
  const studentFullName = `${data.lastName || ''} ${data.firstName || ''}`.trim()
  const genderText = getGenderKhmer(data.gender || '')
  const classLabel = getGradeLabel(data.class)

  const html = generateHTMLHeader('របាយការណ៍វិញ្ញាបនបត្រសិស្ស') + `
    <div class="section">
      <div class="section-title">ព័ត៌មានសិស្ស</div>
      <div class="student-summary">
        ឈ្មោះសិស្ស: <strong>${studentFullName || '........................'}</strong> | 
        ភេទ: <strong>${genderText || '......'}</strong> | 
        ថ្នាក់: <strong>${classLabel}</strong> | 
        ឆ្នាំសិក្សា: <strong>${data.schoolYear || ''}</strong> | 
        សម្គាល់: <strong>${data.semester || ''}</strong>
      </div>
    </div>

    <div class="section">
      <div class="section-title">ពិន្ទុវិញ្ញាបនបត្រ</div>
      <table class="table">
        <thead>
          <tr>
            <th>មុខវិជ្ជា</th>
            <th>ពិន្ទុ</th>
            <th>ថ្នាក់</th>
            <th>យោបល់</th>
          </tr>
        </thead>
        <tbody>
          ${data.grades.map(grade => `
            <tr>
              <td>${grade.subjectName}</td>
              <td>${grade.score}</td>
              <td>${grade.grade}</td>
              <td>${grade.remarks}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">ការចូលរួម</div>
      <div class="attendance-summary">
        ថ្ងៃសរុប: <strong>${data.attendance.totalDays}</strong> | 
        ថ្ងៃមក: <strong>${data.attendance.presentDays}</strong> | 
        ថ្ងៃអវត្តមាន: <strong>${data.attendance.absentDays}</strong> | 
        ថ្ងៃមកយឺត: <strong>${data.attendance.lateDays}</strong> | 
        អត្រាចូលរួម: <strong>${data.attendance.attendanceRate}%</strong>
      </div>
    </div>

    <div class="section">
      <div class="section-title">យោបល់គ្រូ</div>
      <div class="teacher-comments">
        ${data.teacherComments || 'មិនមានយោបល់'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">យោបល់នាយិកា</div>
      <div class="principal-comments">
        ${data.principalComments || 'មិនមានយោបល់'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">សរុប</div>
      <div class="overall-summary">
        ថ្នាក់សរុប: <strong>${data.overallGrade}</strong>
        ${data.rankInClass ? `| ចំណាត់ថ្នាក់ក្នុងថ្នាក់: <strong>${data.rankInClass}/${data.totalStudents}</strong>` : ''}
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-grid">
        <div class="signature-cell">
          <div class="signature-box">
            <div class="signature-label">ហត្ថលេខាគ្រូ</div>
            <div class="signature-line"></div>
            <div class="signature-name">ឈ្មោះ</div>
          </div>
        </div>
        <div class="signature-cell">
          <div class="signature-box">
            <div class="signature-label">ហត្ថលេខានាយិកា</div>
            <div class="signature-line"></div>
            <div class="signature-name">ឈ្មោះ</div>
          </div>
        </div>
      </div>
    </div>

    <div class="date">
      កាលបរិច្ឆេទ: ${formatDateKhmer(data.reportDate)}
    </div>
  ` + generateHTMLFooter()

  return html
}

// Generate student report card PDF
export const generateStudentReportCardPDF = async (
  data: StudentReportCardData,
  options?: Partial<ReportOptions>
): Promise<PDFResult> => {
  const htmlContent = generateStudentReportCardHTML(data)
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
      '--disable-font-subpixel-positioning'
    ]
  })

  try {
    const page = await browser.newPage()
    await page.setDefaultTimeout(60000)
    await page.setDefaultNavigationTimeout(60000)
    
    await page.setViewport({ width: 1200, height: 800 })
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const pdfBuffer = await page.pdf({
      format: reportOptions.format,
      printBackground: true,
      margin: reportOptions.margins,
      preferCSSPageSize: false
    })

    const studentName = `${data.lastName || ''} ${data.firstName || ''}`.trim() || 'Unknown'
    const filename = generateSafeFilename(
      'student-report-card',
      `${data.studentId}-${studentName}-${data.semester}`,
      'pdf',
      DEFAULT_CONFIG.includeTimestamp
    )
    
    const filePath = savePDFFile(pdfBuffer, DEFAULT_CONFIG.outputDir, filename)
    
    return {
      buffer: Buffer.from(pdfBuffer),
      filename,
      filePath,
      size: pdfBuffer.length,
      generatedAt: new Date()
    }
  } finally {
    await browser.close()
  }
}
