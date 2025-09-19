import puppeteer from 'puppeteer'
import { generateHTMLFooter, formatDateKhmer, getGradeLabel, getLogoBase64, getStudentRegistrationCSS } from '../core/utils'
import { ReportOptions } from '../core/types'

// Constants
const MONTH_NAMES = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
const GRADE_THRESHOLDS = {
  // For grades 1-6 (full average is 10)
  A_PLUS: 9.5, // ល្អ​ប្រសើរ​ណាស់ = មធ្យមភាគ x ០,៩៥
  A: 9,        // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
  A_MINUS: 8.5, // ល្អ​ប្រសើរ​បង្គួរ = មធ្យមភាគ x ០,៨៥
  B_PLUS: 8,   // ល្អ​ណាស់​ណាស់ = មធ្យមភាគ x ០,៨
  B: 7.5,      // ល្អ​ណាស់ = មធ្យមភាគ x ០,៧៥
  B_MINUS: 7,  // ល្អ​ណាស់​បង្គួរ = មធ្យមភាគ x ០,៧
  C_PLUS: 6.5, // ល្អ​ណាស់ = មធ្យមភាគ x ០,៦៥
  C: 6,        // ល្អ​ = មធ្យមភាគ x ០,៦
  C_MINUS: 5.5, // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥៥
  D: 5,        // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
  // For grades 7-9 (full average is 50)
  A_PLUS_HIGH: 47.5, // ល្អ​ប្រសើរ​ណាស់ = មធ្យមភាគ x ០,៩៥
  A_HIGH: 45,        // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
  A_MINUS_HIGH: 42.5, // ល្អ​ប្រសើរ​បង្គួរ = មធ្យមភាគ x ០,៨៥
  B_PLUS_HIGH: 40,   // ល្អ​ណាស់​ណាស់ = មធ្យមភាគ x ០,៨
  B_HIGH: 37.5,      // ល្អ​ណាស់ = មធ្យមភាគ x ០,៧៥
  B_MINUS_HIGH: 35,  // ល្អ​ណាស់​បង្គួរ = មធ្យមភាគ x ០,៧
  C_PLUS_HIGH: 32.5, // ល្អ​ណាស់ = មធ្យមភាគ x ០,៦៥
  C_HIGH: 30,        // ល្អ​ = មធ្យមភាគ x ០,៦
  C_MINUS_HIGH: 27.5, // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥៥
  D_HIGH: 25         // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
} as const

// Types
type Student = MonthlyGradeReportData['students'][0]
type Subject = Student['subjects'][0]
type Summary = MonthlyGradeReportData['summary']

export interface MonthlyGradeReportData {
  academicYear: string
  month: string
  year: string
  class?: string
  section?: string
  students: {
    studentId: string
    firstName: string
    lastName: string
    class: string
    gender: string
    dob: string
    subjects: {
      subjectName: string
      grade: number
      maxGrade: number
      percentage: number
      letterGrade: string
    }[]
    totalGrade: number
    averageGrade: number
    rank: number
    status: string
  }[]
  summary: {
    totalStudents: number
    averageGrade: number
    highestGrade: number
    lowestGrade: number
    gradeDistribution: {
      excellent: number
      good: number
      average: number
      poor: number
    }
    classAverage: number
    passRate: number
    droppedStudentsCount: number
    femaleDroppedStudentsCount: number
  }
  generatedAt: string
}

// Helper Functions
const round = (num: number, decimals: number = 1): string => {
  return Number(num.toFixed(decimals)).toFixed(decimals)
}

