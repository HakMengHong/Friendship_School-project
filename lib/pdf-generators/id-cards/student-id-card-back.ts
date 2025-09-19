import { getStudentRegistrationCSS, getLogoBase64, getGradeLabel, formatDateKhmer, getGenderKhmer, mergeReportOptions } from '../core/utils'
import { formatPhoneNumber } from './utils'
import { ReportOptions, PDFResult } from '../core/types'
import puppeteer from 'puppeteer'

export interface GuardianBackInfo {
  name: string
  relation: string
  phone: string
}

export interface StudentIDCardBackData {
  studentId: number
  firstName: string
  lastName: string
  gender: string
  dob: string
  class: string
  classDisplay?: string
  photo?: string | null
  phone?: string | null
  schoolYear: string
  studentIdNumber: string
  generatedAt: string
  teacherName?: string
  teacherPhone?: string
  courseName?: string
  section?: string
  guardian?: GuardianBackInfo
}

export interface BulkStudentIDCardBackData {
  students: StudentIDCardBackData[]
  schoolYear: string
  generatedAt: string
}

// Generate back side of ID card with contact information
export function generateStudentIDCardBackHTML(data: StudentIDCardBackData): string {
  const studentFullName = `${data.lastName || ''} ${data.firstName || ''}`.trim()
  const displayClass = data.classDisplay || data.class || 'ថ្នាក់ទី 1A'
  
  const logoBase64 = getLogoBase64(data.class)
  
  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ប័ណ្ណសម្គាល់ខ្លួនសិស្សសាលាមិត្តភាព - បញ្ជីទំនាក់ទំនង</title>
  <style>
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
    }
    
    ${getStudentRegistrationCSS()}
    
    /* Back ID Card Styles - 282x407px (portrait) */
    .id-card-back-container {
      width: 282px;
      height: 407px;
      margin: 0 auto;
      background: white;
      border: 5px solid #2563eb;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      display: flex;
      flex-direction: column;
    }
    
    /* Header with logo and school name */
    .back-header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 15px;
      text-align: center;
      position: relative;
    }
    
    .back-logo {
       width: 90px;
       height: 90px;
       margin: 0 auto;
       background: white;
       border-radius: 50%;
       box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
       border: 3px solid white;
    }
    
    .back-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    
    /* Title section */
    .back-title-section {
      background: #f8fafc;
      padding: 12px 15px;
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .back-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e40af;
      margin: 0;
    }
    
    .back-student-id {
      font-size: 11px;
      color: #64748b;
      margin: 4px 0 0 0;
    }
    
    /* Contact information section */
    .back-contact-section {
      flex: 1;
      padding: 15px;
      background: white;
    }
    
    .back-contact-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2px;
    }
    
    .back-contact-table th {
      background: #f1f5f9;
      color: #1e40af;
      font-size: 12px;
      font-weight: bold;
      padding: 6px 5px;
      text-align: center;
      border: 1px solid #cbd5e1;
    }
    
    .back-contact-table td {
      padding: 6px 5px;
      font-size: 11px;
      text-align: center;
      border: 1px solid #e2e8f0;
      background: white;
    }
    
    .back-contact-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    
    /* Footer */
    .back-footer {
      background: #f1f5f9;
      padding: 8px 15px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    
    .back-footer-text {
      font-size: 10px;
      color: #64748b;
      margin: 0;
    }
    
    /* Responsive adjustments */
    @media print {
      .id-card-back-container {
        width: 282px !important;
        height: 407px !important;
      }
    }
  </style>
</head>
<body>
  <div class="id-card-back-container">
    <!-- Header -->
    <div class="back-header">
      <div class="back-logo">
        ${logoBase64 ? `<img src="${logoBase64}" alt="School Logo">` : ''}
      </div>
    </div>
    
    <!-- Title Section -->
    <div class="back-title-section">
      <h3 class="back-title">បញ្ជីទំនាក់ទំនង</h3>
      <p class="back-student-id">ID: ${data.studentIdNumber}</p>
    </div>
    
    <!-- Contact Information -->
    <div class="back-contact-section">
      <table class="back-contact-table">
        <thead>
          <tr>
            <th>ឈ្នោះ</th>
            <th>ត្រូវជា</th>
            <th>លេខទូរស័ព្ទ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${data.guardian?.name || 'មិនមាន'}</td>
            <td>${data.guardian?.relation || 'មិនមាន'}</td>
            <td>${formatPhoneNumber(data.guardian?.phone) || 'មិនមាន'}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Footer -->
    <div class="back-footer">
      <p class="back-footer-text">សាលាមិត្តភាព - ឆ្នាំសិក្សា ${data.schoolYear}</p>
    </div>
  </div>
</body>
</html>
  `
  
  return html
}

// Generate bulk back ID cards HTML
export function generateBulkStudentIDCardBackHTML(data: BulkStudentIDCardBackData): string {
  // Split students into pages of 4 (2x2 grid)
  const studentsPerPage = 4
  const pages = []
  
  for (let i = 0; i < data.students.length; i += studentsPerPage) {
    const pageStudents = data.students.slice(i, i + studentsPerPage)
    // Only add page if it has students
    if (pageStudents.length > 0) {
      pages.push(pageStudents)
    }
  }

  const pageHTML = pages.map(pageStudents => {
    const studentCards = pageStudents.map(student => {
      return generateStudentIDCardBackHTML(student)
    }).join('')

    // Add placeholder cards to fill the 2x2 grid (4 cards per page)
    const placeholdersNeeded = 4 - pageStudents.length
    const placeholderCards = Array(placeholdersNeeded).fill(0).map(() => 
      '<div class="id-card-placeholder"></div>'
    ).join('')

    return `
      <div class="page">
        <div class="cards-grid">
          ${studentCards}${placeholderCards}
        </div>
      </div>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ប័ណ្ណសម្គាល់ខ្លួនសិស្សសាលាមិត្តភាព - បញ្ជីទំនាក់ទំនង</title>
  <style>
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
    }
    
    ${getStudentRegistrationCSS()}
    
    /* Page Layout for Bulk Generation */
    .page {
      width: 8.27in;
      height: 11.69in;
      page-break-after: always;
      margin: 0;
      padding: 0;
      position: relative;
      overflow: hidden;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 20px;
      padding: 20px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
    }
    
    /* Empty placeholder for incomplete pages */
    .id-card-placeholder {
      width: 282px;
      height: 407px;
      background: transparent;
      border: none;
    }
  </style>
</head>
<body>
  ${pageHTML}
</body>
</html>
  `
}

// Generate back ID card PDF
export async function generateStudentIDCardBackPDF(data: StudentIDCardBackData, options?: ReportOptions): Promise<PDFResult> {
  const mergedOptions = mergeReportOptions(options)
  const html = generateStudentIDCardBackHTML(data)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 282, height: 407 })
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      width: '282px',
      height: '407px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
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

// Generate bulk back ID cards PDF
export async function generateBulkStudentIDCardBackPDF(data: BulkStudentIDCardBackData, options?: ReportOptions): Promise<PDFResult> {
  const mergedOptions = mergeReportOptions(options)
  const html = generateBulkStudentIDCardBackHTML(data)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123 }) // A4 size in pixels at 96 DPI
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true
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
