import { getStudentRegistrationCSS, getLogoBase64, getGradeLabel, formatDateKhmer, getGenderKhmer, mergeReportOptions } from '../core/utils'
import { ReportOptions, PDFResult } from '../core/types'
import puppeteer from 'puppeteer'

export interface GuardianInfo {
  name: string
  relation: string
  phone: string
}

export interface StudentIDCardData {
  studentId: number
  firstName: string
  lastName: string
  gender: string
  dob: string
  class: string
  classDisplay?: string
  photo?: string
  phone?: string
  schoolYear: string
  studentIdNumber: string
  generatedAt: string
  teacherName?: string
  teacherPhone?: string
  courseName?: string
  section?: string
  guardian?: GuardianInfo
}

// Input validation function
export function validateStudentData(data: StudentIDCardData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.firstName || data.firstName.trim() === '') {
    errors.push('First name is required')
  }
  
  if (!data.lastName || data.lastName.trim() === '') {
    errors.push('Last name is required')
  }
  
  if (!data.studentId || data.studentId <= 0) {
    errors.push('Valid student ID is required')
  }
  
  if (!data.class || data.class.trim() === '') {
    errors.push('Class is required')
  }
  
  if (!data.schoolYear || data.schoolYear.trim() === '') {
    errors.push('School year is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Common card HTML generation function
function generateCardHTML(student: StudentIDCardData): string {
  const studentFullName = `${student.lastName || ''} ${student.firstName || ''}`.trim()
  const classLabel = getGradeLabel(student.class)
  const displayClass = student.classDisplay || student.class || classLabel || 'ថ្នាក់ទី 1A'
  const logoBase64 = getLogoBase64(student.class)

  return `
    <div class="id-card-container">
      <!-- Title -->
      <div class="card-title">ប័ណ្ណសម្គាល់ខ្លួនសិស្សសាលាមិត្តភាព</div>
      
      <!-- Left Section + Right Section -->
      <div class="card-content">
        <!-- Left Section -->
        <div class="left-section">
          <div class="school-logo">
            ${logoBase64 ? `<img src="${logoBase64}" alt="សាលាមិត្តភាព" />` : '<div class="photo-placeholder">សាលាមិត្តភាព</div>'}
          </div>
        </div>
        
        <!-- Right Section -->
        <div class="right-section">
          <div class="student-info">
            <div class="info-section">
              <div class="info-label">ឈ្មោះសិស្ស</div>
              <div class="info-value">${student.lastName || '........................'}</div>
              <div class="info-value">${student.firstName || '........................'}</div>
            </div>
          </div>
          <div class="student-id">ID: ${student.studentIdNumber || student.studentId.toString()}</div>
        </div>
      </div>
      
      <!-- Photo -->
      <div class="photo-section">
        <div class="student-photo">
          ${student.photo ? `<img src="${student.photo}" alt="Student Photo" />` : '<div class="photo-placeholder">3x4</div>'}
        </div>
      </div>
      
      <!-- Below Photo -->
      <div class="below-section">
        <div class="grade-teacher-info">
          <div class="grade-info">${displayClass}</div>
          <div class="teacher-name">${student.teacherName || 'គ្រូបង្រៀន'}</div>
        </div>
        <div class="teacher-phone">
          <span class="phone-label">លេខទូរស័ព្ទគ្រូ:</span> ${student.teacherPhone || student.phone || '........'}
        </div>
      </div>
    </div>
  `
}

// Standardized CSS for both single and bulk generation
function getIDCardCSS(): string {
  return `
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
      margin: 0 auto;
      background: transparent;
      border: 5px solid transparent;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
    }
    
    /* Standardized ID Card Styles - 282x407px (portrait) */
    .id-card-container {
      width: 282px;
      height: 407px;
      margin: 0 auto;
      background: white;
      border: 5px solid #2563eb;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      padding: 6px;
      box-sizing: border-box;
    }
    
    /* Background Pattern */
    .id-card-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.03) 0%, transparent 50%);
      pointer-events: none;
    }
    
    /* Title - Standardized */
    .card-title {
      text-align: center;
      font-size: 14px;
      font-weight: 700;
      color: #1e40af;
      margin: 5px 0 12px 0;
      line-height: 1.2;
      text-shadow: none;
      letter-spacing: 0.3px;
      position: relative;
      z-index: 2;
      background: #f0f0f0;
      padding: 5px 8px;
      border-radius: 10px;
      border: 1px solid #ccc;
    }
    
    /* Top Section - Left + Right */
    .card-content {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      position: relative;
      z-index: 2;
    }
    
    /* Left Section - Logo */
    .left-section {
      width: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .school-logo {
      width: 100px;
      height: 100px;
      border: 2px solid rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .school-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    /* Right Section - Student Info */
    .right-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
    }
    
    .student-info {
      font-size: 12px;
      line-height: 1.3;
    }
    
    .info-section {
      justify-content: center;
      margin-bottom: 8px;
    }
    
    .info-label {
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 2px;
      text-shadow: none;
      font-size: 12px;
      text-align: center;
    }
    
    .info-value {
      color: #1e40af;
      margin-bottom: 3px;
      font-weight: 600;
      text-shadow: none;
      font-size: 14px;
      text-align: center;
    }
    
    .student-name {
      font-size: 14px;
      font-weight: 800;
      color: #1e40af;
      text-align: center;
      background: #f0f0f0;
      padding: 6px 10px;
      margin: 8px 0;
      border-radius: 10px;
      border: 1px solid #ccc;
      text-shadow: none;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    }
    
    .student-id {
      font-size: 12px;
      font-weight: 700;
      color: #1e40af;
      text-align: center;
      background: #f0f0f0;
      padding: 5px 8px;
      margin: 2px 0;
      border-radius: 8px;
      border: 1px solid #ccc;
      text-shadow: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    /* Photo Section */
    .photo-section {
      display: flex;
      justify-content: center;
      margin: 2px 0;
      position: relative;
      z-index: 2;
    }
    
    .student-photo {
      width: 90px;
      height: 120px;
      border: 2px solid rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.15);
      position: relative;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
    }
    
    .student-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .photo-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      color: #666;
      text-align: center;
      line-height: 1.2;
      font-weight: 600;
    }
    
    /* Below Section - Grade and Teacher Info */
    .below-section {
      width: 100%;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #ccc;
      position: relative;
      z-index: 2;
    }
    
    .grade-teacher-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      gap: 6px;
    }
    
    .grade-info {
      font-size: 14px;
      font-weight: 700;
      color: #1e40af;
      text-align: center;
      background: #f0f0f0;
      padding: 5px 10px;
      border-radius: 8px;
      border: 1px solid #ccc;
      text-shadow: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      flex: 1;
    }
    
    .teacher-name {
      font-size: 14px;
      font-weight: 700;
      color: #1e40af;
      text-align: center;
      background: #f0f0f0;
      padding: 5px 10px;
      border-radius: 8px;
      border: 1px solid #ccc;
      text-shadow: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      flex: 1;
    }
    
    .teacher-phone {
      font-size: 11px;
      color: #1e40af;
      text-align: center;
      margin-top: 6px;
      text-shadow: none;
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #ccc;
    }
    
    .phone-label {
      font-weight: 700;
    }
  `
}

export function generateStudentIDCardHTML(data: StudentIDCardData): string {
  // Validate input data
  const validation = validateStudentData(data)
  if (!validation.isValid) {
    throw new Error(`Invalid student data: ${validation.errors.join(', ')}`)
  }

  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ប័ណ្ណសម្គាល់ខ្លួនសិស្សសាលាមិត្តភាព</title>
  <style>
    ${getIDCardCSS()}
  </style>
</head>
<body>
  <div class="document">
    ${generateCardHTML(data)}
  </div>
</body>
</html>
  `
  
  return html
}

export interface BulkStudentIDCardData {
  students: StudentIDCardData[]
  schoolYear: string
  generatedAt: string
}

export function generateBulkStudentIDCardHTML(data: BulkStudentIDCardData): string {
  // Validate input data
  if (!data.students || data.students.length === 0) {
    throw new Error('No students provided for bulk generation')
  }

  // Validate each student
  const validationErrors: string[] = []
  data.students.forEach((student, index) => {
    const validation = validateStudentData(student)
    if (!validation.isValid) {
      validationErrors.push(`Student ${index + 1}: ${validation.errors.join(', ')}`)
    }
  })

  if (validationErrors.length > 0) {
    throw new Error(`Invalid student data: ${validationErrors.join('; ')}`)
  }

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
    const studentCards = pageStudents.map(student => generateCardHTML(student)).join('')

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
  <title>ប័ណ្ណសម្គាល់ខ្លួនសិស្សសាលាមិត្តភាព</title>
  <style>
    ${getIDCardCSS()}
  </style>
</head>
<body>
  <div class="document">
    ${pageHTML}
  </div>
</body>
</html>
  `
}

export async function generateStudentIDCardPDF(data: StudentIDCardData, options?: ReportOptions): Promise<PDFResult> {
  try {
    const mergedOptions = mergeReportOptions(options)
    const html = generateStudentIDCardHTML(data)
    
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
  } catch (error) {
    throw new Error(`Failed to generate student ID card PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateBulkStudentIDCardPDF(data: BulkStudentIDCardData, options?: ReportOptions): Promise<PDFResult> {
  try {
    const mergedOptions = mergeReportOptions(options)
    const html = generateBulkStudentIDCardHTML(data)
    
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
  } catch (error) {
    throw new Error(`Failed to generate bulk student ID card PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}