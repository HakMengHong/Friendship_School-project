/*
 * Student Registration PDF Generator
 * 
 * Generates professional student registration forms with complete
 * student information, guardian details, and family background.
 */

import puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'

import { PDFResult, StudentData, ReportOptions } from '../core/types'

// Helper functions
const getPovertyCardKhmer = (value?: string): string => {
  switch (value) {
    case 'yes':
      return 'មាន'
    case 'no':
      return 'គ្មាន'
    default:
      return '........................'
  }
}

const getGenderKhmer = (gender: string): string => {
  switch (gender.toLowerCase()) {
    case 'male':
    case 'ប្រុស':
      return 'ប្រុស'
    case 'female':
    case 'ស្រី':
      return 'ស្រី'
    default:
      return '......'
  }
}

const getGradeLabel = (grade: string | number): string => {
  const gradeMap: { [key: string]: string } = {
    "1": "ថ្នាក់ទី ១",
    "2": "ថ្នាក់ទី ២", 
    "3": "ថ្នាក់ទី ៣",
    "4": "ថ្នាក់ទី ៤",
    "5": "ថ្នាក់ទី ៥",
    "6": "ថ្នាក់ទី ៦",
    "7": "ថ្នាក់ទី ៧",
    "8": "ថ្នាក់ទី ៨",
    "9": "ថ្នាក់ទី ៩"
  }
  return gradeMap[grade?.toString()] || grade?.toString() || "N/A"
}

const getRelationKhmer = (relation: string): string => {
  switch (relation.toLowerCase()) {
    case 'father':
      return 'ឪពុក '
    case 'mother':
      return 'ម្តាយ '
    case 'guardian':
      return 'អាណាព្យាបាល '
    default:
      return (relation || '') + ' '
  }
}

const getVaccinationKhmer = (vaccinated: boolean): string => {
  return vaccinated ? 'បាទ/ចាស' : 'ទេ'
}

const getLivingConditionKhmer = (value?: string): string => {
  switch (value) {
    case 'good':
      return 'ធូរធារ'
    case 'medium':
      return 'មធ្យម'
    case 'poor':
      return 'ក្រីក្រ'
    default:
      return '........................'
  }
}

const getReligionKhmer = (value?: string): string => {
  switch (value) {
    case 'buddhism':
      return 'ព្រះពុទ្ធសាសនា'
    case 'christianity':
      return 'គ្រិស្តសាសនា'
    case 'islam':
      return 'ឥស្លាមសាសនា'
    case 'hinduism':
      return 'ហិណ្ឌូសាសនា'
    case 'other':
      return 'ផ្សេងទៀត'
    case 'none':
      return 'គ្មាន'
    default:
      return '........................'
  }
}

const getCanHelpSchoolKhmer = (value?: boolean): string => {
  if (value === true) return 'បាទ/ចាស'
  if (value === false) return 'ទេ'
  return '........................'
}

const getHelpFrequencyKhmer = (value?: string): string => {
  switch (value) {
    case 'month':
      return 'ខែ'
    case 'year':
      return 'ឆ្នាំ'
    default:
      return '........................'
  }
}

const getHouseTypeKhmer = (value?: boolean): string => {
  if (value === true) return 'ផ្ទាល់ខ្លួន'
  if (value === false) return 'ផ្ទះជួល'
  return '........................'
}

const formatDateDDMMYYYY = (dateString?: string): string => {
  if (!dateString) return '..................'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '..................'
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    
    return `${day}-${month}-${year}`
  } catch (error) {
    return '..................'
  }
}

const calculateAgeFromDOB = (dateString?: string): string => {
  if (!dateString) return '..................'
  try {
    const birthDate = new Date(dateString)
    if (isNaN(birthDate.getTime())) return '..................'
    
    const today = new Date()
    let years = today.getFullYear() - birthDate.getFullYear()
    let months = today.getMonth() - birthDate.getMonth()
    let days = today.getDate() - birthDate.getDate()
    
    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }
    
    if (months < 0) {
      years--
      months += 12
    }
    
    return `${years} ឆ្នាំ ${months} ខែ ${days} ថ្ងៃ`
  } catch (error) {
    return '..................'
  }
}

const formatDateKhmer = (date: Date): string => {
  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  
  const day = date.getDate()
  const month = khmerMonths[date.getMonth()]
  const year = date.getFullYear()
  
  return `ថ្ងៃទី ${day} ខែ${month} ឆ្នាំ ${year}`
}

