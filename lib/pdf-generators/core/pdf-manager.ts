/*
 * PDF Manager
 * 
 * Central manager for all PDF generators in the system.
 * Provides a unified interface for generating different types of reports.
 */

import { ReportType, ReportOptions, PDFResult, ReportMetadata } from './types'

// Re-export types for external use
export type { ReportType, ReportOptions, PDFResult, ReportMetadata }
import { DEFAULT_CONFIG } from './utils'

// Import all PDF generators
import { generateStudentRegistrationPDF, StudentRegistrationData } from '../reports/student-registration'
// import { generateStudentReportCardPDF, StudentReportCardData } from '../reports/student-report-card' // Not implemented yet
import { generateAttendanceReportPDF, AttendanceReportData } from '../reports/attendance-report-daily'
import { generateMonthlyAttendanceReportPDF, MonthlyAttendanceReportData } from '../reports/attendance-report-monthly'
import { generateSemesterAttendanceReportPDF, SemesterAttendanceReportData } from '../reports/attendance-report-semester'
import { generateYearlyAttendanceReportPDF, YearlyAttendanceReportData } from '../reports/attendance-report-yearly'
import { generateStudentListReportPDF, StudentListReportData } from '../reports/student-list-report'
import { generateMonthlyGradeReportPDF, MonthlyGradeReportData } from '../reports/grade-report-monthly'
import { generateSemesterGradeReportPDF, SemesterGradeReportData } from '../reports/grade-report-semester'
import { generateYearlyGradeReportPDF, YearlyGradeReportData } from '../reports/grade-report-yearly'
// Removed import - using gradebook-report-monthly-specific.ts instead
import { generateMonthlyGradebookReportPDF, MonthlyGradebookReportData } from '../reports/gradebook-report-monthly'
import { generateSemesterGradebookReportPDF, generateCombinedSemesterGradebookPDF, SemesterGradebookReportData } from '../reports/gradebook-report-semester'
import { generateYearlyGradebookReportPDF, generateCombinedYearlyGradebookPDF, YearlyGradebookReportData } from '../reports/gradebook-report-yearly'

// Local type definitions (moved from removed files)
interface GradebookReportData {
  reportType: 'monthly' | 'semester' | 'yearly'
  academicYear: string
  month?: string
  year?: string
  semester?: string
  class?: string
  startDate?: string
  endDate?: string
  courses: any[]
  overallSummary: any
  generatedAt: string
}

interface StudentGradebookData {
  academicYear: string
  month: string
  year: string
  class: string
  section?: string
  student: {
    studentId: string
    firstName: string
    lastName: string
    gender: string
    dob: string
    photo?: string
    subjects: any[]
    totalGrade: number
    averageGrade: number
    rank: number
    attendance: any
  }
  generatedAt: string
}
import { generateStudentIDCardPDF, generateBulkStudentIDCardPDF, StudentIDCardData, BulkStudentIDCardData } from '../id-cards/student-id-card'
import { generateTeacherIDCardPDF, generateBulkTeacherIDCardPDF, TeacherIDCardData, BulkTeacherIDCardData } from '../id-cards/teacher-id-card'

