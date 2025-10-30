/*
 * PDF Generators Index
 * 
 * This file provides a unified interface for all PDF generators
 * in the Friendship School Management System.
 * 
 * Available Report Types:
 * - Student Registration Form
 * - Student Report Card
 * - Attendance Report
 * - Grade Report
 * - Student ID Cards (Front & Back)
 * - Teacher ID Cards
 */

// Export all PDF generators
export * from './reports/student-registration'
export * from './reports/student-report-card'
export * from './reports/attendance-report-daily'
export * from './reports/attendance-report-monthly'
export * from './reports/attendance-report-semester'
export * from './reports/attendance-report-yearly'
export * from './reports/grade-report-monthly'
export * from './reports/grade-report-semester'
export * from './reports/grade-report-yearly'
// Removed export - using gradebook-report-monthly-specific.ts instead
export * from './reports/student-list-report'
export * from './reports/student-details-report'
export * from './id-cards/student-id-card'
export * from './id-cards/student-id-card-back'
export * from './id-cards/teacher-id-card'

// Export common types and utilities
export * from './core/types'
export * from './core/utils'

// Export the main PDF generator manager
export * from './core/pdf-manager'
