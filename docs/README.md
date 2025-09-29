# PDF Generators System

This folder contains a comprehensive PDF generation system for the Friendship School Management System. The system is designed to be modular, extensible, and maintainable.

## 📁 Folder Structure

```
lib/pdf-generators/
├── index.ts                 # Main exports
├── types.ts                 # Common types and interfaces
├── utils.ts                 # Shared utility functions
├── pdf-manager.ts           # Central PDF manager
├── student-registration.ts  # Student registration form generator
├── student-report-card.ts   # Student report card generator
├── attendance-report.ts     # Attendance report generator (placeholder)
├── grade-report.ts          # Grade report generator (placeholder)
├── school-year-report.ts    # School year report generator (placeholder)
├── financial-report.ts      # Financial report generator (placeholder)
├── guardian-report.ts       # Guardian report generator (placeholder)
├── family-report.ts         # Family report generator (placeholder)
└── README.md               # This file
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { generatePDF, ReportType } from '@/lib/pdf-generators/pdf-manager'

// Generate a student registration PDF
const result = await generatePDF(ReportType.STUDENT_REGISTRATION, studentData)

// Generate with custom options
const result = await generatePDF(ReportType.STUDENT_REGISTRATION, studentData, {
  format: 'A4',
  orientation: 'portrait',
  margins: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm'
  }
})
```

### Using the PDF Manager

```typescript
import { pdfManager } from '@/lib/pdf-generators/pdf-manager'

// Get available report types
const availableTypes = pdfManager.getAvailableReportTypes()

// Get report metadata
const metadata = pdfManager.getReportMetadata(ReportType.STUDENT_REGISTRATION)

// Update configuration
pdfManager.updateConfig({
  outputDir: '/custom/path',
  filenamePrefix: 'custom-prefix'
})
```

## 📋 Available Report Types

### ✅ Implemented

1. **Student Registration** (`ReportType.STUDENT_REGISTRATION`)
   - Complete student registration form
   - Includes guardian and family information
   - Professional layout with Khmer text support

2. **Student Report Card** (`ReportType.STUDENT_REPORT_CARD`)
   - Student grades and attendance
   - Teacher and principal comments
   - Class ranking information

### 🔄 Placeholders (To Be Implemented)

3. **Attendance Report** (`ReportType.ATTENDANCE_REPORT`)
4. **Grade Report** (`ReportType.GRADE_REPORT`)
5. **School Year Report** (`ReportType.SCHOOL_YEAR_REPORT`)
6. **Financial Report** (`ReportType.FINANCIAL_REPORT`)
7. **Guardian Report** (`ReportType.GUARDIAN_REPORT`)
8. **Family Report** (`ReportType.FAMILY_REPORT`)

## 🛠️ Adding New Report Types

### Step 1: Create the Generator File

Create a new file in the `lib/pdf-generators/` folder:

```typescript
// lib/pdf-generators/your-report.ts
import puppeteer from 'puppeteer'
import { PDFResult, ReportOptions } from './types'
import {
  generateSafeFilename,
  savePDFFile,
  mergeReportOptions,
  generateHTMLHeader,
  generateHTMLFooter,
  DEFAULT_CONFIG
} from './utils'

// Define your data interface
export interface YourReportData {
  // Your data structure
}

// Generate HTML content
export const generateYourReportHTML = (data: YourReportData): string => {
  const html = generateHTMLHeader('Your Report Title') + `
    // Your HTML content
  ` + generateHTMLFooter()
  
  return html
}

// Generate PDF
export const generateYourReportPDF = async (
  data: YourReportData,
  options?: Partial<ReportOptions>
): Promise<PDFResult> => {
  // Implementation similar to existing generators
}
```

### Step 2: Update the PDF Manager

Add your report type to the PDF manager:

```typescript
// In pdf-manager.ts
import { generateYourReportPDF, YourReportData } from './your-report'

// Add to ReportData type
export type ReportData = 
  | { type: ReportType.STUDENT_REGISTRATION; data: StudentRegistrationData }
  | { type: ReportType.YOUR_REPORT; data: YourReportData }

// Add to ReportType enum (in types.ts)
export enum ReportType {
  // ... existing types
  YOUR_REPORT = 'your-report'
}

// Add to switch statement in generatePDF method
case ReportType.YOUR_REPORT:
  return await generateYourReportPDF(data as YourReportData, options)

// Add to getAvailableReportTypes method
getAvailableReportTypes(): ReportType[] {
  return [
    // ... existing types
    ReportType.YOUR_REPORT
  ]
}

// Add metadata
getReportMetadata(reportType: ReportType): ReportMetadata {
  const metadataMap: Record<ReportType, ReportMetadata> = {
    // ... existing metadata
    [ReportType.YOUR_REPORT]: {
      type: ReportType.YOUR_REPORT,
      title: 'Your Report Title',
      description: 'Description of your report',
      version: '1.0.0',
      author: 'Friendship School System',
      generatedBy: 'PDF Generator',
      dataSource: 'Your Data Source'
    }
  }
  return metadataMap[reportType]
}
```

## 🎨 Customization

### Report Options

```typescript
interface ReportOptions {
  format: 'A4' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: string
    right: string
    bottom: string
    left: string
  }
  includeHeader: boolean
  includeFooter: boolean
  watermark?: string
  password?: string
}
```

### Configuration

```typescript
interface PDFGeneratorConfig {
  outputDir: string
  filenamePrefix: string
  includeTimestamp: boolean
  compressPDF: boolean
  quality: 'low' | 'medium' | 'high'
  defaultOptions: ReportOptions
}
```

## 🌐 API Usage

### Generate PDF via API

```javascript
const response = await fetch('/api/generate-pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    reportType: 'student-registration',
    data: studentData,
    options: {
      format: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true
    }
  }),
})

const pdfBlob = await response.blob()
```

## 🔧 Utilities

### Available Utility Functions

- `getFileSize()` - Get human-readable file size
- `mergeReportOptions()` - Merge custom options with defaults
- `generateHTMLHeader()` - Generate HTML header with Khmer fonts
- `generateHTMLFooter()` - Generate HTML footer
- `getGradeLabel()` - Convert grade numbers to Khmer labels
- `getGenderKhmer()` - Convert gender to Khmer text
- `getRelationKhmer()` - Convert family relations to Khmer
- `formatCurrencyKhmer()` - Format currency in Khmer
- `formatDateKhmer()` - Format dates in Khmer

## 🧪 Testing

Run the test script to verify the system:

```bash
node scripts/test-new-pdf-system.js
```

## 📝 Notes

- All PDFs are generated using Puppeteer for perfect Khmer font rendering
- PDFs are generated in memory and streamed directly to clients
- No files are stored on the server (pure direct streaming)
- The system supports both portrait and landscape orientations
- All reports include proper headers and footers with school branding

## 🔮 Future Enhancements

- [ ] Add more report types (attendance, grades, etc.)
- [ ] Support for custom templates
- [ ] Batch PDF generation
- [ ] PDF compression options
- [ ] Watermark support
- [ ] Password protection
- [ ] Email integration for automatic sending