// Report data types mapping
export type ReportData = 
  | { type: ReportType.STUDENT_REGISTRATION; data: StudentRegistrationData }
  // | { type: ReportType.STUDENT_REPORT_CARD; data: StudentReportCardData } // Not implemented yet
  | { type: ReportType.ATTENDANCE_REPORT; data: AttendanceReportData }
  | { type: ReportType.ATTENDANCE_REPORT_MONTHLY; data: MonthlyAttendanceReportData }
  | { type: ReportType.ATTENDANCE_REPORT_SEMESTER; data: SemesterAttendanceReportData }
  | { type: ReportType.ATTENDANCE_REPORT_YEARLY; data: YearlyAttendanceReportData }
  | { type: ReportType.STUDENT_LIST_REPORT; data: StudentListReportData }
  | { type: ReportType.GRADE_REPORT_MONTHLY; data: MonthlyGradeReportData }
  | { type: ReportType.GRADE_REPORT_SEMESTER; data: SemesterGradeReportData }
  | { type: ReportType.GRADE_REPORT_YEARLY; data: YearlyGradeReportData }
  | { type: ReportType.GRADEBOOK_REPORT; data: GradebookReportData }
  | { type: ReportType.GRADEBOOK_REPORT_MONTHLY; data: MonthlyGradebookReportData }
  | { type: ReportType.GRADEBOOK_REPORT_SEMESTER; data: SemesterGradebookReportData }
  | { type: ReportType.GRADEBOOK_REPORT_SEMESTER_COMBINED; data: SemesterGradebookReportData[] }
  | { type: ReportType.GRADEBOOK_REPORT_YEARLY; data: YearlyGradebookReportData }
  | { type: ReportType.GRADEBOOK_REPORT_YEARLY_COMBINED; data: YearlyGradebookReportData[] }
  | { type: ReportType.STUDENT_GRADEBOOK; data: StudentGradebookData }
  | { type: ReportType.STUDENT_ID_CARD; data: StudentIDCardData }
  | { type: ReportType.TEACHER_ID_CARD; data: TeacherIDCardData }
  | { type: ReportType.BULK_STUDENT_ID_CARD; data: BulkStudentIDCardData }
  | { type: ReportType.BULK_TEACHER_ID_CARD; data: BulkTeacherIDCardData }

// PDF Generator Manager Class
export class PDFManager {
  private config: typeof DEFAULT_CONFIG

