import { getStudentRegistrationCSS, getLogoBase64, getNGOLogoBase64, mergeReportOptions } from '../core/utils'
import { ReportOptions, PDFResult } from '../core/types'
import puppeteer from 'puppeteer'

export interface TeacherIDCardData {
  userId: number
  firstName: string
  lastName: string
  username: string
  role: string
  position?: string
  phone?: string
  email?: string
  photo?: string
  avatar?: string
  generatedAt: string
}

export interface BulkTeacherIDCardData {
  teachers: TeacherIDCardData[]
  schoolYear: string
  generatedAt: string
}

// Constants
const SCHOOL_NAME = 'សាលាមិត្តភាព'
const CARD_DIMENSIONS = {
  single: { width: 280, height: 397 }, // A7 size: 74mm x 105mm
  bulk: { width: '100%', height: '100%' }
} as const

const PHOTO_DIMENSIONS = {
  single: { width: 120, height: 160 }, // 3:4 aspect ratio (120 * 4/3 = 160)
  bulk: { width: 90, height: 120 }     // 3:4 aspect ratio (90 * 4/3 = 120)
} as const

const FONT_SIZES = {
  single: {
    schoolName: 12,
    cardType: 10,
    teacherName: 14,
    infoLabel: 9,
    infoValue: 10,
    idLabel: 8,
    idValue: 12
  },
  bulk: {
    schoolName: 10,
    cardType: 8,
    teacherName: 12,
    infoLabel: 7,
    infoValue: 8,
    idLabel: 6,
    idValue: 10
  }
} as const

const TEACHERS_PER_PAGE = 4
const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox']