const getGradeStatus = (average: number, gradeLevel: string): string => {
  const gradeNum = parseInt(gradeLevel) || 0
  
  if (gradeNum >= 1 && gradeNum <= 6) {
    // Grades 1-6: Full average is 10
    if (average >= GRADE_THRESHOLDS.A_PLUS) return 'A+' // ល្អ​ប្រសើរ​ណាស់
    if (average >= GRADE_THRESHOLDS.A) return 'A'       // ល្អ​ប្រសើរ
    if (average >= GRADE_THRESHOLDS.A_MINUS) return 'A-' // ល្អ​ប្រសើរ​បង្គួរ
    if (average >= GRADE_THRESHOLDS.B_PLUS) return 'B+'  // ល្អ​ណាស់​ណាស់
    if (average >= GRADE_THRESHOLDS.B) return 'B'        // ល្អ​ណាស់
    if (average >= GRADE_THRESHOLDS.B_MINUS) return 'B-' // ល្អ​ណាស់​បង្គួរ
    if (average >= GRADE_THRESHOLDS.C_PLUS) return 'C+'  // ល្អ​ណាស់
    if (average >= GRADE_THRESHOLDS.C) return 'C'        // ល្អ​
    if (average >= GRADE_THRESHOLDS.C_MINUS) return 'C-' // ល្អ​បង្គួរ
    if (average >= GRADE_THRESHOLDS.D) return 'D'        // ល្អ​បង្គួរ
    return 'F' // ខ្សោយ
  }
  
  if (gradeNum >= 7 && gradeNum <= 9) {
    // Grades 7-9: Full average is 50
    if (average >= GRADE_THRESHOLDS.A_PLUS_HIGH) return 'A+' // ល្អ​ប្រសើរ​ណាស់
    if (average >= GRADE_THRESHOLDS.A_HIGH) return 'A'       // ល្អ​ប្រសើរ
    if (average >= GRADE_THRESHOLDS.A_MINUS_HIGH) return 'A-' // ល្អ​ប្រសើរ​បង្គួរ
    if (average >= GRADE_THRESHOLDS.B_PLUS_HIGH) return 'B+'  // ល្អ​ណាស់​ណាស់
    if (average >= GRADE_THRESHOLDS.B_HIGH) return 'B'        // ល្អ​ណាស់
    if (average >= GRADE_THRESHOLDS.B_MINUS_HIGH) return 'B-' // ល្អ​ណាស់​បង្គួរ
    if (average >= GRADE_THRESHOLDS.C_PLUS_HIGH) return 'C+'  // ល្អ​ណាស់
    if (average >= GRADE_THRESHOLDS.C_HIGH) return 'C'        // ល្អ​
    if (average >= GRADE_THRESHOLDS.C_MINUS_HIGH) return 'C-' // ល្អ​បង្គួរ
    if (average >= GRADE_THRESHOLDS.D_HIGH) return 'D'        // ល្អ​បង្គួរ
    return 'F' // ខ្សោយ
  }
  
  // Fallback for unknown grade levels
  if (average >= GRADE_THRESHOLDS.A_PLUS) return 'A+'
  if (average >= GRADE_THRESHOLDS.A) return 'A'
  if (average >= GRADE_THRESHOLDS.A_MINUS) return 'A-'
  if (average >= GRADE_THRESHOLDS.B_PLUS) return 'B+'
  if (average >= GRADE_THRESHOLDS.B) return 'B'
  if (average >= GRADE_THRESHOLDS.B_MINUS) return 'B-'
  if (average >= GRADE_THRESHOLDS.C_PLUS) return 'C+'
  if (average >= GRADE_THRESHOLDS.C) return 'C'
  if (average >= GRADE_THRESHOLDS.C_MINUS) return 'C-'
  if (average >= GRADE_THRESHOLDS.D) return 'D'
  return 'F'
}

const getGenderKhmer = (gender: string): string => {
  return gender.toLowerCase() === 'male' ? 'ប' : 'ស'
}

const isFemaleStudent = (gender: string): boolean => {
  const normalizedGender = gender.toLowerCase()
  return ['female', 'f', 'ស្រី', 'ស'].includes(normalizedGender)
}

const getStudentGrade = (student: Student, subjectName: string): string => {
  const subject = student.subjects.find(s => s.subjectName === subjectName)
  const grade = subject?.grade || 0
  return round(grade)
}

const calculateValidGrades = (students: Student[], gradeExtractor: (student: Student) => number): number[] => {
  return students
    .map(gradeExtractor)
    .filter(grade => typeof grade === 'number' && !isNaN(grade) && grade >= 0)
}

const getStudentGradeNumber = (student: Student, subjectName: string): number => {
  const subject = student.subjects.find(s => s.subjectName === subjectName)
  return subject?.grade || 0
}

const calculateAverage = (grades: number[]): string => {
  if (grades.length === 0) return '-'
  const sum = grades.reduce((total, grade) => total + grade, 0)
  return round(sum / grades.length)
}

