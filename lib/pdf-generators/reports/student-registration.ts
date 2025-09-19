/*
 * Student Registration PDF Generator
 * 
 * Generates professional student registration forms with complete
 * student information, guardian details, and family background.
 */

import puppeteer from 'puppeteer'

import { PDFResult, StudentData, ReportOptions } from '../core/types'
import {
  getFileSize,
  mergeReportOptions,
  getGradeLabel,
  getGenderKhmer,
  getRelationKhmer,
  getBooleanKhmer,
  getVaccinationKhmer,
  formatDateKhmer,
  getStudentRegistrationCSS,
  getLogoBase64,
  DEFAULT_CONFIG
} from '../core/utils'




// Extended student data interface for registration
export interface StudentRegistrationData extends StudentData {
  guardians: Array<{
    firstName: string
    lastName: string
    relation: string
    phone: string
    occupation: string
    income: string
    childrenCount?: string
    houseNumber?: string
    village?: string
    district?: string
    province?: string
    birthDistrict?: string
    believeJesus?: boolean
    church?: string
  }>
  familyInfo: {
    livingWith: string
    ownHouse: boolean
    durationInKPC: string
    livingCondition: string
    religion: string
    churchName: string
    helpAmount?: string
    helpFrequency?: string
    knowSchool?: string
    organizationHelp?: string
    childrenInCare?: string
  }
}

