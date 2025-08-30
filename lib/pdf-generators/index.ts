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
 * - School Year Report
 * - Financial Report
 * - Guardian Information
 * - Family Information
 */

// Export all PDF generators
export * from './student-registration'
export * from './student-report-card'
export * from './attendance-report'
export * from './grade-report'
export * from './school-year-report'
export * from './financial-report'
export * from './guardian-report'
export * from './family-report'

// Export common types and utilities
export * from './types'
export * from './utils'

// Export the main PDF generator manager
export * from './pdf-manager'
