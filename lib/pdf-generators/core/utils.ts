/*
 * PDF Generator Utilities
 * 
 * This module provides comprehensive utility functions for PDF generation
 * in the Friendship School Management System. It includes:
 * 
 * 🎨 CSS Management:
 *   - getBaseCSS(): Core fonts and common styles
 *   - getStudentRegistrationCSS(): Complete student registration styling
 *   - getStudentRegistrationCSSWithTheme(): Customizable theme colors
 * 
 * 🌐 Khmer Language Support:
 *   - formatDateKhmer(): Khmer date formatting with day/month names
 *   - getGenderKhmer(): Gender conversion to Khmer
 *   - getRelationKhmer(): Family relation conversion to Khmer
 *   - formatPhoneKhmer(): Phone number formatting in Khmer style
 * 
 * 📄 HTML Generation:
 *   - generateHTMLTemplate(): HTML template with Khmer fonts
 *   - generateCompleteHTML(): Complete HTML document
 *   - generateHTMLFooter(): Standard footer with timestamp
 * 
 * 🔧 Utility Functions:
 *   - getLogoBase64(): Logo conversion for PDF embedding
 *   - validateStudentData(): Data validation
 *   - generateSafeFilename(): Safe filename generation
 *   - formatCurrencyKhmer(): Currency formatting in Khmer
 * 
 * 📁 File Operations:
 *   - savePDFFile(): PDF file saving with directory creation
 *   - ensureOutputDir(): Directory existence verification
 *   - getFileSize(): Human-readable file size formatting
 * 
 * Author: Friendship School Development Team
 * Version: 2.0.0
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 */

import * as fs from 'fs'
import * as path from 'path'
import { ReportOptions, PDFGeneratorConfig } from './types'

// Function to convert logo to base64 based on grade
export const getLogoBase64 = (grade?: string): string => {
  try {
    // Determine which logo to use based on grade
    let logoFilename = 'logo.png' // default fallback
    
    if (grade) {
      // Extract numeric grade from string (e.g., "5" from "5A" or "5")
      const gradeMatch = grade.toString().match(/\d+/)
      const gradeNum = gradeMatch ? parseInt(gradeMatch[0]) : parseInt(grade)
      
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
      const fallbackPath = path.join(process.cwd(), 'public', 'logo.png')
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

// Function to convert NGO logo to base64
export const getNGOLogoBase64 = (): string => {
  try {
    const logoFilename = 'Center-for-the-Future-of-Cambodias-Youth-Logo.png'
    const logoPath = path.join(process.cwd(), 'public', logoFilename)
    
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      return `data:image/png;base64,${logoBuffer.toString('base64')}`
    }
  } catch (error) {
    console.warn('Could not load NGO logo:', error)
  }
  return ''
}

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
      top: '5mm',
      right: '5mm',
      bottom: '5mm',
      left: '5mm'
    },
    includeHeader: true,
    includeFooter: true
  }
}

// Function to get grade label with Khmer text
export const getGradeLabel = (grade: string): string => {
  if (!grade) return 'មិនមាន'
  
  // Handle grade with section (e.g., "5A", "5B", "6A")
  if (grade.length > 1 && /^\d+[A-Z]$/.test(grade)) {
    const gradeNumber = grade.slice(0, -1) // Extract number part
    const section = grade.slice(-1) // Extract letter part
    return `ថ្នាក់ទី ${gradeNumber}${section}`
  }
  
  // Handle grade numbers only
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
    'excused': 'អវត្តមាន(មានច្បាប់)'
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
  
  // Khmer day names
  const dayNames = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍']
  
  // Khmer month names
  const monthNames = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  
  const dayOfWeek = dayNames[d.getDay()]
  const day = d.getDate()
  const month = monthNames[d.getMonth()]
  const year = d.getFullYear()
  
  return `ថ្ងៃ${dayOfWeek} ទី${day} ខែ${month} ឆ្នាំ${year}`
}

