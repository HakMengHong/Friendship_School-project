import puppeteer from 'puppeteer'
import { formatDateKhmer, getLogoBase64 } from '../core/utils'
import { ReportOptions } from '../core/types'

// Constants
const SEMESTER_NAMES = ['ឆមាសទី ១', 'ឆមាសទី ២']
// Simplified grading system using A, B, C, D, E, F

// Helper function for rounding numbers
function round(num: number, decimals: number = 1): string {
  return Number(num.toFixed(decimals)).toFixed(decimals)
}

/**
 * ATTENDANCE-BASED GRADE PENALTY SYSTEM (SEMESTER GRADEBOOK)
 * 
 * Applies a weighted penalty to grades based on student absences during the last month of semester.
 * 
 * Formula: adjustedGrade = originalGrade × (1 - penaltyRate)
 * Where: penaltyRate = min(totalAbsences / 4, 1) × 0.1
 * 
 * Penalty Structure:
 * - Grade Weight: 90% (original grade with penalty)
 * - Attendance Weight: 10% (penalty based on absences)
 * - For every 4 absences, lose 10% of the grade
 * - 1 absence = 2.5% penalty
 * - 2 absences = 5% penalty
 * - 3 absences = 7.5% penalty
 * - 4+ absences = 10% penalty (capped)
 * 
 * Absence Calculation (totalAbsences):
 * - excused (អវត្តមាន(មានច្បាប់)): 0.5 per session
 * - absent (អវត្តមាន(ឥតច្បាប់)): 1.0 per session
 * - late (យឺត): NOT included in penalty calculation
 * 
 * Where session = AM/PM/FULL:
 * - AM or PM = 1 session
 * - FULL = 2 sessions
 * 
 * totalAbsences = (excused × 0.5) + absent
 * 
 * Examples:
 * - Original grade: 50, Absences: 0 → Adjusted: 50.0 (100%)
 * - Original grade: 50, Absences: 2 → Adjusted: 47.5 (95%)
 * - Original grade: 50, Absences: 4 → Adjusted: 45.0 (90%)
 * - Original grade: 40.3, Absences: 3 → Adjusted: 37.27 (92.5%)
 */
const applyAttendancePenalty = (originalGrade: number, totalAbsences: number = 0): number => {
  const penaltyRate = Math.min(totalAbsences / 4, 1) * 0.1  // Max 10% penalty
  const adjustedGrade = originalGrade * (1 - penaltyRate)
  return adjustedGrade
}

// Helper function to determine maxScore based on grade level and subject
// Database subjects: គណិតវិទ្យា, ភាសាខ្មែរ, តែងសេចក្តី, សរសេរតាមអាន, រូបវិទ្យា, គីមីវិទ្យា, ជីវវិទ្យា, 
//                    ផែនដីវិទ្យា, សីលធម៌-ពលរដ្ឋវិទ្យា, ភូមិវិទ្យា, ប្រវត្តិវិទ្យា, អង់គ្លេស
function getSubjectMaxScore(subjectName: string, gradeNum: number): number {
  // Grade 1-6: maxScore = 10
  if (gradeNum >= 1 && gradeNum <= 6) {
    return 10
  }
  
  // Grade 7-8: maxScore = 50, BUT ភាសាខ្មែរ (Khmer) and គណិតវិទ្យា (Math) = 100
  if (gradeNum >= 7 && gradeNum <= 8) {
    // Match exact subject names from database
    if (subjectName === 'គណិតវិទ្យា') return 100  // Math
    if (subjectName === 'ភាសាខ្មែរ') return 100   // Khmer
    return 50  // All other subjects
  }
  
  // Grade 9: Each subject has specific maxScore (exact database names)
  if (gradeNum === 9) {
    if (subjectName === 'តែងសេចក្តី') return 50           // Writing composition
    if (subjectName === 'សរសេរតាមអាន') return 50         // Dictation
    if (subjectName === 'គណិតវិទ្យា') return 100         // Math
    if (subjectName === 'រូបវិទ្យា') return 35           // Physics
    if (subjectName === 'គីមីវិទ្យា') return 25          // Chemistry
    if (subjectName === 'ជីវវិទ្យា') return 35           // Biology
    if (subjectName === 'ផែនដីវិទ្យា') return 25         // Earth Science
    if (subjectName === 'សីលធម៌-ពលរដ្ឋវិទ្យា') return 35  // Civic Education
    if (subjectName === 'ភូមិវិទ្យា') return 32           // Geography
    if (subjectName === 'ប្រវត្តិវិទ្យា') return 33       // History
    if (subjectName === 'អង់គ្លេស') return 50            // English
    return 50 // Default for unknown subjects
  }
  
  // Default fallback
  return 100
}

