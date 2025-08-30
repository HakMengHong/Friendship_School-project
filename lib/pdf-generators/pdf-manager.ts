/*
 * PDF Manager
 * 
 * Central manager for all PDF generators in the system.
 * Provides a unified interface for generating different types of reports.
 */

import { ReportType, ReportOptions, PDFResult, ReportMetadata } from './types'
import { DEFAULT_CONFIG } from './utils'

// Import all PDF generators
import { generateStudentRegistrationPDF, StudentRegistrationData } from './student-registration'
import { generateStudentReportCardPDF, StudentReportCardData } from './student-report-card'

// Report data types mapping
export type ReportData = 
  | { type: ReportType.STUDENT_REGISTRATION; data: StudentRegistrationData }
  | { type: ReportType.STUDENT_REPORT_CARD; data: StudentReportCardData }
  // Add more report types as they are implemented

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
    options?: Partial<ReportOptions>
  ): Promise<PDFResult> {
    try {
      switch (reportType) {
        case ReportType.STUDENT_REGISTRATION:
          return await generateStudentRegistrationPDF(data as StudentRegistrationData, options)
        
        case ReportType.STUDENT_REPORT_CARD:
          return await generateStudentReportCardPDF(data as StudentReportCardData, options)
        
        // Add more cases as generators are implemented
        case ReportType.ATTENDANCE_REPORT:
          throw new Error('Attendance report generator not yet implemented')
        
        case ReportType.GRADE_REPORT:
          throw new Error('Grade report generator not yet implemented')
        
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
    options?: Partial<ReportOptions>
  ): Promise<PDFResult> {
    const result = await this.generatePDF(reportType, data, options)
    
    // Add metadata to the result
    return {
      ...result,
      metadata
    }
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
        description: 'Attendance report for students',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Attendance Database'
      },
      [ReportType.GRADE_REPORT]: {
        type: ReportType.GRADE_REPORT,
        title: 'របាយការណ៍ពិន្ទុ',
        description: 'Grade report for students',
        version: '1.0.0',
        author: 'Friendship School System',
        generatedBy: 'PDF Generator',
        dataSource: 'Grade Database'
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
export const generatePDF = (reportType: ReportType, data: any, options?: Partial<ReportOptions>) => 
  pdfManager.generatePDF(reportType, data, options)

export const generatePDFWithMetadata = (
  reportType: ReportType, 
  data: any, 
  metadata: ReportMetadata, 
  options?: Partial<ReportOptions>
) => pdfManager.generatePDFWithMetadata(reportType, data, metadata, options)

export const getAvailableReportTypes = () => pdfManager.getAvailableReportTypes()
export const getReportMetadata = (reportType: ReportType) => pdfManager.getReportMetadata(reportType)