const getLogoBase64 = (grade: string | number): string => {
  try {
    // Determine which logo to use based on grade
    let logoFilename = 'Logo.png' // default fallback (note: capital L)
    
    if (grade) {
      // Extract numeric grade from string (e.g., "5" from "5A" or "5")
      const gradeMatch = grade.toString().match(/\d+/)
      const gradeNum = gradeMatch ? parseInt(gradeMatch[0]) : parseInt(grade.toString())
      
      if (gradeNum >= 1 && gradeNum <= 6) {
        logoFilename = "Friendship Primary School's Logo.png"
      } else if (gradeNum >= 7 && gradeNum <= 9) {
        logoFilename = "Friendship High School's Logo.png"
      }
    }
    
    const logoPath = path.join(process.cwd(), 'public', logoFilename)
    
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      return `data:image/png;base64,${logoBuffer.toString('base64')}`
    } else {
      // Fallback to default logo if specific logo doesn't exist
      const fallbackPath = path.join(process.cwd(), 'public', 'Logo.png')
      if (fs.existsSync(fallbackPath)) {
        const logoBuffer = fs.readFileSync(fallbackPath)
        return `data:image/png;base64,${logoBuffer.toString('base64')}`
      }
    }
  } catch (error) {
    console.warn('Could not load logo:', error)
  }
  return ''
}

const mergeReportOptions = (options?: Partial<ReportOptions>): ReportOptions => {
  return {
    format: 'A4',
    orientation: 'portrait',
    includeHeader: true,
    includeFooter: true,
    margins: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm'
    },
    ...options
  }
}

// Complete CSS styles for student registration
const getStudentRegistrationCSS = (): string => {
  return `
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

    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      padding: 10px;
      margin: 0;
    }

    .document {
      max-width: 100%;
      margin: 0 auto;
      background: white;
      padding: 0;
    }

    @media print {
      body {
        padding: 0;
        margin: 0;
        width: 100%;
        min-height: 100vh;
      }
      
      .document {
        max-width: none;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      
      .header-row {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .section {
        page-break-inside: avoid;
        margin-bottom: 15px;
      }
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      gap: 10px;
      position: relative;
      min-height: 100px;
      padding: 5px 0;
    }

    .logo-container {
      flex-shrink: 0;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: #f9fafb;
    }

    .logo-container img {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }

    .logo-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f0f0f0;
      border: 2px solid #333;
      color: #333;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 12px;
      font-weight: normal;
      text-align: center;
      line-height: 1.2;
      border-radius: 8px;
    }

    .national-header {
      flex: 1;
      text-align: center;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      padding: 0 10px;
    }

    .national-title {
      font-size: 16pt;
      font-weight: normal;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      color: #1a1a1a;
      margin-bottom: 3px;
    }

    .national-subtitle {
      font-size: 14pt;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      color: #333;
      margin-bottom: 8px;
    }

    .photo-container {
      width: 96px;
      height: 144px;
      border: 1px solid #000;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9f9f9;
      flex-shrink: 0;
      margin-top: 20px
    }

    .photo-label {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 10px;
      color: #666;
      text-align: center;
      line-height: 1.2;
    }

    .title-row {
      text-align: center;
      margin-bottom: 8px;
    }

    .header-content {
      text-align: center;
    }

    .header-content h1 {
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: 13pt;
      font-weight: normal;
      margin: 10px 0;
      color: #1a1a1a;
      text-align: center;
    }

    .section {
      margin: 5px 0;
      padding: 5px;
    }

    .section-title {
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: 12pt;
      font-weight: normal;
      margin: 5px 0 5px 0;
      color: #1a1a1a;
    }

    .student-summary, .address-summary, .requirements-summary {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a1a1a;
      padding: 2px;
      background-color: #f8fafc;
      border-radius: 6px;
      text-align: justify;
    }

    .address-summary,
    .family-summary {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a1a1a;
      padding: 2px;
      background-color: #f8fafc;
      border-radius: 6px;
      text-align: justify;
    }

    .guardian-info {
      margin-top: 5px;
    }

    .guardian-item {
      margin-bottom: 3px;
      padding: 3px;
    }

    .guardian-name {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      font-weight: normal;
      color: #1a1a1a;
      margin-bottom: 2px;
      padding: 5px;
      background-color: #f1f5f9;
      border-radius: 4px;
    }

    .guardian-details {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      color: #374151;
      line-height: 1.6;
      padding: 5px;
      background-color: #f9fafb;
      border-radius: 4px;
      margin-left: 4px;
    }

    .checkbox-section {
      display: flex;
      flex-direction: row;
      gap: 15px;
      white-space: nowrap;
      overflow-x: auto;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      flex-shrink: 0;
      padding: 5px;
      border-radius: 6px;
    }

    .checkbox {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #6b7280;
      text-align: center;
      line-height: 16px;
      font-weight: normal;
      color: #6b7280;
      background-color: #fff;
      margin-right: 10px;
      font-size: 16px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .formal-letter {
      margin-top: 5px;
      padding: 5px;
      page-break-before: always;
    }

    .letter-greeting-title {
      text-align: center;
      margin-bottom: 3px;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      font-size: 13pt;
      font-weight: normal;
      color: #1a1a1a;
    }

    .letter-greeting {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      line-height: 1.8;
      color: #1a1a1a;
      margin-bottom: 3px;
      text-align: justify;
      padding: 5px;
      background-color: #ffffff;
      border-radius: 6px;
    }

    .letter-rules {
      margin: 3px 0;
    }

    .rule {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #374151;
      margin-bottom: 6px;
      text-align: justify;
      display: flex;
      align-items: flex-start;
    }
    .rule strong {
      margin-right: 4px;
    }
    .rule .number {
      font-weight: normal;
      margin-right: 8px;
      flex-shrink: 0;
      min-width: 20px;
    }
    .rule .text {
      flex: 1;
      text-align: justify;
    }


    .letter-closing {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #333;
      margin: 3px 0;
      text-align: left;
      font-weight: bold;
    }

    .letter-date {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      color: #333;
      margin: 8px 0;
      text-align: center;
      font-weight: bold;
    }

    .letter-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 3px;
      gap: 30px;
    }

    .signature-item {
      flex: 1;
      text-align: center;
    }

    .signature-label {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      font-weight: bold;
      color: #333;
      margin-bottom: 100px;
    }

    .signature-name {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      margin-top: 8px;
      text-align: center;
    }
  `
}




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
    commune?: string
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
    povertyCard?: string
    religion: string
    churchName: string
    helpAmount?: string
    helpFrequency?: string
    knowSchool?: string
    organizationHelp?: string
    childrenInCare?: string
    canHelpSchool?: boolean
  }
}

