/*
 * Common Types for PDF Generators
 * 
 * This file contains shared types and interfaces used across
 * all PDF generators in the system.
 */

// Base PDF generator result
export interface PDFResult {
  buffer: Buffer
  filename: string
  filePath?: string
  size?: number
  generatedAt: Date
}

// Student data interface
export interface StudentData {
  studentId: string
  firstName: string
  lastName: string
  gender: string
  dob: string
  age: string
  class: string
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
  registrationDate?: string
  status?: string
  religion?: string
  health?: string
}

// Guardian data interface
export interface GuardianData {
  guardianId: number
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
}

// Family data interface
export interface FamilyData {
  familyinfoId: number
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

// Grade data interface
export interface GradeData {
  gradeId: number
  studentId: number
  subjectId: number
  subjectName: string
  semester: string
  schoolYear: string
  score: number
  grade: string
  remarks: string
  recordedBy: string
  recordedAt: string
}

// Attendance data interface
export interface AttendanceData {
  attendanceId: number
  studentId: number
  studentName: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  courseId: number
  courseName: string
  recordedBy: string
  remarks: string
}

// School year data interface
export interface SchoolYearData {
  schoolYearId: number
  schoolYearCode: string
  startDate: string
  endDate: string
  isActive: boolean
  totalStudents: number
  totalTeachers: number
}

// Financial data interface
export interface FinancialData {
  scholarshipId: number
  studentId: number
  studentName: string
  type: string
  amount: number
  sponsor: string
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'completed'
}

// Report options interface
export interface ReportOptions {
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

// PDF generator configuration
export interface PDFGeneratorConfig {
  outputDir: string
  filenamePrefix: string
  includeTimestamp: boolean
  compressPDF: boolean
  quality: 'low' | 'medium' | 'high'
  defaultOptions: ReportOptions
}

// Report type enumeration
export enum ReportType {
  STUDENT_REGISTRATION = 'student-registration',
  STUDENT_REPORT_CARD = 'student-report-card',
  ATTENDANCE_REPORT = 'attendance-report',
  GRADE_REPORT = 'grade-report',
  SCHOOL_YEAR_REPORT = 'school-year-report',
  FINANCIAL_REPORT = 'financial-report',
  GUARDIAN_REPORT = 'guardian-report',
  FAMILY_REPORT = 'family-report',
  CUSTOM_REPORT = 'custom-report'
}

// Report metadata
export interface ReportMetadata {
  type: ReportType
  title: string
  description: string
  version: string
  author: string
  generatedBy: string
  dataSource: string
  filters?: Record<string, any>
  parameters?: Record<string, any>
}