  constructor(config?: Partial<typeof DEFAULT_CONFIG>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // Generate PDF based on report type
  async generatePDF(
    reportType: ReportType,
    data: any,
    options?: ReportOptions
  ): Promise<PDFResult> {
    try {
      switch (reportType) {
        case ReportType.STUDENT_REGISTRATION:
          return await generateStudentRegistrationPDF(data as StudentRegistrationData, options)
        
        case ReportType.STUDENT_REPORT_CARD:
          throw new Error('Student report card generator not yet implemented')
        
        // Add more cases as generators are implemented
        case ReportType.ATTENDANCE_REPORT:
          return await generateAttendanceReportPDF(data as AttendanceReportData, options)
        
        case ReportType.ATTENDANCE_REPORT_MONTHLY:
          return await generateMonthlyAttendanceReportPDF(data as MonthlyAttendanceReportData, options)
        
        case ReportType.ATTENDANCE_REPORT_SEMESTER:
          return await generateSemesterAttendanceReportPDF(data as SemesterAttendanceReportData, options)
        
        case ReportType.ATTENDANCE_REPORT_YEARLY:
          return await generateYearlyAttendanceReportPDF(data as YearlyAttendanceReportData, options)
        
        case ReportType.STUDENT_LIST_REPORT:
          return await generateStudentListReportPDF(data as StudentListReportData, options)
        
        
        case ReportType.GRADE_REPORT_MONTHLY:
          const monthlyResult = await generateMonthlyGradeReportPDF(data as MonthlyGradeReportData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
          return {
            buffer: monthlyResult,
            size: monthlyResult.length,
            generatedAt: new Date()
          }
        
        case ReportType.GRADE_REPORT_SEMESTER:
          const semesterResult = await generateSemesterGradeReportPDF(data as SemesterGradeReportData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
          return {
            buffer: semesterResult,
            size: semesterResult.length,
            generatedAt: new Date()
          }
        
        case ReportType.GRADE_REPORT_YEARLY:
          const yearlyResult = await generateYearlyGradeReportPDF(data as YearlyGradeReportData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
          return {
            buffer: yearlyResult,
            size: yearlyResult.length,
            generatedAt: new Date()
          }
        
        case ReportType.GRADEBOOK_REPORT:
          throw new Error('GRADEBOOK_REPORT not supported - use GRADEBOOK_REPORT_MONTHLY instead')
        
        case ReportType.GRADEBOOK_REPORT_MONTHLY:
          const monthlyGradebookResult = await generateMonthlyGradebookReportPDF(data as MonthlyGradebookReportData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
          return {
            buffer: monthlyGradebookResult,
            size: monthlyGradebookResult.length,
            generatedAt: new Date()
          }
        
        case ReportType.GRADEBOOK_REPORT_SEMESTER:
          const semesterGradebookResult = await generateSemesterGradebookReportPDF(data as SemesterGradebookReportData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
          return {
            buffer: semesterGradebookResult,
            size: semesterGradebookResult.length,
            generatedAt: new Date()
          }
        
        case ReportType.GRADEBOOK_REPORT_SEMESTER_COMBINED:
          const combinedSemesterGradebookResult = await generateCombinedSemesterGradebookPDF(data as SemesterGradebookReportData[])
          return {
            buffer: combinedSemesterGradebookResult,
            size: combinedSemesterGradebookResult.length,
            generatedAt: new Date()
          }
        
        case ReportType.GRADEBOOK_REPORT_YEARLY:
          const yearlyGradebookResult = await generateYearlyGradebookReportPDF(data as YearlyGradebookReportData)
          return {
            buffer: yearlyGradebookResult,
            size: yearlyGradebookResult.length,
            generatedAt: new Date()
          }
        
        case ReportType.GRADEBOOK_REPORT_YEARLY_COMBINED:
          const combinedYearlyGradebookResult = await generateCombinedYearlyGradebookPDF(data as YearlyGradebookReportData[])
          return {
            buffer: combinedYearlyGradebookResult,
            size: combinedYearlyGradebookResult.length,
            generatedAt: new Date()
          }
        
        case ReportType.STUDENT_GRADEBOOK:
          throw new Error('STUDENT_GRADEBOOK not supported - use GRADEBOOK_REPORT_MONTHLY instead')
        
        case ReportType.STUDENT_ID_CARD:
          return await generateStudentIDCardPDF(data as StudentIDCardData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
        
        case ReportType.TEACHER_ID_CARD:
          return await generateTeacherIDCardPDF(data as TeacherIDCardData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
        
        case ReportType.BULK_STUDENT_ID_CARD:
          return await generateBulkStudentIDCardPDF(data as BulkStudentIDCardData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
        
        case ReportType.BULK_TEACHER_ID_CARD:
          return await generateBulkTeacherIDCardPDF(data as BulkTeacherIDCardData, options || {
            format: 'A4',
            orientation: 'portrait',
            margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            includeHeader: true,
            includeFooter: true
          })
        
        case ReportType.SCHOOL_YEAR_REPORT:
          throw new Error('School year report generator not yet implemented')
        
        case ReportType.FINANCIAL_REPORT:
          throw new Error('Financial report generator not yet implemented')
        
        case ReportType.GUARDIAN_REPORT:
          throw new Error('Guardian report generator not yet implemented')
        
        case ReportType.FAMILY_REPORT:
          throw new Error('Family report generator not yet implemented')
        
        default:
          throw new Error(`Unknown report type: ${reportType}`)
      }
    } catch (error) {
      console.error(`Error generating PDF for ${reportType}:`, error)
      throw error
    }
  }

  // Generate PDF with metadata
  async generatePDFWithMetadata(
    reportType: ReportType,
    data: any,
    metadata: ReportMetadata,
    options?: ReportOptions
  ): Promise<PDFResult> {
    const result = await this.generatePDF(reportType, data, options)
    
    // Add metadata to the result
    return result
  }

  // Get available report types
  getAvailableReportTypes(): ReportType[] {
    return [
      ReportType.STUDENT_REGISTRATION,
      ReportType.STUDENT_REPORT_CARD,
      // Add more as they are implemented
    ]
  }

  // Get report metadata
  getReportMetadata(reportType: ReportType): ReportMetadata {
    const metadataMap: Record<ReportType, ReportMetadata> = {
      [ReportType.STUDENT_REGISTRATION]: {
        type: ReportType.STUDENT_REGISTRATION,
        title: 'ទម្រង់ចុះឈ្មោះសិស្ស',
        description: 'Student registration form with complete information',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Student Database'
      },
      [ReportType.STUDENT_REPORT_CARD]: {
        type: ReportType.STUDENT_REPORT_CARD,
        title: 'របាយការណ៍វិញ្ញាបនបត្រសិស្ស',
        description: 'Student report card with grades and attendance',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade and Attendance Database'
      },
      [ReportType.ATTENDANCE_REPORT]: {
        type: ReportType.ATTENDANCE_REPORT,
        title: 'របាយការណ៍ការចូលរួម',
        description: 'Daily attendance report for students',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Attendance Database'
      },
      [ReportType.ATTENDANCE_REPORT_MONTHLY]: {
        type: ReportType.ATTENDANCE_REPORT_MONTHLY,
        title: 'របាយការណ៍ការចូលរួមប្រចាំខែ',
        description: 'Monthly attendance report with statistics and trends',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Attendance Database'
      },
      [ReportType.ATTENDANCE_REPORT_SEMESTER]: {
        type: ReportType.ATTENDANCE_REPORT_SEMESTER,
        title: 'របាយការណ៍ការចូលរួមប្រចាំឆមាស',
        description: 'Semester attendance report with monthly breakdowns',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Attendance Database'
      },
      [ReportType.ATTENDANCE_REPORT_YEARLY]: {
        type: ReportType.ATTENDANCE_REPORT_YEARLY,
        title: 'របាយការណ៍ការចូលរួមប្រចាំឆ្នាំ',
        description: 'Yearly attendance report with semester and monthly breakdowns',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Attendance Database'
      },
      [ReportType.STUDENT_LIST_REPORT]: {
        type: ReportType.STUDENT_LIST_REPORT,
        title: 'របាយការណ៍បញ្ជីឈ្មោះសិស្ស',
        description: 'Student list and information reports',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Student Database'
      },
      [ReportType.GRADE_REPORT_MONTHLY]: {
        type: ReportType.GRADE_REPORT_MONTHLY,
        title: 'របាយការណ៍ពិន្ទុប្រចាំខែ',
        description: 'Monthly grade report with government-style formatting',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade Database'
      },
      [ReportType.GRADE_REPORT_SEMESTER]: {
        type: ReportType.GRADE_REPORT_SEMESTER,
        title: 'របាយការណ៍ពិន្ទុប្រចាំឆមាស',
        description: 'Semester grade report for students',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade Database'
      },
      [ReportType.GRADE_REPORT_YEARLY]: {
        type: ReportType.GRADE_REPORT_YEARLY,
        title: 'របាយការណ៍ពិន្ទុប្រចាំឆ្នាំ',
        description: 'Yearly grade report for students',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade Database'
      },
      [ReportType.GRADEBOOK_REPORT]: {
        type: ReportType.GRADEBOOK_REPORT,
        title: 'របាយការណ៍សៀវភៅតាមដាន',
        description: 'Gradebook tracking report',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Gradebook Database'
      },
      [ReportType.STUDENT_GRADEBOOK]: {
        type: ReportType.STUDENT_GRADEBOOK,
        title: 'សៀវភៅតាមដានសិស្សប្រចាំខែ',
        description: 'Individual student gradebook report',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Student Gradebook Database'
      },
      [ReportType.SCHOOL_YEAR_REPORT]: {
        type: ReportType.SCHOOL_YEAR_REPORT,
        title: 'របាយការណ៍ឆ្នាំសិក្សា',
        description: 'School year summary report',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'School Year Database'
      },
      [ReportType.FINANCIAL_REPORT]: {
        type: ReportType.FINANCIAL_REPORT,
        title: 'របាយការណ៍ហិរញ្ញវត្ថុ',
        description: 'Financial report for the school',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Financial Database'
      },
      [ReportType.GUARDIAN_REPORT]: {
        type: ReportType.GUARDIAN_REPORT,
        title: 'របាយការណ៍អាណាព្យាបាល',
        description: 'Guardian information report',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Guardian Database'
      },
      [ReportType.FAMILY_REPORT]: {
        type: ReportType.FAMILY_REPORT,
        title: 'របាយការណ៍គ្រួសារ',
        description: 'Family information report',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Family Database'
      },
      [ReportType.STUDENT_ID_CARD]: {
        type: ReportType.STUDENT_ID_CARD,
        title: 'ប័ណ្ណសម្គាល់សិស្ស',
        description: 'Student ID card',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Student Database'
      },
      [ReportType.TEACHER_ID_CARD]: {
        type: ReportType.TEACHER_ID_CARD,
        title: 'ប័ណ្ណសម្គាល់គ្រូ',
        description: 'Teacher ID card',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'User Database'
      },
      [ReportType.BULK_STUDENT_ID_CARD]: {
        type: ReportType.BULK_STUDENT_ID_CARD,
        title: 'ប័ណ្ណសម្គាល់សិស្ស (ច្រើន)',
        description: 'Bulk student ID cards - 4 per page',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Student Database'
      },
      [ReportType.BULK_TEACHER_ID_CARD]: {
        type: ReportType.BULK_TEACHER_ID_CARD,
        title: 'ប័ណ្ណសម្គាល់គ្រូ (ច្រើន)',
        description: 'Bulk teacher ID cards - 4 per page',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'User Database'
      },
      [ReportType.GRADEBOOK_REPORT_MONTHLY]: {
        type: ReportType.GRADEBOOK_REPORT_MONTHLY,
        title: 'របាយការណ៍សៀវភៅតាមដានប្រចាំខែ',
        description: 'Monthly gradebook report for tracking student progress',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade and Attendance Database'
      },
      [ReportType.GRADEBOOK_REPORT_SEMESTER]: {
        type: ReportType.GRADEBOOK_REPORT_SEMESTER,
        title: 'របាយការណ៍សៀវភៅតាមដានប្រចាំឆមាស',
        description: 'Semester gradebook report for tracking student progress',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade and Attendance Database'
      },
      [ReportType.GRADEBOOK_REPORT_SEMESTER_COMBINED]: {
        type: ReportType.GRADEBOOK_REPORT_SEMESTER_COMBINED,
        title: 'របាយការណ៍សៀវភៅតាមដានប្រចាំឆមាស (រួម)',
        description: 'Combined semester gradebook report for all students in class',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade and Attendance Database'
      },
      [ReportType.GRADEBOOK_REPORT_YEARLY]: {
        type: ReportType.GRADEBOOK_REPORT_YEARLY,
        title: 'របាយការណ៍សៀវភៅតាមដានប្រចាំឆ្នាំ',
        description: 'Yearly gradebook report for tracking student progress',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade and Attendance Database'
      },
      [ReportType.GRADEBOOK_REPORT_YEARLY_COMBINED]: {
        type: ReportType.GRADEBOOK_REPORT_YEARLY_COMBINED,
        title: 'របាយការណ៍សៀវភៅតាមដានប្រចាំឆ្នាំ (រួម)',
        description: 'Combined yearly gradebook report for all students in class',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade and Attendance Database'
      },
      [ReportType.CUSTOM_REPORT]: {
        type: ReportType.CUSTOM_REPORT,
        title: 'របាយការណ៍ផ្ទាល់ខ្លួន',
        description: 'Custom report',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Custom Data'
      }
    }

    return metadataMap[reportType]
  }

  // Update configuration
  updateConfig(newConfig: Partial<typeof DEFAULT_CONFIG>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  getConfig(): typeof DEFAULT_CONFIG {
    return { ...this.config }
  }
}

// Create default PDF manager instance
export const pdfManager = new PDFManager()

// Export convenience functions
export const generatePDF = (reportType: ReportType, data: any, options?: ReportOptions) => 
  pdfManager.generatePDF(reportType, data, options)

export const generatePDFWithMetadata = (
  reportType: ReportType, 
  data: any, 
  metadata: ReportMetadata, 
  options?: ReportOptions
) => pdfManager.generatePDFWithMetadata(reportType, data, metadata, options)

export const getAvailableReportTypes = () => pdfManager.getAvailableReportTypes()
export const getReportMetadata = (reportType: ReportType) => pdfManager.getReportMetadata(reportType)