// Generate HTML content for student registration
export const generateStudentRegistrationHTML = (data: StudentRegistrationData): string => {
  const studentFullName = `${data.lastName || ''} ${data.firstName || ''}`.trim()
  const genderText = getGenderKhmer(data.gender || '')
  const classLabel = getGradeLabel(data.class)
  const houseType = getHouseTypeKhmer(data.familyInfo?.ownHouse)
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
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ខ្ញុំឈ្មោះ ${studentFullName || '........................'} ជាសិស្ស ភេទ${genderText || '......'} កើតនៅថ្ងៃទី ${formatDateDDMMYYYY(data.dob)} មានអាយុ ${calculateAgeFromDOB(data.dob)} លេខសម្គាល់សិស្ស ${data.studentId || '....'} សូមចុះឈ្មោះចូលរៀន${classLabel} សម្រាប់ឆ្នាំសិក្សា ${data.schoolYear || '........................'}។
      </div>
    </div>

    <div class="section">
      <div class="section-title">អាស័យដ្ឋានបច្ចុប្បន្ន</div>
      <div class="address-summary">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;អាសយដ្ឋានបច្ចុប្បន្នរបស់ខ្ញុំគឺ ផ្ទះលេខ ${data.studentHouseNumber || '........................'} 
        ភូមិ${data.studentVillage || '........................'} 
        ឃុំ${data.studentCommune || '........................'} 
        ស្រុក${data.studentDistrict || '........................'} 
        ខេត្ត​${data.studentProvince || '........................'} 
        ហើយស្រុកកំណើតរបស់ខ្ញុំគឺ ${data.studentBirthDistrict || '........................'}។
      </div>
    </div>

    <div class="section">
      <div class="section-title">អាណាព្យាបាល</div>
      <div class="guardian-info">
        ${(data.guardians || []).map((g, index) => `
          <div class="guardian-item">
            <div class="guardian-details">
              ${getRelationKhmer(g.relation || '')}
              ឈ្មោះ ${[g.lastName, g.firstName].filter(Boolean).join(' ')} 
              មុខរបរជា ${g.occupation || '........................'} 
              មានប្រាក់ចំណូលប្រចាំខែប្រមាណ ${g.income ? parseInt(g.income).toLocaleString() + ' រៀល' : '........................'} 
              មានកូនក្នុងបន្ទុក ${g.childrenCount || '........................'} នាក់ 
              លេខទូរស័ព្ទ ${g.phone || '........................'} 
              ហើយស្នាក់នៅអាសយដ្ឋាន ផ្ទះលេខ ${g.houseNumber || '........................'} 
              ភូមិ ${g.village || '........................'} ឃុំ/សង្កាត់ ${g.commune || '........................'} 
              ស្រុក/ខណ្ឌ ${g.district || '........................'} ខេត្ត/ក្រុង ${g.province || '........................'}។
            </div>
          </div>
        `).join('') || '<div class="guardian-item">មិនមានព័ត៌មានអាណាព្យាបាល</div>'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">ព័ត៌មានពីស្ថានភាពគ្រួសារសិស្ស</div>
      <div class="family-summary">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ស្ថានភាពគ្រួសាររបស់ខ្ញុំគឺរស់នៅជាមួយ${data.familyInfo?.livingWith || '........................'} 
        នៅ${houseType} ហើយបានរស់នៅកំពង់ចាមរយៈពេល ${data.familyInfo?.durationInKPC || '........................'} ឆ្នាំ។ 
        រីឯជីវភាពគ្រួសារ${getLivingConditionKhmer(data.familyInfo?.livingCondition)} ចំពោះប័ណ្ណក្រីក្រ${getPovertyCardKhmer(data.familyInfo?.povertyCard)} 
        និងទទួលជំនួយពីអង្គការ ${data.familyInfo?.organizationHelp || '........................'}។ 
        ខ្ញុំស្គាល់សាលាតាមរយៈ${data.familyInfo?.knowSchool || '........................'} ហើយកាន់សាសនា${getReligionKhmer(data.familyInfo?.religion)} 
        ព្រះវិហារ${data.familyInfo?.churchName || '........................'}។ 
        ចំណែកឯលទ្ធភាពជួយសាលា${getCanHelpSchoolKhmer(data.familyInfo?.canHelpSchool)} ដោយបង់ថវិកាជួយសាលាប្រចាំ${getHelpFrequencyKhmer(data.familyInfo?.helpFrequency)} ${data.familyInfo?.helpAmount || '........................'} រៀល។ 
        លេខទូរស័ព្ទទំនាក់ទំនងគោលគឺ ${data.phone || '........................'}។
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
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;លោកស្រីនាយិកាសាលាមិត្តភាព សូមលោកស្រីអនុញ្ញាតឱ្យកូន ខ្ញុំបាទ/នាងខ្ញុំ ឈ្មោះ <strong>${studentFullName || '........................'}</strong> ភេទ <strong>${genderText || '......'}</strong> ចូលរៀននៅ <strong>${classLabel}</strong> នៃសាលារបស់លោកស្រីដោយអនុគ្រោះ។ ខ្ញុំបាទ/នាងខ្ញុំ សូមសន្យាថានឹងគោរពតាមបទបញ្ជារបស់សាលាដូចខាងក្រោម៖
      </div>

      <div class="letter-rules">
        <div class="rule">
          <span class="number">1.</span>
          <span class="text">ខ្ញុំបាទ/នាងខ្ញុំ នឹងបញ្ជូនកូនឱ្យមករៀនបានទៀងទាត់ និងទាន់ពេលវេលា។</span>
        </div>
        <div class="rule">
          <span class="number">2.</span>
          <span class="text">ខ្ញុំបាទ/នាងខ្ញុំ នឹងខិតខំអប់រំកូនឱ្យក្លាយជាកូនល្អ មិត្តល្អ សិស្សល្អ។</span>
        </div>
        <div class="rule">
          <span class="number">3.</span>
          <span class="text">ខ្ញុំបាទ/នាងខ្ញុំ មិនបញ្ឈប់កូនឱ្យឈប់រៀនដោយគ្មានការអនុញ្ញាតពីសាលារៀនឡើយ។</span>
        </div>
        <div class="rule">
          <span class="number">4.</span>
          <span class="text">ខ្ញុំបាទ/នាងខ្ញុំ នឹងថែរក្សាសម្ភារសិក្សារបស់កូនឱ្យបានល្អ (ក្នុងករណីសៀវភៅរហែកឬបាត់ ខ្ញុំត្រូវទិញសងសាលាវិញ)។</span>
        </div>
        <div class="rule">
          <span class="number">5.</span>
          <span class="text">សិស្សមិនត្រូវយកទូរស័ព្ទដៃមកសាលាជាដាច់ខាត (លើកទី១ឱ្យវិញ លើកទី២មិនឱ្យវិញទេ)។</span>
        </div>
        <div class="rule">
          <span class="number">6.</span>
          <span class="text">ខ្ញុំបាទ/នាងខ្ញុំ នឹងប្រើប្រាស់លេខទូរស័ព្ទឱ្យបានច្បាស់លាស់ ដែលសាលាអាចទាក់ទងបាន (ប្តូរលេខថ្មីត្រូវឱ្យលេខថ្មីមកសាលាជាដាច់ខាត)។</span>
        </div>
        <div class="rule">
          <span class="number">7.</span>
          <span class="text">សិស្សដែលមានអវត្តមានឥតច្បាប់ ៣០ដង/១ឆ្នាំ នឹងត្រូវបញ្ឈប់ពីការសិក្សា។ អវត្តមានច្បាប់ ២ដងស្មើនឹងឥតច្បាប់ ១ដង។</span>
        </div>
        <div class="rule">
          <span class="number">8.</span>
          <span class="text">ប្រសិនបើអាណាព្យាបាលមិនចូលរួមក្នុងការប្រជុំដែលសាលាអញ្ជើញនោះទេ សាលាមានសិទ្ធិបញ្ឈប់កូនដោយស្វ័យប្រវត្តិ។</span>
        </div>
        <div class="rule">
          <span class="number">9.</span>
          <span class="text">សិស្សដែលមិនខិតខំរៀន ធ្លាក់មធ្យមភាគដំណាច់ឆ្នាំ សាលាមានសិទ្ធិបញ្ឈប់សិស្សនោះបន្ទាប់ពីបញ្ចប់ឆ្នាំសិក្សា។</span>
        </div>
        <div class="rule">
          <span class="number">10.</span>
          <span class="text">សិស្សដែលបង្កកំហុសធំៗ (បំផ្លាញទ្រព្យសម្បត្តិ វាយគ្នា ជេរគ្នា លេងអសីលធម៌ មិនគោរពគ្រូ) និងកំហុសស្រាល ៥ដង សាលាមានសិទ្ធិបញ្ឈប់សិស្សនោះ។</span>
        </div>
        <div class="rule">
          <span class="number">11.</span>
          <span class="text">ខ្ញុំបាទ/នាងខ្ញុំ នឹងជួយអប់រំកូនឱ្យគោរពវិន័យ/បទបញ្ជាផ្ទៃក្នុងរបស់សាលាឱ្យបានហ្មត់ចត់។</span>
        </div>
        <div class="rule">
          <span class="number">12.</span>
          <span class="text">អាណាព្យាបាលត្រូវផ្តល់សិទ្ធិសេរីភាពឱ្យសិស្សក្នុងការទទួលជឿលើព្រះយេស៊ូវគ្រីស្ទ។</span>
        </div>
        ${data.class === '9' ? `
        <div class="rule">
          <span class="number">13.</span>
          <span class="text">សិស្សថ្នាក់ទី៩ ដែលមិនគ្រប់មធ្យមភាគ សាលាមានសិទ្ធិដកបេក្ខភាពប្រឡងឌីប្លូម។</span>
        </div>
        <div class="rule">
          <span class="number">14.</span>
          <span class="text">សិស្សដែលចង់បានអាហារូបករណ៍ពីសាលា(រៀនគួរ រូបវិទ្យា គីមីវិទ្យា និងគណិតវិទ្យា) សិស្សត្រូវចូលរួមរៀនគម្ពីរថ្ងៃពុធម៉ោង១១ព្រឹក និងត្រូវចូលរួមថ្វាយបង្គំថ្ងៃអាទិត្យម៉ោង៤:៣០នាទីល្ងាច។</span>
        </div>
        ` : ''}
      </div>
      
      <div class="letter-closing">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;បើខ្ញុំបាទ/នាងខ្ញុំ មិនគោរពតាមកិច្ចសន្យាណាមួយដែលមានចែងនៅខាងលើទេនោះ ខ្ញុំបាទ/នាងខ្ញុំ សូមទទួលខុសត្រូវចំពោះមុខបទបញ្ជាផ្ទៃក្នុងរបស់សាលា។
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
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 10mm 0 0; margin: 0;">
          ពាក្យចុះឈ្មោះសិស្ស
        </div>
      `,
      footerTemplate: `
        <div style="font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 10mm 0 0; margin: 0;">
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