// Function to format date in Khmer short format (e.g., "18, សីហា ២០២៥")
export const formatDateKhmerShort = (date: string | Date): string => {
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

// Function to get base CSS styles (fonts and common styles)
export const getBaseCSS = (): string => {
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
      font-size: 14px;
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
  `
}

// Function to get CSS styles for student registration
export const getStudentRegistrationCSS = (): string => {
  return `
    ${getBaseCSS()}

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      gap: 15px;
      position: relative;
      min-height: 120px;
      padding: 10px 0;
    }

    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
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

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      gap: 15px;
      position: relative;
      min-height: 120px;
      padding: 10px 0;
    }

    .logo-container {
      flex-shrink: 0;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: #f9fafb;
    }

    .logo-container img {
      max-width: 100%;
      max-height: 100%;
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
      font-weight: bold;
      text-align: center;
      line-height: 1.2;
      border-radius: 8px;
    }

    .national-header {
      flex: 1;
      text-align: center;
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      padding: 0 20px;
    }

    .national-title {
      font-size: 18px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 5px;
    }

    .national-subtitle {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 3px;
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
      margin-bottom: 15px;
    }

    .header-content {
      text-align: center;
    }

    .header-content h1 {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 16px;
      margin: 0 0 8px 0;
      font-weight: bold;
      color: #1a1a1a;
      letter-spacing: 0.5px;
    }

    .section {
      margin: 10px 0;
      padding: 8px;
    }

    .section-title {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .student-summary {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #1a1a1a;
      padding: 5px;
      background-color: #f8fafc;
      border-radius: 6px;
      text-align: justify;
    }

    .address-summary,
    .family-summary {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #1a1a1a;
      padding: 5px;
      background-color: #f8fafc;
      border-radius: 6px;
      text-align: justify;
    }

    .guardian-info {
      margin-top: 8px;
    }

    .guardian-item {
      margin-bottom: 5px;
      padding: 5px;
    }

    .guardian-name {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
      padding: 5px 5px;
      background-color: #f1f5f9;
      border-radius: 4px;
    }

    .guardian-details {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
      padding: 5px 5px;
      background-color: #f9fafb;
      border-radius: 4px;
      margin-left: 6px;
    }

    .checkbox-section {
      display: flex;
      flex-direction: row;
      gap: 20px;
      white-space: nowrap;
      overflow-x: auto;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      color: #1a1a1a;
      flex-shrink: 0;
      padding: 5px 5px;
      background-color: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .checkbox {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #6b7280;
      text-align: center;
      line-height: 16px;
      font-weight: bold;
      color: #6b7280;
      background-color: #fff;
      margin-right: 10px;
      font-size: 16px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .formal-letter {
      margin-top: 10px;
      padding: 10px;
      page-break-before: always;
    }

    .letter-greeting-title {
      text-align: center;
      margin-bottom: 5px;
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 16px;
      font-weight: bold;
      color: #1a1a1a;
    }

    .letter-greeting {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      line-height: 1.8;
      color: #1a1a1a;
      margin-bottom: 5px;
      text-align: justify;
      padding: 5px;
      background-color: #ffffff;
      border-radius: 6px;
    }

    .letter-rules {
      margin: 5px 0;
    }

    .rule {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #374151;
      margin-bottom: 5px;
      text-align: justify;
      background-color: #ffffff;
      border-radius: 4px;
    }

    .letter-closing {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #333;
      margin: 5px 0;
      text-align: left;
      font-weight: bold;
    }

    .letter-date {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      color: #333;
      margin: 15px 0;
      text-align: center;
      font-weight: bold;
    }

    .letter-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 5px;
      gap: 40px;
    }

    .signature-item {
      flex: 1;
      text-align: center;
    }

    .signature-label {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 100px;
    }

    .signature-name {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      color: #1a1a1a;
      margin-top: 8px;
      text-align: center;
    }

    /* Attendance Report Styles */
    .report-summary {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 15px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    .summary-item {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      color: #374151;
      padding: 5px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      border: 2px solid #e5e7eb;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-card.present {
      border-color: #10b981;
      background-color: #f0fdf4;
    }

    .stat-card.absent {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .stat-card.late {
      border-color: #f59e0b;
      background-color: #fffbeb;
    }

    .stat-card.excused {
      border-color: #8b5cf6;
      background-color: #faf5ff;
    }

    .stat-card.total {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }

    .stat-card.rate {
      border-color: #06b6d4;
      background-color: #ecfeff;
    }

    .stat-number {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .stat-label {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
    }

    .attendance-table, .class-summary-table, .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 12px;
    }

    .attendance-table th, .class-summary-table th, .details-table th {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 8px;
      text-align: center;
      font-weight: bold;
      color: #374151;
    }

    .attendance-table td, .class-summary-table td, .details-table td {
      border: 1px solid #d1d5db;
      padding: 6px;
      text-align: center;
      color: #1f2937;
    }

    .attendance-table tr:nth-child(even), .class-summary-table tr:nth-child(even) {
      background-color: #f9fafb;
    }

    .present {
      color: #059669;
      font-weight: bold;
    }

    .absent {
      color: #dc2626;
      font-weight: bold;
    }

    .late {
      color: #d97706;
      font-weight: bold;
    }

    .excused {
      color: #7c3aed;
      font-weight: bold;
    }

    .rate {
      color: #0891b2;
      font-weight: bold;
    }

    .status-present {
      color: #059669;
      font-weight: bold;
    }

    .status-absent {
      color: #dc2626;
      font-weight: bold;
    }

    .status-late {
      color: #d97706;
      font-weight: bold;
    }

    .status-excused {
      color: #7c3aed;
      font-weight: bold;
    }

    .details-container {
      margin-top: 15px;
    }

    .student-details {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .student-details h4 {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 14px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px;
      padding: 8px;
      background-color: #f3f4f6;
      border-radius: 4px;
    }

    .comments-section {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 10px;
      margin-top: 15px;
    }

    .comment-item {
      margin-bottom: 15px;
    }

    .comment-item strong {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 14px;
      color: #1f2937;
      display: block;
      margin-bottom: 5px;
    }

    .comment-item p, .comment-item li {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 13px;
      color: #374151;
      line-height: 1.6;
      margin-bottom: 5px;
    }

    .comment-item ul {
      margin-left: 20px;
    }

    /* Grade Report Styles */
    .grade-distribution {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin-top: 15px;
    }

    .distribution-item {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .distribution-item:last-child {
      margin-bottom: 0;
    }

    .distribution-label {
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      min-width: 120px;
    }

    .distribution-bar {
      flex: 1;
      height: 20px;
      background-color: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }

    .distribution-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .distribution-fill.excellent {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .distribution-fill.good {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .distribution-fill.average {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    .distribution-fill.poor {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    .distribution-value {
      font-family: 'Khmer MEF2', 'Noto Sans Khmer', sans-serif;
      font-size: 14px;
      font-weight: bold;
      color: #1f2937;
      min-width: 80px;
      text-align: right;
    }

    .stat-card.excellent {
      border-color: #10b981;
      background-color: #f0fdf4;
    }

    .stat-card.good {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }

    .stat-card.average {
      border-color: #f59e0b;
      background-color: #fffbeb;
    }

    .stat-card.poor {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .excellent {
      color: #059669;
      font-weight: bold;
    }

    .good {
      color: #2563eb;
      font-weight: bold;
    }

    .average {
      color: #d97706;
      font-weight: bold;
    }

    .poor {
      color: #dc2626;
      font-weight: bold;
    }
  `
}


// Function to generate HTML template with Khmer fonts
export const generateHTMLTemplate = (title: string): string => {
  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${getStudentRegistrationCSS()}
  </style>
</head>
<body>
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

// Function to generate complete HTML document
export const generateCompleteHTML = (title: string, bodyContent: string): string => {
  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${getStudentRegistrationCSS()}
  </style>
</head>
<body>
  <div class="document">
    ${bodyContent}
  </div>
  ${generateHTMLFooter()}
</body>
</html>
  `
}

// Function to validate and sanitize student data
export const validateStudentDataGeneric = (data: any): boolean => {
  if (!data) return false
  if (!data.firstName || !data.lastName) return false
  if (!data.gender || !data.dob) return false
  return true
}

// Function to format phone number in Khmer style
export const formatPhoneKhmer = (phone: string): string => {
  if (!phone) return 'មិនមាន'
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 0) return 'មិនមាន'
  // Format as XXX XXX XXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`
  }
  return phone
}

// Function to get CSS with custom theme colors
export const getStudentRegistrationCSSWithTheme = (primaryColor: string = '#1a1a1a', secondaryColor: string = '#6b7280'): string => {
  const baseCSS = getStudentRegistrationCSS()
  return baseCSS.replace(/#1a1a1a/g, primaryColor).replace(/#6b7280/g, secondaryColor)
}