// Generate HTML content for student registration
export const generateStudentRegistrationHTML = (data: StudentRegistrationData): string => {
  const studentFullName = `${data.lastName || ''} ${data.firstName || ''}`.trim()
  const genderText = getGenderKhmer(data.gender || '')
  const classLabel = getGradeLabel(data.class)
  const houseType = data.familyInfo?.ownHouse ? 'ផ្ទះផ្ទាល់ខ្លួន' : 'ផ្ទះជួល'
  const familyIncome = (data.guardians && data.guardians[0] && data.guardians[0].income) ? data.guardians[0].income : ''

  // Get logo base64 based on student grade
  let logoBase64 = ''
  try {
    logoBase64 = getLogoBase64(data.class)
    console.log('Logo base64 length in HTML generation:', logoBase64.length)
  } catch (error) {
    console.error('Error getting logo in HTML generation:', error)
    logoBase64 = ''
  }
  
  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ពាក្យចុះឈ្មោះសិស្ស</title>
  <style>
    ${getStudentRegistrationCSS()}
  </style>
</head>
<body>
  <div class="document">
    <div class="header-row">
      <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="សាលាមិត្តភាព" />` : '<div class="logo-placeholder">សាលាមិត្តភាព</div>'}
      </div>
      
      <div class="national-header">
        <div class="national-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
        <div class="national-subtitle">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
      </div>
      
      <div class="photo-container">
        <div class="photo-label">រូបថត 4x6</div>
      </div>
    </div>
    
    <div class="title-row">
      <div class="header-content">
        <h1>ពាក្យចុះឈ្មោះសិស្ស</h1>

      </div>
    </div>

    <div class="section">
      <div class="section-title">ព័ត៌មានសិស្ស</div>
      <div class="student-summary">
        <strong>ឈ្មោះសិស្ស:</strong> ${studentFullName || '........................'} 
        <strong>ភេទ:</strong> ${genderText || '......'} 
        <strong>ថ្ងៃខែឆ្នាំកំណើត:</strong> ${data.dob || '..................'} 
        <strong>លេខសម្គាល់:</strong> ${data.studentId || '....'} 
        <strong>ថ្នាក់:</strong> ${classLabel} 
        <strong>ឆ្នាំសិក្សា:</strong> ${data.schoolYear || ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">អាស័យដ្ឋានបច្ចុប្បន្ន</div>
      <div class="address-summary">
        <strong>ផ្ទះលេខ:</strong> ${data.studentHouseNumber || '........................'} 
        <strong>ភូមិ:</strong> ${data.studentVillage || '........................'} 
        <strong>ស្រុក/ក្រុង:</strong> ${data.studentDistrict || '........................'} 
        <strong>ខេត្ត:</strong> ${data.studentProvince || '........................'} 
        <strong>ស្រុកកំណើត:</strong> ${data.studentBirthDistrict || '........................'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">អាណាព្យាបាលគ្រួសារ</div>
      <div class="guardian-info">
        ${(data.guardians || []).map((g, index) => `
          <div class="guardian-item">
            <div class="guardian-name">អាណាព្យាបាល ${index + 1}: ${[g.lastName, g.firstName].filter(Boolean).join(' ')}</div>
            <div class="guardian-details">
              <strong>ទំនាក់ទំនង:</strong> ${getRelationKhmer(g.relation || '')} 
              <strong>មុខរបរ:</strong> ${g.occupation || ''} 
              <strong>ទូរស័ព្ទ:</strong> ${g.phone || ''}
            </div>
          </div>
        `).join('') || '<div class="guardian-item">មិនមានព័ត៌មានអាណាព្យាបាល</div>'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">ព័ត៌មានគ្រួសារ</div>
      <div class="family-summary">
        <strong>&nbsp;&nbsp;&nbsp;នៅជាមួយ:</strong> ${data.familyInfo?.livingWith || '........................'} 
        <strong>ប្រភេទលំនៅឋាន:</strong> ${houseType} 
        <strong>រយៈពេលនៅកំពង់ចាម:</strong> ${data.familyInfo?.durationInKPC || '........................'} ឆ្នាំ 
        <strong>ចំនួនកូនក្នុងបន្ទុក:</strong> ${data.familyInfo?.childrenInCare || '........................'} នាក់ 
        <strong>ជីវភាពគ្រួសារ:</strong> ${data.familyInfo?.livingCondition || '........................'} 
        <strong>ប្រាក់ចំណូល:</strong> ${familyIncome || '........................'} រៀល 
        <strong>ជំនួយអង្គការ:</strong> ${data.familyInfo?.organizationHelp || '........................'} 
        <strong>លទ្ធភាពជួយសាលា:</strong> ${data.familyInfo?.helpAmount || '........................'} រៀល ក្នុងមួយ ${data.familyInfo?.helpFrequency || '........................'} 
        <strong>វ៉ាក់សាំង:</strong> ${getVaccinationKhmer(data.vaccinated)} 
        <strong>សាសនា:</strong> ${data.familyInfo?.religion || '........................'} 
        <strong>ព្រះវិហារ:</strong> ${data.familyInfo?.churchName || '........................'} 
        <strong>ស្គាល់សាលាតាមរយៈ:</strong> ${data.familyInfo?.knowSchool || '........................'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">តម្រូវការពីសាលា</div>
      <div class="checkbox-section">
        <div class="checkbox-item">
          <span class="checkbox">${data.needsClothes ? '✓' : ''}</span>
          កង្វះខាតសម្លៀកបំពាក់
        </div>
        <div class="checkbox-item">
          <span class="checkbox">${data.needsMaterials ? '✓' : ''}</span>
          កង្វះខាតសម្ភារសិក្សា
        </div>
        <div class="checkbox-item">
          <span class="checkbox">${data.needsTransport ? '✓' : ''}</span>
          ត្រូវការឡានជូនមកសាលា
        </div>
      </div>
    </div>

    <div class="formal-letter">
        <div class="letter-greeting-title">សូមគោរពចូលមក</div>
      <div class="letter-greeting">
          &nbsp;&nbsp;&nbsp;&nbsp;លោកស្រីនាយិកាសាលាមិត្តភាព សូមលោកស្រីអនុញ្ញាតឱ្យកូន ខ្ញុំបាទ/នាងខ្ញុំ ឈ្មោះ <strong>${studentFullName || '........................'}</strong> ភេទ <strong>${genderText || '......'}</strong> ចូលរៀននៅ <strong>${classLabel}</strong> នៃសាលារបស់លោកស្រីដោយអនុគ្រោះ។ ខ្ញុំបាទ/នាងខ្ញុំ សូមសន្យាថានឹងគោរពតាមបទបញ្ជារបស់សាលាដូចខាងក្រោម៖
      </div>

      <div class="letter-rules">
        <div class="rule"><strong>1. </strong> ខ្ញុំបាទ/នាងខ្ញុំ នឹងបញ្ជូនកូនឱ្យមករៀនបានទៀងទាត់ និងទាន់ពេលវេលា។</div>
        <div class="rule"><strong>2. </strong> ខ្ញុំបាទ/នាងខ្ញុំ នឹងខិតខំអប់រំកូនឱ្យក្លាយជាកូនល្អ មិត្តល្អ សិស្សល្អ។</div>
        <div class="rule"><strong>3. </strong> ខ្ញុំបាទ/នាងខ្ញុំ មិនបញ្ឈប់កូនឱ្យឈប់រៀនដោយគ្មានការអនុញ្ញាតពីសាលារៀនឡើយ។</div>
        <div class="rule"><strong>4. </strong> ខ្ញុំបាទ/នាងខ្ញុំ នឹងថែរក្សាសម្ភារសិក្សារបស់កូនឱ្យបានល្អ (ក្នុងករណីសៀវភៅរហែកឬបាត់ ខ្ញុំត្រូវទិញសងសាលាវិញ)។</div>
        <div class="rule"><strong>5. </strong> សិស្សមិនត្រូវយកទូរស័ព្ទដៃមកសាលាជាដាច់ខាត (លើកទី១ឱ្យវិញ លើកទី២មិនឱ្យវិញទេ)។</div>
        <div class="rule"><strong>6. </strong> ខ្ញុំបាទ/នាងខ្ញុំ នឹងប្រើប្រាស់លេខទូរស័ព្ទឱ្យបានច្បាស់លាស់ ដែលសាលាអាចទាក់ទងបាន (ប្តូរលេខថ្មីត្រូវឱ្យលេខថ្មីមកសាលាជាដាច់ខាត)។</div>
        <div class="rule"><strong>7. </strong> សិស្សដែលមានអវត្តមានឥតច្បាប់ ៣០ដង/១ឆ្នាំ នឹងត្រូវបញ្ឈប់ពីការសិក្សា។ អវត្តមានច្បាប់ ២ដងស្មើនឹងឥតច្បាប់ ១ដង។</div>
        <div class="rule"><strong>8. </strong> ប្រសិនបើអាណាព្យាបាលមិនចូលរួមក្នុងការប្រជុំដែលសាលាអញ្ជើញនោះទេ សាលាមានសិទ្ធិបញ្ឈប់កូនដោយស្វ័យប្រវត្តិ។</div>
        <div class="rule"><strong>9. </strong> សិស្សដែលមិនខិតខំរៀន ធ្លាក់មធ្យមភាគដំណាច់ឆ្នាំ សាលាមានសិទ្ធិបញ្ឈប់សិស្សនោះបន្ទាប់ពីបញ្ចប់ឆ្នាំសិក្សា។</div>
        <div class="rule"><strong>10.</strong> សិស្សដែលបង្កកំហុសធំៗ (បំផ្លាញទ្រព្យសម្បត្តិ វាយគ្នា ជេរគ្នា លេងអសីលធម៌ មិនគោរពគ្រូ) និងកំហុសស្រាល ៥ដង សាលាមានសិទ្ធិបញ្ឈប់សិស្សនោះ។</div>
        <div class="rule"><strong>11.</strong> ខ្ញុំបាទ/នាងខ្ញុំ នឹងជួយអប់រំកូនឱ្យគោរពវិន័យ/បទបញ្ជាផ្ទៃក្នុងរបស់សាលាឱ្យបានហ្មត់ចត់។</div>
        <div class="rule"><strong>12.</strong> អាណាព្យាបាលត្រូវផ្តល់សិទ្ធិសេរីភាពឱ្យសិស្សក្នុងការទទួលជឿលើព្រះយេស៊ូវគ្រីស្ទ។</div>
        ${data.class === '9' ? `
        <div class="rule"><strong>13.</strong> សិស្សថ្នាក់ទី៩ ដែលមិនគ្រប់មធ្យមភាគ សាលាមានសិទ្ធិដកបេក្ខភាពប្រឡងឌីប្លូម។</div>
        <div class="rule"><strong>14.</strong> សិស្សដែលចង់បានអាហារូបករណ៍ពីសាលា(រៀនគួរ រូបវិទ្យា គីមីវិទ្យា និងគណិតវិទ្យា) សិស្សត្រូវចូលរួមរៀនគម្ពីរថ្ងៃពុធម៉ោង១១ព្រឹក និងត្រូវចូលរួមថ្វាយបង្គំថ្ងៃអាទិត្យម៉ោង៤:៣០នាទីល្ងាច។</div>
        ` : ''}
      </div>
      
      <div class="letter-closing">
        &nbsp;&nbsp;&nbsp;&nbsp;បើខ្ញុំបាទ/នាងខ្ញុំ មិនគោរពតាមកិច្ចសន្យាណាមួយដែលមានចែងនៅខាងលើទេនោះ ខ្ញុំបាទ/នាងខ្ញុំ សូមទទួលខុសត្រូវចំពោះមុខបទបញ្ជាផ្ទៃក្នុងរបស់សាលា។
      </div>
      
      <div class="letter-date">
        កំពង់ចាម ${formatDateKhmer(new Date())}
      </div>
      
      <div class="letter-signatures">
        <div class="signature-item">
          <div class="signature-label">ហត្ថលេខាអ្នកទទួល</div>
          <div class="signature-name">ឈ្មោះ____________________</div>
        </div>
        <div class="signature-item">
          <div class="signature-label">ហត្ថលេខា ឫ ស្នាមមេដៃ</div>
          <div class="signature-name">ឈ្មោះ____________________</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `

  return html
}

// Generate student registration PDF
export const generateStudentRegistrationPDF = async (
  data: StudentRegistrationData,
  options?: Partial<ReportOptions>
): Promise<PDFResult> => {
  const htmlContent = generateStudentRegistrationHTML(data)
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
      preferCSSPageSize: false
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
