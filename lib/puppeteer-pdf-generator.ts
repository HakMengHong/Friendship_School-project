import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

/*
 * Professional Puppeteer PDF Generator for Perfect Khmer Font Support
 * 
 * This approach uses Puppeteer to render HTML with proper fonts
 * and then convert to PDF, ensuring perfect Khmer text display.
 * 
 * ✅ Perfect Khmer font rendering
 * ✅ Professional document layout
 * ✅ Enhanced typography and styling
 * ✅ Better visual hierarchy
 * ✅ Consistent output across platforms
 */

export interface StudentData {
  lastName: string
  firstName: string
  gender: string
  dob: string
  age: string
  class: string
  studentId: string
  phone: string
  emergencyContact: string
  studentHouseNumber: string
  studentVillage: string
  studentDistrict: string
  studentProvince: string
  studentBirthDistrict: string
  previousSchool: string
  transferReason: string
  vaccinated: boolean
  schoolYear: string
  needsClothes: boolean
  needsMaterials: boolean
  needsTransport: boolean
  guardians: Array<{
    firstName: string
    lastName: string
    relation: string
    phone: string
    occupation: string
    income: string
  }>
  familyInfo: {
    livingWith: string
    ownHouse: boolean
    durationInKPC: string
    livingCondition: string
    religion: string
    churchName: string
    // Optional/extended fields to support the new form
    helpAmount?: string
    helpFrequency?: string
    knowSchool?: string
    organizationHelp?: string
    childrenInCare?: string
  }
}

// Function to get grade label with Khmer text
export const getGradeLabel = (grade: string): string => {
  if (!grade) return 'មិនមាន'
  const gradeMap: { [key: string]: string } = {
    '1': 'ថ្នាក់ទី 1', '2': 'ថ្នាក់ទី 2', 
    '3': 'ថ្នាក់ទី 3', '4': 'ថ្នាក់ទី 4',
    '5': 'ថ្នាក់ទី 5', '6': 'ថ្នាក់ទី 6', 
    '7': 'ថ្នាក់ទី 7', '8': 'ថ្នាក់ទី 8',
    '9': 'ថ្នាក់ទី 9', '10': 'ថ្នាក់ទី 10', 
    '11': 'ថ្នាក់ទី 11', '12': 'ថ្នាក់ទី 12'
  }
  return gradeMap[grade] || `ថ្នាក់ទី ${grade}`
}

// Function to convert gender to Khmer
export const getGenderKhmer = (gender: string): string => {
  const genderMap: { [key: string]: string } = {
    'male': 'ប្រុស',
    'female': 'ស្រី',
    'Male': 'ប្រុស',
    'Female': 'ស្រី',
    'M': 'ប្រុស',
    'F': 'ស្រី'
  }
  return genderMap[gender] || gender
}

// Function to convert family relations to Khmer
export const getRelationKhmer = (relation: string): string => {
  const relationMap: { [key: string]: string } = {
    'father': 'ឪពុក',
    'mother': 'ម្តាយ',
    'Father': 'ឪពុក',
    'Mother': 'ម្តាយ',
    'parent': 'ឪពុកម្តាយ',
    'Parent': 'ឪពុកម្តាយ',
    'guardian': 'អាណាព្យាបាល',
    'Guardian': 'អាណាព្យាបាល',
    'grandfather': 'ជីតា',
    'grandmother': 'ជីដូន',
    'uncle': 'ពូ',
    'aunt': 'មីង',
    'brother': 'បងប្រុស',
    'sister': 'បងស្រី',
    'cousin': 'បងប្អូនជីដូនមួយ'
  }
  return relationMap[relation] || relation
}

// Function to convert boolean to Khmer
export const getBooleanKhmer = (value: boolean): string => {
  return value ? 'បាន' : 'មិនទាន់'
}

// Function to convert vaccination status to Khmer
export const getVaccinationKhmer = (vaccinated: boolean): string => {
  return vaccinated ? 'បាន' : 'មិនទាន់'
}