const getReportDate = (): string => {
  const today = new Date()
  const day = today.getDate().toString()
  const month = MONTH_NAMES[today.getMonth()]
  const year = today.getFullYear().toString()
  return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`
}

export function generateMonthlyGradeReportHTML(data: MonthlyGradeReportData): string {
  const logoBase64 = getLogoBase64(data.class)
  const monthName = MONTH_NAMES[parseInt(data.month) - 1] || data.month
  const reportDate = getReportDate()
  
  // Get unique subjects from all students
  const allSubjects = data.students.flatMap(student => student.subjects)
  const uniqueSubjects = Array.from(new Set(allSubjects.map(subject => subject.subjectName)))
  
  // Sort students by total grade (highest first) for ranking
  const sortedStudents = [...data.students].sort((a, b) => b.totalGrade - a.totalGrade)
  const studentsWithRank = sortedStudents.map((student, index) => ({
    ...student,
    averageGrade: student.averageGrade,
    rank: index + 1,
    status: getGradeStatus(student.averageGrade, data.class || '9')
  }))

  // Helper functions for statistics
  const getFemaleStudents = (): Student[] => {
    return data.students.filter(student => isFemaleStudent(student.gender))
  }

  const getFemaleStudentCount = (): number => {
    return getFemaleStudents().length
  }

  const getFemaleAverageForSubject = (subject: string): string => {
    const validGrades = calculateValidGrades(data.students, student => {
      return getStudentGradeNumber(student, subject)
    })
    return calculateAverage(validGrades)
  }

  const getFemaleTotalAverage = (): string => {
    const validGrades = calculateValidGrades(data.students, student => student.totalGrade)
    return calculateAverage(validGrades)
  }

  const getFemaleOverallAverage = (): string => {
    const validGrades = calculateValidGrades(data.students, student => {
      return student.averageGrade
    })
    return calculateAverage(validGrades)
  }

  // Check if there are students and scores
  const hasStudents = data.students && data.students.length > 0
  const hasScores = hasStudents && data.students.some(student => 
    student.subjects && student.subjects.length > 0 && 
    student.subjects.some(subject => subject.grade > 0)
  )

  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <meta name="generator" content="">
  <title>របាយការណ៍ពិន្ទុប្រចាំខែ</title>
  <style>
    /* Base Styles */
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      margin: 0;
      padding: 0;
      font-size: 9pt;
      line-height: 1.5;
      color: #333;
    }
    
    .document {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background: white;
      min-height: 100vh;
    }
    
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    
    /* Header Styles */
    .header-section {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      width: 100%;
    }
    
    .header-left {
      position: absolute;
      left: 5%;
      top: 10%;
    }
    
    .header-center {
      flex: 1;
      text-align: center;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
      z-index: 1;
    }
    
    .school-logo {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }
    
    .kingdom-motto {
      font-size: 15pt;
      font-weight: bold;
      margin: 0 0 6px 0;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
      color: #000;
    }
    
    .nation-religion-king {
      font-size: 13pt;
      font-family: 'Khmer MEF2', 'Khmer OS', 'Khmer', sans-serif;
      color: #000;
      margin: 0 0 50px 0;
    }
    
    .report-title {
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #000;
    }
    
    /* Table Styles */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 10px 0;
      border: 2px solid #000;
      table-layout: fixed;
      max-width: 100%;
    }
    
    th, td {
      border: 1px solid #000;
      padding: 3px 4px;
      text-align: center;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      font-size: 10pt;
      vertical-align: middle;
    }
    
    th {
      background: #f0f0f0;
      color: #000;
      font-weight: bold;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      height: 147px;
      padding: 4px;
    }
    
    th.normal-text {
      writing-mode: horizontal-tb;
      text-orientation: initial;
      background: #f0f0f0;
      text-align: center;
      vertical-align: middle;
    }
    
    /* Column Widths */
    th:nth-child(1), td:nth-child(1) { /* ល.រ */
      width: 33px;
    }
    
    th:nth-child(2), td:nth-child(2) { /* ឈ្មោះ */
      width: 110px;
    }
    
    th:nth-child(3), td:nth-child(3) { /* ភេទ */
      width: 35px;
    }
    
    /* Custom widths for last 4 columns */
    th:last-child, td:last-child { /* ចំណាត់ថ្នាក់ */
      width: 50px;
    }
    
    th:nth-last-child(2), td:nth-last-child(2) { /* និទ្ទេស */
      width: 60px;
    }
    
    th:nth-last-child(3), td:nth-last-child(3) { /* មធ្យមភាគ */
      width: 45px;
    }
    
    th:nth-last-child(4), td:nth-last-child(4) { /* សរុប */
      width: 52px;
    }
    
    tbody tr {
      height: 20px;
    }
    
    tbody tr:nth-child(even) {
      background-color: #f8f8f8;
    }
    
    .summary-row {
      background: #e8e8e8 !important;
      font-weight: bold;
    }
    
    .summary-text {
      text-align: center;
      font-weight: bold;
      color: #000;
      padding-left: 10px;
    }
    
    .student-name {
      text-align: left;
      font-weight: 500;
      padding: 2px 6px;
      width: 120px;
      height: 20px;
      vertical-align: middle;
      word-wrap: break-word;
      overflow: hidden;
    }
    
    .student-number {
      text-align: center;
      font-weight: 500;
      padding: 2px 4px;
      width: 60px;
      height: 20px;
      vertical-align: middle;
    }
    
    .student-gender {
      text-align: center;
      font-weight: 500;
      padding: 2px 4px;
      width: 60px;
      height: 20px;
      vertical-align: middle;
    }
    
    /* Study Results Section */
    .study-results-section {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif;
      gap: 20px;
      page-break-inside: avoid;
    }
    
    .results-part, .approval-part, .signature-part {
      flex: 1;
    }
    
    .results-part {
      justify-content: center;
      align-items: center;
    }
    
    .part-title {
      font-weight: bold;
      font-size: 12pt;
      text-align: center;
      padding: 10px 15px;
      color: #000;
    }
    
    .part {
      font-weight: bold;
      font-size: 10pt;
      text-align: left;
      padding-left: 20px;
      color: #000;
    }
    
    .results-content {
      font-size: 8pt;
    }
    
    .result-line {
      display: flex;
      align-items: center;
      padding: 4px 0;
    }
    
    .result-line:last-child {
      border-bottom: none;
    }
    
    .result-label {
      font-weight: bold;
      min-width: 35px;
      color: #000;
    }
    
    .result-count {
      margin-right: 10px;
      font-weight: 500;
    }
    
    .result-female {
      font-style: italic;
      color: #666;
      font-size: 8pt;
    }
    
    .approval-content, .signature-content {
      text-align: center;
    }
    
    .approval-line, .signature-line {
      margin-bottom: 15px;
    }
    
    .approval-line:last-child, .signature-line:last-child {
      font-weight: bold;
      font-size: 11pt;
    }
    
    .approval-line:first-child, .signature-line:first-child {
      font-size: 11pt;
      font-weight: normal;
    }
    
    /* No Data Message Styles */
    .no-data-message {
      text-align: center;
      padding: 50px 20px;
      font-size: 14pt;
      color: #666;
      font-weight: bold;
      background: #f9f9f9;
      border: 2px dashed #ccc;
      margin: 20px 0;
      border-radius: 8px;
    }
    
    .no-data-title {
      font-size: 16pt;
      color: #333;
      margin-bottom: 15px;
    }
    
    .no-data-subtitle {
      font-size: 12pt;
      color: #666;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header-section">
      <div class="header-left">
        ${logoBase64 ? `<img src="${logoBase64}" alt="School Logo" class="school-logo" />` : ''}
      </div>
      <div class="header-center">
        <div class="kingdom-motto">ព្រះរាជាណាចក្រកម្ពុជា</div>
        <div class="nation-religion-king">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
      </div>
    </div>
    
    <div class="report-title">
      បញ្ជីពិន្ទុប្រចាំខែ ${monthName} ឆ្នាំ ${data.year} ថ្នាក់ទី ${data.class || 'N/A'}${data.section ? data.section : ''}
    </div>

    ${!hasStudents ? `
      <div class="no-data-message">
        <div class="no-data-title">⚠️ មិនមានសិស្សក្នុងថ្នាក់នេះ</div>
        <div class="no-data-subtitle">ថ្នាក់ទី ${data.class || 'N/A'}${data.section ? data.section : ''} មិនមានសិស្សចុះឈ្មោះសិក្សា</div>
      </div>
    ` : !hasScores ? `
      <div class="no-data-message">
        <div class="no-data-title">⚠️ មិនមានពិន្ទុសម្រាប់ខែនេះ</div>
        <div class="no-data-subtitle">ខែ ${monthName} ឆ្នាំ ${data.year} មិនមានពិន្ទុបានបញ្ចូល</div>
      </div>
    ` : `
    <table>
      <thead>
        <tr>
          <th rowspan="2" class="normal-text">ល.រ</th>
          <th rowspan="2" class="normal-text">ឈ្មោះ</th>
          <th rowspan="2" class="normal-text">ភេទ</th>
          ${uniqueSubjects.map(subject => `<th>${subject}</th>`).join('')}
          <th rowspan="2">សរុប</th>
          <th rowspan="2">មធ្យមភាគ</th>
          <th rowspan="2">និទ្ទេស</th>
          <th rowspan="2">ចំណាត់ថ្នាក់</th>
        </tr>
        <tr>
        </tr>
      </thead>
      <tbody>
        ${studentsWithRank.map((student, index) => `
          <tr>
            <td class="student-number">${index + 1}</td>
            <td class="student-name">${student.lastName} ${student.firstName}</td>
            <td class="student-gender">${getGenderKhmer(student.gender)}</td>
            ${uniqueSubjects.map(subject => `<td>${getStudentGrade(student, subject)}</td>`).join('')}
            <td><strong>${round(student.totalGrade, 2)}</strong></td>
            <td><strong>${round(student.averageGrade, 2)}</strong></td>
            <td><strong>${student.status}</strong></td>
            <td><strong>${student.rank}</strong></td>
          </tr>
        `).join('')}
        <tr class="summary-row">
          <td colspan="3" class="summary-text">សិស្សស្រីសរុប ${getFemaleStudentCount()} នាក់​</td>
          ${uniqueSubjects.map(subject => `<td>${getFemaleAverageForSubject(subject)}</td>`).join('')}
          <td>${getFemaleTotalAverage()}</td>
          <td>${getFemaleOverallAverage()}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>
    `}

    ${hasStudents && hasScores ? `
    <!-- Study Results Section -->
    <div class="study-results-section">
      <div class="results-part">
        <div class="part">លទ្ធផលសិក្សា</div>
        <div class="results-content">
          ${[
            { grade: 'A+', label: 'ល្អ​ប្រសើរ​ណាស់' },
            { grade: 'A', label: 'ល្អ​ប្រសើរ' },
            { grade: 'A-', label: 'ល្អ​ប្រសើរ​បង្គួរ' },
            { grade: 'B+', label: 'ល្អ​ណាស់​ណាស់' },
            { grade: 'B', label: 'ល្អ​ណាស់' },
            { grade: 'B-', label: 'ល្អ​ណាស់​បង្គួរ' },
            { grade: 'C+', label: 'ល្អ​ណាស់' },
            { grade: 'C', label: 'ល្អ​' },
            { grade: 'C-', label: 'ល្អ​បង្គួរ' },
            { grade: 'D', label: 'ល្អ​បង្គួរ' },
            { grade: 'F', label: 'ខ្សោយ' }
          ].map(({ grade, label }) => {
            const totalCount = studentsWithRank.filter(s => s.status === grade).length
            const femaleCount = studentsWithRank.filter(s => s.status === grade && isFemaleStudent(s.gender)).length
            return `
              <div class="result-line">
                <span class="result-label">${grade}</span>
                <span class="result-count">${totalCount} នាក់</span>
                <span class="result-female">ស្រី: ${femaleCount} នាក់</span>
              </div>
            `
          }).join('')}
          <div class="result-line">
            <span class="result-label">ប.ប.ស</span>
            <span class="result-count">${data.summary.droppedStudentsCount || 0} នាក់</span>
            <span class="result-female">ស្រី: ${data.summary.femaleDroppedStudentsCount || 0} នាក់</span>
          </div>
        </div>
      </div>

      <div class="approval-part">
        <div class="part-title">បានឃើញ និងឯកភាព</div>
        <div class="approval-content">
          <div class="approval-line">${reportDate}</div>
          <div class="approval-line">នាយិកាសាលា</div>
        </div>
      </div>

      <div class="signature-part">
        <div class="signature-content">
          <div class="signature-line">${reportDate}</div>
          <div class="signature-line">គ្រូបន្ទុកថ្នាក់</div>
        </div>
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `

  return html
}

export async function generateMonthlyGradeReportPDF(data: MonthlyGradeReportData, options: ReportOptions = {
  format: 'A4',
  orientation: 'landscape',
  margins: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
  includeHeader: true,
  includeFooter: true
}): Promise<Buffer> {
  const html = generateMonthlyGradeReportHTML(data)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: `
      <div style="font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 10mm 0 0; margin: 0;">
        របាយការណ៍ពិន្ទុប្រចាំខែ
      </div>
    `,
      footerTemplate: `
      <div style="font-family: 'Khmer OS Siemreap', 'Khmer OS Content', 'Times New Roman', serif; font-size: 8pt; color: #000; text-align: right; width: 100%; padding: 0 10mm 0 0; margin: 0;">
        ទំព័រទី <span class="pageNumber"></span> នៃ <span class="totalPages"></span>
      </div>
    `
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}