// Helper function to get letter grade based on adjusted score and maxScore
function getLetterGrade(score: number, maxScore: number): string {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
  
  if (percentage >= 90) return 'A'   // ល្អ​ប្រសើរ >= 90%
  if (percentage >= 80) return 'B'   // ល្អ​ណាស់ >= 80%
  if (percentage >= 70) return 'C'   // ល្អ >= 70%
  if (percentage >= 60) return 'D'   // ល្អ​បង្គួរ >= 60%
  if (percentage >= 50) return 'E'   // ល្អ​បង្គួរ >= 50%
  return 'F' // ខ្សោយ < 50%
}

// Grade status calculation (same as grade-report-semester.ts)
function getGradeStatus(average: number, gradeLevel: string): string {
  const gradeNum = parseInt(gradeLevel) || 0
  
  if (gradeNum >= 1 && gradeNum <= 6) {
    // Grades 1-6: Full average is 10
    if (average >= 9) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (average >= 8) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (average >= 7) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (average >= 6) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (average >= 5) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
  
  if (gradeNum >= 7 && gradeNum <= 9) {
    // Grades 7-9: Full average is 50
    if (average >= 45) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (average >= 40) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (average >= 35) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (average >= 30) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (average >= 25) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
  
  // Fallback for unknown grade levels
  if (average >= 90) return 'A'
  if (average >= 80) return 'B'
  if (average >= 70) return 'C'
  if (average >= 60) return 'D'
  if (average >= 50) return 'E'
  return 'F'
}

// Calculate subject ranks for all students (with attendance penalty applied)
function calculateSubjectRanks(students: any[]): Record<string, Record<string, string>> {
  const subjectRanks: Record<string, Record<string, string>> = {}
  
  // Get all unique subjects
  const allSubjects = new Set<string>()
  students.forEach(student => {
    if (student.subjects) {
      student.subjects.forEach((subject: any) => {
        allSubjects.add(subject.subjectName)
      })
    }
  })
  
  // Calculate ranks for each subject
  allSubjects.forEach(subjectName => {
    // Get all students' grades for this subject WITH ATTENDANCE PENALTY
    const subjectGrades = students
      .map(student => {
        const subject = student.subjects?.find((s: any) => s.subjectName === subjectName)
        if (!subject) return null
        
        // Get total absences for this student
        const totalAbsences = student.totalAbsences || 0
        
        // Apply attendance penalty to subject grade
        const originalGrade = subject.grade || 0
        const adjustedGrade = applyAttendancePenalty(originalGrade, totalAbsences)
        
        return {
          studentId: student.studentId,
          grade: adjustedGrade  // Use adjusted grade for ranking
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.grade || 0) - (a?.grade || 0)) // Sort by adjusted grade descending
    
    // Assign ranks with proper tie handling
    subjectRanks[subjectName] = {}
    let currentRank = 1
    subjectGrades.forEach((studentGrade, index) => {
      if (studentGrade) {
        // Check if this student has the same grade as the previous one
        if (index > 0 && Math.abs((studentGrade.grade || 0) - (subjectGrades[index - 1]?.grade || 0)) < 0.01) {
          // Same grade as previous = same rank (tie)
          const previousStudentId = subjectGrades[index - 1]?.studentId
          if (previousStudentId) {
            subjectRanks[subjectName][studentGrade.studentId] = subjectRanks[subjectName][previousStudentId]
          }
        } else {
          // Different grade = update current rank to current position
          currentRank = index + 1
          subjectRanks[subjectName][studentGrade.studentId] = currentRank.toString()
        }
      }
    })
  })
  
  return subjectRanks
}

// Calculate student data with proper ranking and status (adapted for semester)
function calculateStudentData(student: any, classLevel: string) {
  // Calculate total grade (sum of all subject grades)
  const totalGrade = student.subjects.reduce((sum: number, subject: any) => sum + (subject.grade || 0), 0)
  
  // Calculate average grade
  const averageGrade = student.subjects.length > 0 ? totalGrade / student.subjects.length : 0
  
  // Get status using the same logic as grade-report-semester.ts
  const status = getGradeStatus(averageGrade, classLevel)
  
  return {
    ...student,
    totalGrade: totalGrade,
    averageGrade: averageGrade,
    status: status
  }
}

// Semester Gradebook Report Data Interface (Individual Student)
export interface SemesterGradebookReportData {
  reportType: 'semester'
  academicYear: string
  semester: string
  year: string
  class?: string
  section?: string
  student: {
    studentId: string
    firstName: string
    lastName: string
    gender: string
    photo?: string
    subjects: {
      subjectName: string
      grade: number
      maxGrade: number
      percentage: number
      letterGrade: string
      gradeComment?: string
      subjectRank?: string
    }[]
    totalGrade: number
    averageGrade: number
    monthlyAverage?: number
    overallSemesterAverage?: number
    rank: string
    semesterRank?: string
    monthlyRank?: string
    overallRank?: string
    status: string
    totalAbsences?: number  // Total weighted absences for attendance penalty calculation (last month only)
    attendance: {
      absent: number
      late: number
      excused: number
      total: number
      rate: number
    }
    fullSemesterAttendance?: {  // NEW: All months in semester (for display)
      absent: number
      late: number
      excused: number
      total: number
      rate: number
    }
  }
  generatedAt: string
}

// Generate HTML for Semester Gradebook Report
export function generateSemesterGradebookReportHTML(data: SemesterGradebookReportData): string {
  try {
    // Validate data structure
    if (!data || !data.student) {
      throw new Error('Invalid data structure: missing student data')
    }
    
    const logoBase64 = getLogoBase64(data.class)
    const semesterName = data.semester === '1' ? 'ឆមាសទី ១' : data.semester === '2' ? 'ឆមាសទី ២' : data.semester
    const reportDate = formatDateKhmer(new Date())
    
    // Calculate total absences from attendance data (for penalty)
    const totalAbsences = data.student.totalAbsences || 
      ((data.student.attendance.excused * 0.5) + data.student.attendance.absent)
    
    // Get class level for maxScore calculation
    const classLevel = data.class || '1'
    const gradeNum = parseInt(classLevel)
    
    // Apply attendance penalty to subject grades and recalculate letter grades
    const adjustedSubjects = data.student.subjects.map(subject => {
      const adjustedGrade = applyAttendancePenalty(subject.grade, totalAbsences)
      const correctMaxScore = getSubjectMaxScore(subject.subjectName, gradeNum)
      return {
        ...subject,
        originalGrade: subject.grade,
        grade: adjustedGrade,
        maxGrade: correctMaxScore,  // Update with correct maxScore
        letterGrade: getLetterGrade(adjustedGrade, correctMaxScore)  // Recalculate based on adjusted grade
      }
    })
    
    // Process student data with adjusted grades
    const studentWithAdjustedGrades = {
      ...data.student,
      subjects: adjustedSubjects
    }
    const processedStudent = calculateStudentData(studentWithAdjustedGrades, classLevel)
    const studentRank = processedStudent.rank || '1'
    
    // Calculate adjusted averages following grade-report-semester.ts logic
    // 1. Last month average (មធ្យមភាគឆមាស) - apply penalty to last month
    const adjustedAverageGrade = applyAttendancePenalty(
      data.student.averageGrade, 
      totalAbsences
    )
    
    // 2. Previous months average (មធ្យមភាគខែប្រចាំឆមាស) - already has per-month penalties from API
    const adjustedMonthlyAverage = data.student.monthlyAverage || 0
    
    // 3. Overall semester average (មធ្យមភាគប្រចាំឆមាស) - calculate from adjusted values
    const adjustedOverallSemesterAverage = (adjustedAverageGrade + adjustedMonthlyAverage) / 2
    
    // Calculate separate status (និទ្ទេស) for each average row
    const semesterStatus = getGradeStatus(adjustedAverageGrade, classLevel)  // For មធ្យមភាគឆមាស
    const monthlyStatus = getGradeStatus(adjustedMonthlyAverage, classLevel)  // For មធ្យមភាគខែប្រចាំឆមាស
    const overallStatus = getGradeStatus(adjustedOverallSemesterAverage, classLevel)  // For មធ្យមភាគប្រចាំឆមាស
    
    // Validate student data
    if (!processedStudent.firstName || !processedStudent.lastName) {
      throw new Error('Invalid student data: missing name information')
    }
    
    console.log(`Generating HTML for student: ${processedStudent.firstName} ${processedStudent.lastName}`)
    console.log(`Total absences (for grade penalty - last month only): ${totalAbsences}, Penalty applied: ${Math.min(totalAbsences / 4, 1) * 10}%`)
    console.log(`Full semester attendance (for display):`, {
      late: data.student.fullSemesterAttendance?.late || processedStudent.attendance.late,
      excused: data.student.fullSemesterAttendance?.excused || processedStudent.attendance.excused,
      absent: data.student.fullSemesterAttendance?.absent || processedStudent.attendance.absent,
      total: ((data.student.fullSemesterAttendance?.excused || processedStudent.attendance.excused) * 0.5) + (data.student.fullSemesterAttendance?.absent || processedStudent.attendance.absent)
    })
    console.log(`Adjusted Semester Average: ${adjustedAverageGrade.toFixed(2)} - Status: ${semesterStatus}`)
    console.log(`Adjusted Monthly Average: ${adjustedMonthlyAverage.toFixed(2)} - Status: ${monthlyStatus}`)
    console.log(`Adjusted Overall Semester Average: ${adjustedOverallSemesterAverage.toFixed(2)} - Status: ${overallStatus}`)
    console.log(`Subject letter grades recalculated based on adjusted scores`)
  
  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>លទ្ធផលនៃការសិក្សាប្រចាំឆមាស</title>
  <style>
    /* Khmer font definitions */
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
      font-size: 10pt;
      line-height: 1.4;
      color: #333;
      background: white;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    .document {
      max-width: 210mm;
      margin: 0 auto;
      padding: 5mm;
      background: white;
    }

    .header-section {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .header-left {
      flex: 0 0 80px;
    }

    .school-logo {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }

    .header-center {
      flex: 1;
      text-align: center;
      padding: 0 15px;
    }

    .kingdom-motto {
      font-size: 15pt;
      font-weight: bold;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      margin-bottom: 5px;
    }

    .nation-religion-king {
      font-size: 13pt;
      font-family: 'Khmer MEF2', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
      margin-bottom: 15px;
    }

    .report-title {
      font-size: 13pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      margin-bottom: 10px;
    }

    .class-info {
      font-size: 10pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      margin-bottom: 5px;
    }

    .student-name {
      padding-top: 10px;
      font-size: 12pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }

    .header-right {
      flex: 0 0 80px;
      text-align: center;
    }

    .student-photo {
      width: 96px;
      height: 128px;
      object-fit: cover;
      border-radius: 0;
      border: 2px solid #333;
      margin-right: 20px;
    }

    .photo-placeholder {
      width: 96px;
      height: 128px;
      border: 2px solid #333;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      background: #f5f5f5;
      margin-right: 20px;
    }

    .subject-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      border: 1px solid #333;
      font-size: 9pt;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      table-layout: fixed;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 2px solid #333;
      border-top: none;
      font-size: 9pt;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      table-layout: fixed;
    }

    .subject-table th {
      background: #f0f0f0;
      padding: 5px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #333;
    }

    .subject-table td {
      padding: 5px;
      border: 1px solid #333;
    }

    .summary-table td {
      padding: 5px;
      border: 2px solid #333;
    }

    .subject-name {
      font-weight: bold;
    }

    .grade-value {
      text-align: center;
      font-weight: bold;
    }

    .summary-row {
      background: #f9f9f9;
      font-weight: bold;
    }

    .attendance-row {
      background: #f9f9f9;
      font-weight: bold;
      text-align: center;
    }

    .attendance-row td {
      text-align: center;
      font-size: 10pt;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
    }

    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
    }

    .signature-part {
      text-align: center;
      margin: 0 5px;
    }

    .signature-part:first-child {
      flex: 1;
    }

    .signature-part:nth-child(2) {
      flex: 2;
    }

    .signature-part:last-child {
      flex: 1;
    }

    .signature-title {
      font-size: 10pt;
      font-weight: bold;
      font-family: 'Khmer OS Siemreap', 'Khmer MEF2', 'Arial Unicode MS', sans-serif;
      margin-bottom: 15px;
    }

    .signature-line {
      height: 20px;
      margin-bottom: 10px;
      white-space: nowrap;
      font-size: 9pt;
    }
  </style>
</head>
<body>
  <div class="document">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-left">
        ${logoBase64 ? `<img src="${logoBase64}" alt="School Logo" class="school-logo" />` : ''}
      </div>
      
      <div class="header-center">
        <div class="kingdom-motto">ព្រះរាជាណាចក្រកម្ពុជា</div>
        <div class="nation-religion-king">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
        <div class="report-title">លទ្ធផលនៃការសិក្សាប្រចាំឆមាស ${semesterName} ឆ្នាំ ${data.year}</div>
        <div class="class-info">ថ្នាក់ទី ${data.class}${data.section}</div>
        <div class="student-name">${processedStudent.lastName} ${processedStudent.firstName}</div>
      </div>
      
      <div class="header-right">
        ${processedStudent.photo ? 
          `<img src="${processedStudent.photo}" alt="Student Photo" class="student-photo" />` : 
          `<div class="photo-placeholder">រូបសិស្ស</div>`
        }
      </div>
    </div>

    <!-- Subject Table -->
    <table class="subject-table">
      <thead>
        <tr>
          <th style="width: 30%;">មុខវិជ្ជា</th>
          <th style="width: 12%;">ពិន្ទុ</th>
          <th style="width: 12%;">ចំណាត់ថ្នាក់ពិន្ទុ</th>
          <th style="width: 12%;">និទ្ទេស</th>
          <th style="width: 34%;">ចំនុចដែលត្រូវជួយពង្រឹងបន្ថែម</th>
        </tr>
      </thead>
      <tbody>
        ${processedStudent.subjects.map((subject: any) => `
          <tr>
            <td class="subject-name">${subject.subjectName}</td>
            <td class="grade-value">${round(subject.grade)}</td>
            <td class="grade-value">${subject.subjectRank || 'N/A'}</td>
            <td class="grade-value">${subject.letterGrade}</td>
            <td>${subject.gradeComment}</td>
          </tr>
        `).join('')}
        
      </tbody>
    </table>

    <!-- Summary Table -->
    <table class="summary-table">
      <tbody>
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">ពិន្ទុសរុបឆមាស</td>
          <td class="grade-value" style="width: 25%;">${round(processedStudent.totalGrade, 2)}</td>
          <td class="grade-value" style="width: 25%;">ចំណាត់ថ្នាក់</td>
          <td class="grade-value" style="width: 25%;">និទ្ទេស</td>
        </tr>
        
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">មធ្យមភាគឆមាស</td>
          <td class="grade-value" style="width: 25%;">${round(adjustedAverageGrade, 2)}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.semesterRank || 'N/A'}</td>
          <td class="grade-value" style="width: 25%;">${semesterStatus}</td>
        </tr>
        
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">មធ្យមភាគខែប្រចាំឆមាស</td>
          <td class="grade-value" style="width: 25%;">${round(adjustedMonthlyAverage, 2)}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.monthlyRank || 'N/A'}</td>
          <td class="grade-value" style="width: 25%;">${monthlyStatus}</td>
        </tr>
        
        <tr class="summary-row">
          <td class="grade-value" style="width: 25%;">មធ្យមភាគប្រចាំឆមាស</td>
          <td class="grade-value" style="width: 25%;">${round(adjustedOverallSemesterAverage, 2)}</td>
          <td class="grade-value" style="width: 25%;">${processedStudent.overallRank || 'N/A'}</td>
          <td class="grade-value" style="width: 25%;">${overallStatus}</td>
        </tr>
        
        <!-- Attendance Row -->
        <tr class="attendance-row">
          <td colspan="4">អវត្តមានប្រចាំឆមាស ${semesterName} យឺត: ${(data.student.fullSemesterAttendance?.late || processedStudent.attendance.late)} ដង ច្បាប់: ${(data.student.fullSemesterAttendance?.excused || processedStudent.attendance.excused)} ដង ឥតច្បាប់: ${(data.student.fullSemesterAttendance?.absent || processedStudent.attendance.absent)} ដង សរុប: ${round(((data.student.fullSemesterAttendance?.excused || processedStudent.attendance.excused) * 0.5) + (data.student.fullSemesterAttendance?.absent || processedStudent.attendance.absent), 1)} ដង</td>
        </tr>
      </tbody>
    </table>


    <!-- Signature Section -->
    <div class="signature-section">
      <div class="signature-part">
        <div class="signature-title">បានឃើញ និងឯកភាព</div>
        <div class="signature-line">${reportDate}</div>
        <div class="signature-line">នាយិកាសាលា</div>
      </div>

      <div class="signature-part">
        <div class="signature-title">មតិរបស់មាតាបិតា ឫ អាណាព្យាបាលសិស្ស</div>
      </div>

      <div class="signature-part">
        <div class="signature-title">គ្រូបន្ទុកថ្នាក់</div>
        <div class="signature-line">${reportDate}</div>
        <div class="signature-line">គ្រូបន្ទុកថ្នាក់</div>
      </div>
    </div>
  </div>
</body>
</html>
  `
  } catch (error) {
    console.error('Error generating HTML for semester gradebook report:', error)
    throw new Error(`Failed to generate HTML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Generate PDF for Semester Gradebook Report
export async function generateSemesterGradebookReportPDF(data: SemesterGradebookReportData, options: ReportOptions = {
  format: 'A4',
  orientation: 'portrait',
  margins: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
  includeHeader: true,
  includeFooter: true
}): Promise<Buffer> {
  const html = generateSemesterGradebookReportHTML(data)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // Set viewport for better rendering
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    
    // Set content with better options
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle0 for faster rendering
      timeout: 90000 // Increased timeout for complex calculations
    })
    
    // Wait for fonts to render
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

// Generate combined PDF for multiple students (similar to monthly)
export async function generateCombinedSemesterGradebookPDF(individualReports: SemesterGradebookReportData[]): Promise<Buffer> {
  console.log(`Generating combined semester gradebook PDF for ${individualReports.length} students`)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // Set viewport for better rendering
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    
    // Process all student HTMLs and combine them
    const combinedHTML = await processStudentHTMLs(individualReports, generateSemesterGradebookReportHTML)
    
    // Set content with better options
    await page.setContent(combinedHTML, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle0 for faster rendering
      timeout: 90000 // Increased timeout for complex calculations
    })
    
    // Wait for fonts to render
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false
    })
    
    console.log(`Successfully generated combined semester gradebook PDF`)
    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('Error generating combined semester gradebook PDF:', error)
    throw new Error(`Failed to generate combined semester gradebook: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    await browser.close()
  }
}

// Helper function to process student HTMLs and combine them
async function processStudentHTMLs(
  individualReports: SemesterGradebookReportData[], 
  generateHTMLFunction: (data: SemesterGradebookReportData) => string
): Promise<string> {
  console.log(`Processing ${individualReports.length} individual semester reports`)
  
  const studentHTMLs = individualReports.map((reportData, index) => {
    console.log(`Processing student ${index + 1}/${individualReports.length}: ${reportData.student.firstName} ${reportData.student.lastName}`)
    return generateHTMLFunction(reportData)
  })
  
  // Extract CSS from the first student's HTML
  const firstHTML = studentHTMLs[0]
  const styleMatch = firstHTML.match(/<style>([\s\S]*?)<\/style>/)
  const extractedCSS = styleMatch ? styleMatch[1] : ''
  
  // Extract body content from all student HTMLs
  const bodyContents = studentHTMLs.map(html => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)
    return bodyMatch ? bodyMatch[1] : html
  })
  
  // Combine all body contents with page breaks
  const combinedBody = bodyContents.map((bodyContent, index) => {
    if (index === 0) return bodyContent
    return `<div style="page-break-before: always;">${bodyContent}</div>`
  }).join('')
  
  // Create combined HTML
  const combinedHTML = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>លទ្ធផលនៃការសិក្សាប្រចាំឆមាស</title>
  <style>
    ${extractedCSS}
  </style>
</head>
<body>
  ${combinedBody}
</body>
</html>
  `
  
  console.log(`Successfully combined ${studentHTMLs.length} student HTMLs`)
  return combinedHTML
}
