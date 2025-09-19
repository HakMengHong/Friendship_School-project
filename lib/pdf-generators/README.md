# 📁 PDF Generators System

A comprehensive, modular PDF generation system for the Friendship School Management System.

## 🏗️ **Directory Structure**

```
lib/pdf-generators/
├── 📁 core/                    # Core system files
│   ├── types.ts                # Type definitions & interfaces
│   ├── utils.ts                # Shared utilities & helpers
│   └── pdf-manager.ts          # Central PDF manager
├── 📁 reports/                 # All report generators
│   ├── student-registration.ts # Student registration forms
│   ├── student-report-card.ts  # Individual report cards
│   ├── student-list-report.ts  # Class lists & rosters
│   ├── attendance-report.ts    # Attendance tracking
│   ├── gradebook-report.ts     # Gradebook management
│   │   ├── grade-report-monthly.ts # Government-style monthly reports
│   ├── grade-report-semester.ts# Semester-specific reports
│   ├── grade-report-yearly.ts  # Annual summary reports
│   └── grade-reports/          # Grade reports index
│       └── index.ts
├── 📁 id-cards/                # ID card generators
│   ├── student-id-card.ts      # Front student ID cards
│   ├── student-id-card-back.ts # Back student ID cards
│   └── teacher-id-card.ts      # Teacher ID cards
├── 📁 docs/                    # Documentation
│   ├── README.md               # System documentation
│   ├── GRADE_REPORTS_REFACTORING.md # Refactoring guide
│   └── DIRECTORY_REVIEW.md     # Directory review
└── index.ts                    # Main exports
```

## 🚀 **Quick Start**

### Basic Usage

```typescript
import { generatePDF, ReportType } from '@/lib/pdf-generators'

// Generate a student registration PDF
const result = await generatePDF(ReportType.STUDENT_REGISTRATION, studentData)

// Generate a monthly grade report
const result = await generatePDF(ReportType.GRADE_REPORT_MONTHLY, gradeData)
```

### Using the PDF Manager

```typescript
import { pdfManager } from '@/lib/pdf-generators/core/pdf-manager'

// Get available report types
const availableTypes = pdfManager.getAvailableReportTypes()

// Get report metadata
const metadata = pdfManager.getReportMetadata(ReportType.STUDENT_REGISTRATION)
```

## 📋 **Available Report Types**

### **Student Management**
- **Student Registration** (`ReportType.STUDENT_REGISTRATION`)
- **Student Report Card** (`ReportType.STUDENT_REPORT_CARD`)
- **Student List Report** (`ReportType.STUDENT_LIST_REPORT`)

### **Grade Reports**
- **Monthly Grade Report** (`ReportType.GRADE_REPORT_MONTHLY`)
- **Semester Grade Report** (`ReportType.GRADE_REPORT_SEMESTER`)
- **Yearly Grade Report** (`ReportType.GRADE_REPORT_YEARLY`)

### **ID Cards**
- **Student ID Card** (`ReportType.STUDENT_ID_CARD`)
- **Student ID Card Back** (`ReportType.BULK_STUDENT_ID_CARD`)
- **Teacher ID Card** (`ReportType.TEACHER_ID_CARD`)

### **Academic Reports**
- **Attendance Report** (`ReportType.ATTENDANCE_REPORT`)
- **Gradebook Report** (`ReportType.GRADEBOOK_REPORT`)

## 🎨 **Key Features**

### **Specialized Grade Reports**
- **Monthly**: Government-style A4 landscape formatting
- **Semester**: Optimized for semester-specific data
- **Yearly**: Annual summary and trend analysis

### **Khmer Language Support**
- Full Unicode and font rendering
- Khmer date formatting
- Gender and relation conversions
- Currency formatting

### **Professional Quality**
- Government-style formatting
- School branding consistency
- Type-safe interfaces
- Error handling

## 🔧 **Development**

### **Adding New Report Types**

1. Create the generator file in the appropriate folder
2. Update the PDF manager imports
3. Add the report type to the enum
4. Update the main index.ts exports

### **File Organization**

- **Core files**: System-wide utilities and types
- **Reports**: All report generators
- **ID Cards**: ID card generators
- **Docs**: Documentation and guides

## 📚 **Documentation**

- **System Overview**: [docs/README.md](docs/README.md)
- **Grade Reports Refactoring**: [docs/GRADE_REPORTS_REFACTORING.md](docs/GRADE_REPORTS_REFACTORING.md)
- **Directory Review**: [docs/DIRECTORY_REVIEW.md](docs/DIRECTORY_REVIEW.md)

## 🎯 **Usage Examples**

### **Generate Monthly Grade Report**

```typescript
import { generatePDF, ReportType } from '@/lib/pdf-generators'

const monthlyData = {
  academicYear: '2024-2025',
  month: '08',
  year: '2025',
  class: '6A',
  students: [...],
  summary: {...}
}

const pdf = await generatePDF(ReportType.GRADE_REPORT_MONTHLY, monthlyData)
```

### **Generate Student ID Cards**

```typescript
import { generateBulkStudentIDCardPDF } from '@/lib/pdf-generators'

const idCardData = {
  students: [...],
  schoolInfo: {...}
}

const pdf = await generateBulkStudentIDCardPDF(idCardData)
```

## 🔮 **Future Enhancements**

- [ ] Template system for custom reports
- [ ] Batch processing capabilities
- [ ] Caching layer for performance
- [ ] API documentation generation
- [ ] Unit test coverage

---

**The PDF Generators System is production-ready and provides a solid foundation for all school report generation needs.** 🚀
