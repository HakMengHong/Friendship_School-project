/*
 * PDF Generator Utilities
 * 
 * Common utility functions used across all PDF generators
 */

import fs from 'fs'
import path from 'path'
import { ReportOptions, PDFGeneratorConfig } from './types'

// Default configuration
export const DEFAULT_CONFIG: PDFGeneratorConfig = {
  outputDir: path.join(process.cwd(), 'public', 'pdf-exports'),
  filenamePrefix: 'friendship-school',
  includeTimestamp: true,
  compressPDF: false,
  quality: 'high',
  defaultOptions: {
    format: 'A4',
    orientation: 'portrait',
    margins: {
      top: '15mm',
      right: '15mm',
      bottom: '15mm',
      left: '15mm'
    },
    includeHeader: true,
    includeFooter: true
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

// Function to convert attendance status to Khmer
export const getAttendanceStatusKhmer = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'present': 'មក',
    'absent': 'អវត្តមាន',
    'late': 'មកយឺត',
    'excused': 'មានអវត្តមានច្បាប់'
  }
  return statusMap[status] || status
}

// Function to format currency in Khmer
export const formatCurrencyKhmer = (amount: number): string => {
  if (!amount || amount === 0) return '០ រៀល'
  return `${amount.toLocaleString('km-KH')} រៀល`
}

// Function to format date in Khmer
export const formatDateKhmer = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Function to generate safe filename
export const generateSafeFilename = (
  prefix: string,
  identifier: string,
  extension: string = 'pdf',
  includeTimestamp: boolean = true
): string => {
  const timestamp = includeTimestamp 
    ? `-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`
    : ''
  
  // Remove non-ASCII characters and replace spaces with hyphens
  const safeIdentifier = identifier
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase()
  
  return `${prefix}-${safeIdentifier}${timestamp}.${extension}`
}

// Function to ensure output directory exists
export const ensureOutputDir = (outputDir: string): void => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
}

// Function to save PDF file
export const savePDFFile = (
  buffer: Buffer,
  filePath: string,
  filename: string
): string => {
  ensureOutputDir(filePath)
  const fullPath = path.join(filePath, filename)
  fs.writeFileSync(fullPath, buffer)
  return fullPath
}

// Function to get file size in human readable format
export const getFileSize = (buffer: Buffer): string => {
  const bytes = buffer.length
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Function to merge report options with defaults
export const mergeReportOptions = (
  customOptions?: Partial<ReportOptions>,
  defaultOptions: ReportOptions = DEFAULT_CONFIG.defaultOptions
): ReportOptions => {
  return {
    ...defaultOptions,
    ...customOptions,
    margins: {
      ...defaultOptions.margins,
      ...customOptions?.margins
    }
  }
}

// Function to generate HTML header with Khmer fonts
export const generateHTMLHeader = (title: string): string => {
  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @font-face {
      font-family: 'Khmer MEF2';
      src: url('/Khmer MEF2 Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    
    @font-face {
      font-family: 'Khmer OS Siemreap';
      src: url('/KhmerOSSiemreap.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }

    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body {
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', 'Inter', sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: white;
      padding: 20px;
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
      margin-bottom: 20px;
      padding: 15px 0;
      border-bottom: 2px solid #000;
    }

    .header h1 {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 18px;
      margin: 0 0 5px 0;
      font-weight: bold;
      color: #1a1a1a;
    }

    .header h2 {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 14px;
      margin: 0 0 3px 0;
      font-weight: 600;
      color: #333;
    }

    .header h3 {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 12px;
      margin: 0;
      font-weight: 500;
      color: #666;
    }

    .section {
      margin: 15px 0;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background-color: #fafafa;
    }

    .section-title {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
      text-decoration: underline;
      text-decoration-color: #007acc;
      text-underline-offset: 3px;
    }

    .student-summary,
    .address-summary,
    .family-summary {
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      padding: 8px;
      background-color: white;
      border-radius: 3px;
      border-left: 3px solid #007acc;
    }

    .guardian-info {
      margin-top: 8px;
    }

    .guardian-item {
      margin-bottom: 8px;
      padding: 8px;
      background-color: white;
      border-radius: 3px;
      border: 1px solid #e0e0e0;
    }

    .guardian-name {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .guardian-details {
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 11px;
      color: #555;
      line-height: 1.4;
    }

    .checkbox-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 12px;
      color: #333;
    }

    .checkbox {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #007acc;
      border-radius: 2px;
      text-align: center;
      line-height: 12px;
      font-weight: bold;
      color: #007acc;
      background-color: #f0f8ff;
    }

    .formal-letter {
      margin-top: 20px;
      padding: 15px;
      border: 2px solid #1a1a1a;
      border-radius: 6px;
      background-color: #fefefe;
    }

    .letter-greeting {
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      margin-bottom: 15px;
      text-align: justify;
    }

    .letter-rules {
      margin: 15px 0;
    }

    .rule {
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #444;
      margin-bottom: 6px;
      text-align: justify;
      padding-left: 10px;
    }

    .letter-closing {
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      margin: 15px 0;
      text-align: justify;
      font-style: italic;
    }

    .letter-date {
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 12px;
      color: #333;
      margin: 15px 0;
      text-align: right;
    }

    .letter-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      gap: 40px;
    }

    .signature-item {
      flex: 1;
      text-align: center;
    }

    .signature-label {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .signature-line {
      height: 1px;
      background-color: #000;
      margin: 20px 0 5px 0;
    }

    .signature-name {
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 10px;
      color: #666;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
    }

    .table th,
    .table td {
      border: 1px solid #000;
      padding: 6px 8px;
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 10px;
      text-align: left;
    }

    .table th {
      background-color: #f0f0f0;
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-weight: bold;
      font-size: 11px;
    }

    .footer {
      margin-top: 20px;
      text-align: center;
      font-family: 'Khmer OS Siemreap', 'Noto Sans Khmer', sans-serif;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 8px;
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
      <h1>${title}</h1>
      <h2>សាលាមិត្តភាព</h2>
      <h3>កំពង់ចាម</h3>
    </div>
  `
}

// Function to generate HTML footer
export const generateHTMLFooter = (): string => {
  return `
    <div class="footer">
      <p>បង្កើតដោយ: ប្រព័ន្ធគ្រប់គ្រងសាលាមិត្តភាព</p>
      <p>កាលបរិច្ឆេទ: ${formatDateKhmer(new Date())}</p>
    </div>
  </div>
</body>
</html>
  `
}