// Function to generate HTML content for PDF
export const generateStudentRegistrationHTML = (data: StudentData): string => {
  const studentFullName = `${data.lastName || ''} ${data.firstName || ''}`.trim()
  const genderText = getGenderKhmer(data.gender || '')
  const classLabel = getGradeLabel(data.class)
  const houseType = data.familyInfo?.ownHouse ? 'ផ្ទះផ្ទាល់ខ្លួន' : 'ផ្ទះជួល'
  const guardianLines = (data.guardians || []).map(g => `
      <div class="line">${[g.lastName, g.firstName].filter(Boolean).join(' ')}
        &nbsp;&nbsp;ជា${getRelationKhmer(g.relation || '')}&nbsp;&nbsp;មុខរបរ&nbsp;${g.occupation || ''}
        &nbsp;&nbsp;លេខទូរស័ព្ទ&nbsp;${g.phone || ''}</div>
  `).join('')
  const familyIncome = (data.guardians && data.guardians[0] && data.guardians[0].income) ? data.guardians[0].income : ''
  const guardianRows = (data.guardians || []).map(g => `
    <tr>
      <td class="border-cell">${[g.lastName, g.firstName].filter(Boolean).join(' ')}</td>
      <td class="border-cell">${getRelationKhmer(g.relation || '')}</td>
      <td class="border-cell">${g.occupation || ''}</td>
      <td class="border-cell">${g.phone || ''}</td>
    </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ទម្រង់ចុះឈ្មោះសិស្ស</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body {
      font-family: 'Noto Sans Khmer', 'Inter', sans-serif;
      font-size: 10px;
      line-height: 1.2;
      color: #000;
      background: white;
      padding: 15px;
      margin: 0;
    }

    .document {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 0;
    }

    .header {
      text-align: center;
      margin-bottom: 12px;
      padding: 5px 0;
      border-bottom: 1px solid #000;
    }

    .header h1 {
      font-size: 14px;
      margin: 0 0 3px 0;
      font-weight: bold;
    }

    .header h2 {
      font-size: 11px;
      margin: 0 0 2px 0;
      font-weight: bold;
    }

    .header h3 {
      font-size: 9px;
      margin: 0;
      font-weight: bold;
    }

    .section {
      margin: 8px 0;
    }

    .section-title {
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 4px;
      color: #000;
      text-decoration: underline;
    }

    .info-grid {
      margin-bottom: 6px;
    }

    .info-row {
      margin: 3px 0;
      display: flex;
      align-items: flex-start;
    }

    .info-label {
      width: 150px;
      padding: 1px 0;
      font-weight: bold;
      font-size: 9px;
      flex-shrink: 0;
    }

    .info-value {
      padding: 1px 0;
      font-size: 9px;
      flex: 1;
      margin-left: 8px;
    }

    .guardian-info {
      margin: 4px 0;
    }

    .guardian-item {
      margin: 3px 0;
      padding: 3px 0;
    }

    .guardian-name {
      font-size: 9px;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .guardian-details {
      font-size: 8px;
      margin: 1px 0;
    }

    .checkbox-section {
      margin: 4px 0;
    }

    .checkbox-item {
      font-size: 9px;
      margin: 2px 0;
      display: flex;
      align-items: center;
    }

    .checkbox {
      width: 8px;
      height: 8px;
      margin-right: 5px;
      border: 1px solid #000;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 6px;
    }

    .rules {
      margin: 6px 0;
      text-align: justify;
    }

    .rule {
      margin: 2px 0;
      text-indent: 12px;
      font-size: 8px;
      line-height: 1.1;
    }

    .signature-section {
      margin-top: 8px;
    }

    .signature-grid {
      display: flex;
      width: 100%;
      margin-top: 6px;
      gap: 15px;
    }

    .signature-cell {
      flex: 1;
      padding: 0;
    }

    .signature-box {
      padding: 5px;
      min-height: 30px;
      text-align: center;
    }

    .signature-label {
      font-size: 8px;
      margin-bottom: 4px;
      font-weight: bold;
    }

    .signature-line {
      border-bottom: 1px solid #000;
      margin: 8px 0 4px 0;
      min-height: 12px;
    }

    .date {
      text-align: right;
      margin: 8px 0;
      font-size: 9px;
      font-weight: bold;
    }

    .formal-letter {
      margin: 8px 0;
      font-size: 9px;
      line-height: 1.2;
    }

    .letter-greeting {
      margin-bottom: 6px;
      text-align: justify;
      font-size: 9px;
      line-height: 1.2;
    }

    .letter-greeting strong {
      font-weight: bold;
      color: #000;
    }

    .letter-rules {
      margin: 6px 0;
      text-align: justify;
    }

    .letter-rules .rule {
      margin: 1px 0;
      text-indent: 10px;
      font-size: 7px;
      line-height: 1.1;
    }

    .letter-closing {
      margin: 6px 0;
      text-align: justify;
      font-size: 8px;
      line-height: 1.1;
    }

    .letter-date {
      text-align: right;
      margin: 8px 0 4px 0;
      font-size: 8px;
      font-weight: bold;
    }

    .letter-signatures {
      display: flex;
      gap: 15px;
      margin-top: 8px;
    }

    .signature-item {
      flex: 1;
      text-align: center;
    }

    .signature-label {
      font-size: 7px;
      margin-bottom: 4px;
      font-weight: bold;
    }

    .signature-line {
      border-bottom: 1px solid #000;
      margin: 6px 0 4px 0;
      min-height: 10px;
    }

    .signature-name {
      font-size: 7px;
      margin-top: 2px;
    }

    .student-summary {
      font-size: 9px;
      line-height: 1.2;
      margin: 4px 0;
      text-align: justify;
      padding: 3px 0;
    }

    .student-summary strong {
      font-weight: bold;
      color: #000;
    }

    .address-summary {
      font-size: 9px;
      line-height: 1.2;
      margin: 4px 0;
      text-align: justify;
      padding: 3px 0;
    }

    .address-summary strong {
      font-weight: bold;
      color: #000;
    }

    .family-summary {
      font-size: 9px;
      line-height: 1.2;
      margin: 4px 0;
      text-align: justify;
      padding: 3px 0;
    }

    .family-summary strong {
      font-weight: bold;
      color: #000;
    }

    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      
      .document {
        max-width: none;
      }
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header">
      <h1>ទម្រង់ចុះឈ្មោះសិស្ស</h1>
      <h2>សាលាមិត្តភាព</h2>
      <h3>កំពង់ចាម</h3>
    </div>

    <div class="section">
      <div class="section-title">ព័ត៌មានសិស្ស</div>
      <div class="student-summary">
        ឈ្មោះសិស្ស <strong>${studentFullName || '........................'}</strong> ភេទ <strong>${genderText || '......'}</strong> ថ្ងៃខែឆ្នាំកំណើត <strong>${data.dob || '..................'}</strong> លេខសម្គាល់ <strong>${data.studentId || '....'}</strong> ថ្នាក់ <strong>${classLabel}</strong> ឆ្នាំសិក្សា <strong>${data.schoolYear || ''}</strong>
      </div>
    </div>

    <div class="section">
      <div class="section-title">អាស័យដ្ឋានបច្ចុប្បន្ន</div>
      <div class="address-summary">
        ផ្ទះលេខ <strong>${data.studentHouseNumber || '........................'}</strong> ភូមិ <strong>${data.studentVillage || '........................'}</strong> ស្រុក/ក្រុង <strong>${data.studentDistrict || '........................'}</strong> ខេត្ត <strong>${data.studentProvince || '........................'}</strong> ស្រុកកំណើត <strong>${data.studentBirthDistrict || '........................'}</strong>
      </div>
    </div>

    <div class="section">
      <div class="section-title">អាណាព្យាបាលគ្រួសារ</div>
      <div class="guardian-info">
        ${(data.guardians || []).map(g => `
          <div class="guardian-item">
            <div class="guardian-name">${[g.lastName, g.firstName].filter(Boolean).join(' ')}</div>
            <div class="guardian-details">
              ទំនាក់ទំនង: ${getRelationKhmer(g.relation || '')} | 
              មុខរបរ: ${g.occupation || ''} | 
              ទូរស័ព្ទ: ${g.phone || ''}
            </div>
          </div>
        `).join('') || '<div class="guardian-item">មិនមានព័ត៌មានអាណាព្យាបាល</div>'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">ព័ត៌មានគ្រួសារ</div>
      <div class="family-summary">
        នៅជាមួយ <strong>${data.familyInfo?.livingWith || '........................'}</strong> ប្រភេទលំនៅឋាន <strong>${houseType}</strong> រយៈពេលនៅកំពង់ចាម <strong>${data.familyInfo?.durationInKPC || '........................'} ឆ្នាំ</strong> ចំនួនកូនក្នុងបន្ទុក <strong>${data.familyInfo?.childrenInCare || '........................'} នាក់</strong> ជីវភាពគ្រួសារ <strong>${data.familyInfo?.livingCondition || '........................'}</strong> ប្រាក់ចំណូល <strong>${familyIncome || '........................'} រៀល</strong> ជំនួយអង្គការ <strong>${data.familyInfo?.organizationHelp || '........................'}</strong> លទ្ធភាពជួយសាលា <strong>${data.familyInfo?.helpAmount || '........................'} រៀល ក្នុងមួយ ${data.familyInfo?.helpFrequency || '........................'}</strong> វ៉ាក់សាំង <strong>${getVaccinationKhmer(data.vaccinated)}</strong> សាសនា <strong>${data.familyInfo?.religion || '........................'}</strong> ព្រះវិហារ <strong>${data.familyInfo?.churchName || '........................'}</strong> ស្គាល់សាលាតាមរយៈ <strong>${data.familyInfo?.knowSchool || '........................'}</strong>
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
      <div class="letter-greeting">
        សូមគោរពចូលមក លោកស្រីនាយិកាសាលាមិត្តភាព សូមលោកស្រីអនុញ្ញាតឱ្យកូន ខ្ញុំបាទ/នាងខ្ញុំ ឈ្មោះ <strong>${studentFullName || '........................'}</strong> ភេទ <strong>${genderText || '......'}</strong> ចូលរៀននៅ <strong>${classLabel}</strong> នៃសាលារបស់លោកស្រីដោយអនុគ្រោះ។ ខ្ញុំបាទ/នាងខ្ញុំ សូមសន្យាថានឹងគោរពតាមបទបញ្ជារបស់សាលាដូចខាងក្រោម៖
      </div>

      <div class="letter-rules">
        <div class="rule">១. ខ្ញុំបាទ/នាងខ្ញុំ នឹងបញ្ជូនកូនឱ្យមករៀនបានទៀងទាត់ និងទាន់ពេលវេលា។</div>
        <div class="rule">២. ខ្ញុំបាទ/នាងខ្ញុំ នឹងខិតខំអប់រំកូនឱ្យក្លាយជាកូនល្អ មិត្តល្អ សិស្សល្អ។</div>
        <div class="rule">៣. ខ្ញុំបាទ/នាងខ្ញុំ មិនបញ្ឈប់កូនឱ្យឈប់រៀនដោយគ្មានការអនុញ្ញាតពីសាលារៀនឡើយ។</div>
        <div class="rule">៤. ខ្ញុំបាទ/នាងខ្ញុំ នឹងថែរក្សាសម្ភារសិក្សារបស់កូនឱ្យបានល្អ (ក្នុងករណីសៀវភៅរហែកឬបាត់ ខ្ញុំត្រូវទិញសងសាលាវិញ)។</div>
        <div class="rule">៥. សិស្សមិនត្រូវយកទូរស័ព្ទដៃមកសាលាជាដាច់ខាត (លើកទី១ឱ្យវិញ លើកទី២មិនឱ្យវិញទេ)។</div>
        <div class="rule">៦. ខ្ញុំបាទ/នាងខ្ញុំ នឹងប្រើប្រាស់លេខទូរស័ព្ទឱ្យបានច្បាស់លាស់ ដែលសាលាអាចទាក់ទងបាន (ប្តូរលេខថ្មីត្រូវឱ្យលេខថ្មីមកសាលាជាដាច់ខាត)។</div>
        <div class="rule">៧. សិស្សដែលមានអវត្តមានឥតច្បាប់ ៣០ដង/១ឆ្នាំ នឹងត្រូវបញ្ឈប់ពីការសិក្សា។ អវត្តមានច្បាប់ ២ដងស្មើនឹងឥតច្បាប់ ១ដង។</div>
        <div class="rule">៨. ប្រសិនបើអាណាព្យាបាលមិនចូលរួមក្នុងការប្រជុំដែលសាលាអញ្ជើញនោះទេ សាលាមានសិទ្ធិបញ្ឈប់កូនដោយស្វ័យប្រវត្តិ។</div>
        <div class="rule">៩. សិស្សដែលមិនខិតខំរៀន ធ្លាក់មធ្យមភាគដំណាច់ឆ្នាំ សាលាមានសិទ្ធិបញ្ឈប់សិស្សនោះបន្ទាប់ពីបញ្ចប់ឆ្នាំសិក្សា។</div>
        <div class="rule">១០. សិស្សដែលបង្កកំហុសធំៗ (បំផ្លាញទ្រព្យសម្បត្តិ វាយគ្នា ជេរគ្នា លេងអសីលធម៌ មិនគោរពគ្រូ) និងកំហុសស្រាល ៥ដង សាលាមានសិទ្ធិបញ្ឈប់សិស្សនោះ។</div>
        <div class="rule">១១. ខ្ញុំបាទ/នាងខ្ញុំ នឹងជួយអប់រំកូនឱ្យគោរពវិន័យ/បទបញ្ជាផ្ទៃក្នុងរបស់សាលាឱ្យបានហ្មត់ចត់។</div>
        <div class="rule">១២. អាណាព្យាបាលត្រូវផ្តល់សិទ្ធិសេរីភាពឱ្យសិស្សក្នុងការទទួលជឿលើព្រះយេស៊ូវគ្រីស្ទ។</div>
      </div>
      
      <div class="letter-closing">
        បើខ្ញុំបាទ/នាងខ្ញុំ មិនគោរពតាមកិច្ចសន្យាណាមួយដែលមានចែងនៅខាងលើទេនោះ ខ្ញុំបាទ/នាងខ្ញុំ សូមទទួលខុសត្រូវចំពោះមុខបទបញ្ជាផ្ទៃក្នុងរបស់សាលា។
      </div>
      
      <div class="letter-date">
        កំពង់ចាម ថ្ងៃទី ${new Date().toLocaleDateString('km-KH')}
      </div>
      
      <div class="letter-signatures">
        <div class="signature-item">
          <div class="signature-label">ហត្ថលេខាអ្នកទទួល</div>
          <div class="signature-line"></div>
          <div class="signature-name">ឈ្មោះ</div>
        </div>
        <div class="signature-item">
          <div class="signature-label">ហត្ថលេខា ឫ ស្នាមមេដៃ</div>
          <div class="signature-line"></div>
          <div class="signature-name">ឈ្មោះ</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `
  return html
}

// Function to generate PDF and save to file
export const generateStudentRegistrationPDF = async (data: StudentData): Promise<{ buffer: Buffer, filename: string }> => {
  const htmlContent = generateStudentRegistrationHTML(data)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  })

  try {
    const page = await browser.newPage()
    await page.setDefaultTimeout(60000)
    await page.setDefaultNavigationTimeout(60000)
    
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' })
    
    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    })

    // Generate filename with student info and timestamp
    const studentName = `${data.lastName || ''} ${data.firstName || ''}`.trim() || 'Unknown'
    const studentId = data.studentId || 'NoID'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `student-registration-${studentId}-${studentName.replace(/\s+/g, '-')}-${timestamp}.pdf`
    
    // Ensure the pdf-exports directory exists
    const exportDir = path.join(process.cwd(), 'public', 'pdf-exports')
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }
    
    // Save file to the exports folder
    const filePath = path.join(exportDir, filename)
    fs.writeFileSync(filePath, Buffer.from(pdfBuffer))
    
    return { buffer: Buffer.from(pdfBuffer), filename }
  } finally {
    await browser.close()
  }
}

// Function to save PDF to file (for testing)
export const saveStudentRegistrationPDF = async (data: StudentData, filename: string = 'student-registration.pdf'): Promise<Uint8Array> => {
  try {
    const pdfBuffer = await generateStudentRegistrationPDF(data)
    
    // In a browser environment, we'll trigger download
    // In Node.js, we could save to file system
    console.log('💾 Professional PDF ready for download:', filename)
    
    return pdfBuffer
  } catch (error) {
    console.error('❌ Error saving PDF:', error)
    throw error
  }
}
