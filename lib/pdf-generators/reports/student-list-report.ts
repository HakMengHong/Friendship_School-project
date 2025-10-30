/*
 * Student List Report PDF Generator
 * 
 * Generates comprehensive student list reports including class lists, 
 * all students, and detailed student information reports.
 */

import puppeteer from 'puppeteer'
import { PDFResult, ReportOptions, StudentData, GuardianData, FamilyData } from '../core/types'
import {
  mergeReportOptions,
  getLogoBase64,
  getStudentRegistrationCSS,
  generateHTMLFooter,
  getGradeLabel,
  getGenderKhmer,
  formatDateKhmer,
  DEFAULT_CONFIG
} from '../core/utils'

// Helper function for short date format
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
  
  return `${day}, ${month} ឆ្នាំ${year}`
}

// Student list report data interfaces
export interface StudentListReportData {
  reportType: 'class-list' | 'student-details'
  title: string
  academicYear: string
  class?: string
  schoolName: string
  totalStudents: number
  students: Array<{
    studentId: string
    firstName: string
    lastName: string
    class: string
    gender: string
    dob: string
    age: string
    phone: string
    emergencyContact: string
    registrationDate: string
    status: string
    religion: string
    health: string
    studentHouseNumber: string
    studentVillage: string
    studentCommune: string
    studentDistrict: string
    studentProvince: string
    studentBirthDistrict: string
    previousSchool: string
    transferReason: string
    vaccinated: boolean
    needsClothes: boolean
    needsMaterials: boolean
    needsTransport: boolean
    guardians?: Array<{
      firstName: string
      lastName: string
      relation: string
      phone: string
      occupation: string
      income: number
      childrenCount: number
      houseNumber: string
      village: string
      district: string
      province: string
      birthDistrict: string
      believeJesus: boolean
      church: string
    }>
    family?: {
      livingWith: string
      ownHouse: boolean
      durationInKPC: string
      livingCondition: string
      organizationHelp: string
      knowSchool: string
      religion: string
      churchName: string
      canHelpSchool: boolean
      helpAmount: number
      helpFrequency: string
    }
  }>
  summary: {
    byClass: Array<{
      className: string
      totalStudents: number
      maleCount: number
      femaleCount: number
    }>
    byGender: {
      male: number
      female: number
    }
    byStatus: {
      active: number
      inactive: number
      transferred: number
    }
  }
}

// Generate HTML content for student list report
export const generateStudentListReportHTML = (data: StudentListReportData): string => {
  const reportTitle = data.title || 'បញ្ចីឈ្មោះសិស្ស'
  const reportDate = formatDateKhmer(new Date().toISOString())
  
  const logoBase64 = getLogoBase64(data.class)
  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
  <style>
    ${getStudentRegistrationCSS()}
    
    /* Custom styles for the new layout */
    .header-section {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
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

    .header-right {
      flex: 0 0 80px;
      text-align: center;
    }
    
    .report-title {
      font-size: 13pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      text-align: center;
      margin: 20px 0;
    }
    
    .student-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .student-table th,
    .student-table td {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }
    
    .student-table td.name-cell {
      text-align: left;
      padding-left: 12px;
    }
    
    .student-table th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    
    .summary-row {
      background-color: #f8f8f8;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }
    
    .signature-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 30px;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }
    
    .signature-part {
      text-align: center;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }
    
    .signature-line {
      margin: 5px 0;
      white-space: nowrap;
      font-size: 14px;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header-section">
      <div class="header-left">
        ${logoBase64 ? `<img src="${logoBase64}" alt="School Logo" class="school-logo" />` : ''}
      </div>
      
      <div class="header-center">
        <div class="kingdom-motto">ព្រះរាជាណាចក្រកម្ពុជា</div>
        <div class="nation-religion-king">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
      </div>
      
      <div class="header-right">
        <!-- Empty right section for balance -->
      </div>
    </div>
    
    <div class="report-title">
      បញ្ចីឈ្មោះសិស្សថ្នាក់ទី ${data.class || '6A'} ឆ្នាំសិក្សា ${data.academicYear}
    </div>
    
    <table class="student-table">
      <thead>
        <tr>
          <th>ល.រ</th>
          <th>ឈ្មោះ</th>
          <th>ភេទ</th>
          <th>លេខ ID</th>
          <th>ថ្ងៃខែឆ្នាំកំណើត</th>
          <th>អាយុ</th>
        </tr>
      </thead>
      <tbody>
        ${[...data.students]
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
          .map((student, index) => `
          <tr>
            <td>${index + 1}</td>
            <td class="name-cell">${student.lastName} ${student.firstName}</td>
            <td>${getGenderKhmer(student.gender)}</td>
            <td>${student.studentId}</td>
            <td>${formatDateShort(student.dob)}</td>
            <td>${student.age}</td>
          </tr>
        `).join('')}
        <tr class="summary-row">
          <td colspan="4">សិស្សសរុប ${data.totalStudents} នាក់</td>
          <td colspan="2">សិស្សស្រីសរុប ${data.summary.byGender.female} នាក់</td>

        </tr>
      </tbody>
    </table>
    
    <div class="signature-section">
      <div class="signature-part">
        <div class="signature-line">${reportDate}</div>
        <div class="signature-line">គ្រូបន្ទុកថ្នាក់</div>
      </div>
    </div>
  </div>
</body>
</html>`

  return html
}

// Generate student list report PDF
export const generateStudentListReportPDF = async (
  data: StudentListReportData,
  options?: Partial<ReportOptions>
): Promise<PDFResult> => {
  const htmlContent = generateStudentListReportHTML(data)
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
      format: reportOptions.format,
      printBackground: true,
      margin: reportOptions.margins,
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 10mm 0 0; margin: 0;">
          ${getReportTypeText(data.reportType)}
        </div>
      `,
      footerTemplate: `
        <div style="font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 10mm 0 0; margin: 0;">
          ទំព័រទី <span class="pageNumber"></span> នៃ <span class="totalPages"></span>
        </div>
      `
    })

    // Generate filename
    const reportTypeText = data.reportType
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
function getReportTypeText(type: string): string {
  switch (type) {
    case 'class-list':
      return 'បញ្ជីឈ្មោះតាមថ្នាក់'
    case 'student-details':
      return 'ព័ត៌មានលម្អិតសិស្ស'
    default:
      return 'របាយការណ៍បញ្ជីឈ្មោះសិស្ស'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'សកម្ម'
    case 'inactive':
      return 'អសកម្ម'
    case 'transferred':
      return 'ផ្ទេរ'
    default:
      return status
  }
}