// Helper functions
function validateTeacherData(data: TeacherIDCardData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.userId || data.userId <= 0) {
    errors.push('Valid teacher ID is required')
  }
  
  if (!data.firstName?.trim()) {
    errors.push('First name is required')
  }
  
  if (!data.lastName?.trim()) {
    errors.push('Last name is required')
  }
  
  if (!data.role?.trim()) {
    errors.push('Teacher role is required')
  }
  
  if (!data.username?.trim()) {
    errors.push('Username is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

function getTeacherDisplayInfo(data: TeacherIDCardData) {
  const teacherFullName = `${data.lastName || ''} ${data.firstName || ''}`.trim()
  const isAdmin = data.role === 'admin'
  const roleText = isAdmin ? 'អ្នកគ្រប់គ្រង' : 'គ្រូបង្រៀន'
  const positionText = data.position || roleText
  // data.phone already contains formatted phone numbers joined with ' / '
  const phoneText = data.phone || '........'
  
  return {
    teacherFullName,
    roleText,
    positionText,
    phoneText
  }
}

function generateTeacherCardHTML(teacher: TeacherIDCardData, isBulk: boolean = false): string {
  const fonts = isBulk ? FONT_SIZES.bulk : FONT_SIZES.single
  const photoSize = isBulk ? PHOTO_DIMENSIONS.bulk : PHOTO_DIMENSIONS.single
  const { teacherFullName, roleText, positionText, phoneText } = getTeacherDisplayInfo(teacher)
  const logoBase64 = getLogoBase64()
  const ngoLogoBase64 = getNGOLogoBase64()
  // Generate ID number with role-based prefix
  const rolePrefix = teacher.role === 'admin' ? 'FS-A' : 'FS-T'
  const teacherIdNumber = `${rolePrefix}${teacher.userId.toString().padStart(2, '0')}`
  
  return `
    <div class="id-card-container">
      <div class="id-card-header">
        <div class="school-logo">
          ${logoBase64 ? `<img src="${logoBase64}" alt="សាលាមិត្តភាព" />` : '<div class="logo-fallback">សាលាមិត្តភាព</div>'}
        </div>
        <div class="school-name">${SCHOOL_NAME}</div>
        <div class="card-type">ប័ណ្ណសម្គាល់គ្រូ</div>
      </div>
      
      <div class="id-card-content">
        <div class="teacher-photo-section">
          <div class="teacher-photo" style="width: ${photoSize.width}px; height: ${photoSize.height}px;">
            ${teacher.photo ? `<img src="${teacher.photo}" alt="Teacher Photo" />` : '<div class="photo-placeholder">3x4</div>'}
          </div>
        </div>
        
        <div class="teacher-info">
          <div class="teacher-name">${teacherFullName}</div>
          
          <div class="info-row">
            <div class="info-label">តួនាទី:</div>
            <div class="info-value">${roleText}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">មុខតំណែង:</div>
            <div class="info-value">${positionText}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">លេខទូរស័ព្ទ:</div>
            <div class="info-value">${phoneText}</div>
          </div>
        </div>
      </div>
      
      <div class="id-number">
        <div class="id-label">លេខសម្គាល់</div>
        <div class="id-value">${teacherIdNumber}</div>
      </div>
    </div>
  `
}

function getTeacherIDCardCSS(ngoLogoBase64?: string, isBulk: boolean = false): string {
  const fonts = FONT_SIZES.single
  
  return `
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      height: auto;
      min-height: auto;
    }
    
    ${isBulk ? getStudentRegistrationCSS() : ''}
    
    ${!isBulk ? `
    /* Single Card Specific Styles */
    .document {
      margin: 0;
      padding: 0;
      width: 282px;
      margin: 0 auto;
      background: white;
    }
    
    @page {
      size: 282px 407px;
      margin: 0;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
        width: 282px;
        height: 407px;
      }
      
      .document {
        margin: 0;
        padding: 0;
        width: 282px;
        height: 407px;
      }
    }
    ` : ''}
    
    ${isBulk ? `
    /* Page Layout for Bulk Generation */
    .page {
      width: 8.27in;
      height: 11.69in;
      margin: 0;
      padding: 0;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    
    .page:last-child {
      page-break-after: avoid;
      height: auto;
      min-height: auto;
    }
    
    .page:not(:last-child) {
      page-break-after: always;
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 40px 40px;
      row-gap: 60px;
      padding: 40px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
    }
    
    .page:last-child .cards-grid {
      height: auto;
      min-height: auto;
      position: relative;
    }
    
    .cards-grid:has(.id-card-placeholder:only-child) {
      display: none;
    }
    
    .id-card-placeholder {
      width: 282px;
      height: 407px;
      margin: 20px auto;
      background: transparent;
      border: 2px solid transparent;
      border-radius: 15px;
      position: relative;
      overflow: hidden;
    }
    ` : ''}
    
    /* ID Card Specific Styles - A7 Size (74mm x 105mm) */
    .id-card-container {
      width: 282px;
      height: 407px;
      margin: 20px auto;
      background: 
        linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(253, 186, 116, 0.05) 100%);
      background-size: 100%;
      background-position: center;
      background-repeat: no-repeat;
      border: 2px solid rgba(37, 99, 235, 0.2);
      border-radius: 20px;
      padding: 15px;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 8px 16px rgba(37, 99, 235, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      position: relative;
      overflow: hidden;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      backdrop-filter: blur(1px);
    }
    
    .id-card-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        ${ngoLogoBase64 ? `url("${ngoLogoBase64}")` : 'none'},
        radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
      background-size: 90%, 100%, 100%;
      background-position: center, 0 0, 0 0;
      background-repeat: no-repeat, no-repeat, no-repeat;
      filter: blur(1px);
      opacity: 0.8;
      z-index: 1;
      pointer-events: none;
    }
    
    .id-card-header {
      text-align: center;
      margin-bottom: 15px;
      position: relative;
      z-index: 3;
    }
    
    .school-logo {
      width: 70px;
      height: 70px;
      margin: 0 auto 8px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
    }
    
    .school-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    
    .logo-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: 10px;
      color: #2563eb;
      font-weight: normal;
      text-align: center;
      line-height: 1.2;
    }
    
    .school-name {
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: ${fonts.schoolName}px;
      font-weight: normal;
      color: #1e40af;
      margin-bottom: 6px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.9);
      padding: 4px 8px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .card-type {
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: ${fonts.cardType}px;
      color: #64748b;
      font-weight: normal;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      letter-spacing: 0.3px;
      background: rgba(255, 255, 255, 0.8);
      padding: 3px 6px;
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    
    .id-card-content {
      display: flex;
      gap: 10px;
      margin-bottom: 5px;
      flex: 1;
      position: relative;
      z-index: 3;
    }
    
    .teacher-photo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .teacher-photo {
      border: 3px solid rgba(255, 255, 255, 0.9);
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .teacher-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .photo-placeholder {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 10px;
      color: #64748b;
      text-align: center;
      line-height: 1.2;
    }
    
    .teacher-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .info-row {
      display: flex;
      margin-bottom: 6px;
      align-items: center;
    }
    
    .info-label {
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: ${fonts.infoLabel}px;
      color: #1e40af;
      width: 50px;
      flex-shrink: 0;
      font-weight: normal;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .info-value {
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: ${fonts.infoValue}px;
      color: #374151;
      font-weight: normal;
      flex: 1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .teacher-name {
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: ${fonts.teacherName}px;
      font-weight: normal;
      color: #1e40af;
      margin-bottom: 8px;
      text-align: center;
      padding: 6px 10px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
      border-radius: 10px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      letter-spacing: 0.5px;
    }
    
    .id-number {
      text-align: center;
      margin-top: 5px;
      padding: 5px 6px;
      background: linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
      color: #1e40af;
      border-radius: 8px;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-weight: normal;
      border: 2px solid rgba(30, 64, 175, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 3;
      letter-spacing: 1px;
    }
    
    .id-label {
      font-size: ${fonts.idValue}px;
      margin-bottom: 3px;
    }
    
    .id-value {
      font-size: ${fonts.idValue}px;
      letter-spacing: 1px;
    }
    
    ${isBulk ? `
    @media print {
      .page {
        margin: 0;
        padding: 0;
      }
      
      .cards-grid {
        height: 100vh;
        page-break-inside: avoid;
      }
    }
    ` : ''}
  `
}

export function generateTeacherIDCardHTML(data: TeacherIDCardData): string {
  const validation = validateTeacherData(data)
  if (!validation.isValid) {
    throw new Error(`Invalid teacher data: ${validation.errors.join(', ')}`)
  }

  const ngoLogoBase64 = getNGOLogoBase64()
  
  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ប័ណ្ណសម្គាល់គ្រូ - Teacher ID Card</title>
  <style>
    ${getTeacherIDCardCSS(ngoLogoBase64, false)}
  </style>
</head>
<body>
  <div class="document">
    ${generateTeacherCardHTML(data, false)}
  </div>
</body>
</html>
  `
}

export function generateBulkTeacherIDCardHTML(data: BulkTeacherIDCardData): string {
  if (!data.teachers?.length) {
    throw new Error('No teachers provided for bulk generation')
  }

  const ngoLogoBase64 = getNGOLogoBase64()

  // Validate each teacher
  const validationErrors: string[] = []
  data.teachers.forEach((teacher, index) => {
    const validation = validateTeacherData(teacher)
    if (!validation.isValid) {
      validationErrors.push(`Teacher ${index + 1}: ${validation.errors.join(', ')}`)
    }
  })

  if (validationErrors.length > 0) {
    throw new Error(`Invalid teacher data: ${validationErrors.join('; ')}`)
  }

  // Split teachers into pages
  const pages = []
  for (let i = 0; i < data.teachers.length; i += TEACHERS_PER_PAGE) {
    const pageTeachers = data.teachers.slice(i, i + TEACHERS_PER_PAGE)
    if (pageTeachers.length > 0) {
      pages.push(pageTeachers)
    }
  }

  const pageHTML = pages.map((pageTeachers, pageIndex) => {
    const teacherCards = pageTeachers.map(teacher => generateTeacherCardHTML(teacher, true)).join('')
    const isLastPage = pageIndex === pages.length - 1
    
    // Only add placeholders for non-last pages that aren't full
    let placeholderCards = ''
    if (!isLastPage && pageTeachers.length < TEACHERS_PER_PAGE) {
      const placeholdersNeeded = TEACHERS_PER_PAGE - pageTeachers.length
      placeholderCards = Array(placeholdersNeeded).fill(0).map(() => 
        '<div class="id-card-placeholder"></div>'
      ).join('')
    }

    return `
      <div class="page">
    <div class="cards-grid">
          ${teacherCards}${placeholderCards}
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
  <title>ប័ណ្ណសម្គាល់គ្រូ - Teacher ID Cards</title>
  <style>
    ${getTeacherIDCardCSS(ngoLogoBase64, true)}
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

async function createPuppeteerBrowser() {
  return puppeteer.launch({
    headless: true,
    args: PUPPETEER_ARGS
  })
}

export async function generateTeacherIDCardPDF(data: TeacherIDCardData, options?: ReportOptions): Promise<PDFResult> {
  try {
  const reportOptions = mergeReportOptions(options, {
    format: 'A4',
    orientation: 'portrait',
    margins: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
    },
    includeHeader: false,
    includeFooter: false
  })

    const browser = await createPuppeteerBrowser()

  try {
    const page = await browser.newPage()
    
    await page.setViewport({
        width: 280 * 4,
        height: 397 * 4,
      deviceScaleFactor: 4
    })

      const html = generateTeacherIDCardHTML(data)
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        preferCSSPageSize: true,
        displayHeaderFooter: false
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
    throw new Error(`Failed to generate teacher ID card PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateBulkTeacherIDCardPDF(data: BulkTeacherIDCardData, options?: ReportOptions): Promise<PDFResult> {
  try {
  const reportOptions = mergeReportOptions(options, {
    format: 'A4',
    orientation: 'portrait',
    margins: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
      },
      includeHeader: false,
      includeFooter: false
    })

    const browser = await createPuppeteerBrowser()

  try {
    const page = await browser.newPage()
    
    await page.setViewport({
        width: 210 * 4,
        height: 297 * 4,
        deviceScaleFactor: 4
      })

      const html = generateBulkTeacherIDCardHTML(data)
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
    throw new Error(`Failed to generate bulk teacher ID card PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}