/**
 * Shared utility functions for grade calculations
 * Used across grade-report and gradebook-report APIs
 */

// Khmer semester names
export const SEMESTER_NAMES = {
  '1': 'ឆមាសទី ១',
  '2': 'ឆមាសទី ២'
} as const

// Get letter grade based on score and grade level
export function getLetterGrade(score: number, gradeNum: number): string {
  if (gradeNum >= 1 && gradeNum <= 6) {
    // Grades 1-6: Full average is 10
    if (score >= 9) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (score >= 8) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (score >= 7) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (score >= 6) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (score >= 5) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  } else {
    // Grades 7-9: Full average is 50
    if (score >= 45) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (score >= 40) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (score >= 35) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (score >= 30) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (score >= 25) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
}

// Sort dates in MM/YY format
export function sortDatesByYearMonth(dates: string[]): string[] {
  return dates.sort((a, b) => {
    const [monthA, yearA] = a.split('/')
    const [monthB, yearB] = b.split('/')
    const yearCompare = yearA.localeCompare(yearB)
    if (yearCompare !== 0) return yearCompare
    return parseInt(monthA) - parseInt(monthB)
  })
}

// Calculate grade average based on grade level
export function calculateGradeAverage(total: number, gradeNum: number, uniqueSubjects: number): number {
  if (gradeNum >= 1 && gradeNum <= 6) {
    return uniqueSubjects > 0 ? total / uniqueSubjects : 0
  } else if (gradeNum >= 7 && gradeNum <= 8) {
    return total / 14
  } else if (gradeNum === 9) {
    return total / 8.4
  } else {
    return uniqueSubjects > 0 ? total / uniqueSubjects : 0
  }
}

// Calculate semester average (last month + previous months)
export function calculateSemesterAverage(
  grades: any[],
  semesterText: string,
  gradeNum: number
): { lastMonthAverage: number; previousMonthsAverage: number; overallAverage: number } {
  const dates = [...new Set(grades.map(g => g.gradeDate))].filter(Boolean)
  const sortedDates = sortDatesByYearMonth(dates)
  
  if (sortedDates.length === 0) {
    return { lastMonthAverage: 0, previousMonthsAverage: 0, overallAverage: 0 }
  }

  const lastMonth = sortedDates[sortedDates.length - 1]
  const previousMonths = sortedDates.slice(0, -1)

  // Last month calculation
  const lastMonthGrades = grades.filter(g => g.gradeDate === lastMonth)
  const lastMonthTotal = lastMonthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
  const uniqueSubjects = new Set(lastMonthGrades.map(g => g.subject?.subjectName)).size
  const lastMonthAverage = calculateGradeAverage(lastMonthTotal, gradeNum, uniqueSubjects)

  // Previous months calculation
  const monthlyTotals: number[] = []
  previousMonths.forEach(month => {
    const monthGrades = grades.filter(g => g.gradeDate === month)
    if (monthGrades.length > 0) {
      const monthTotal = monthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
      monthlyTotals.push(monthTotal)
    }
  })

  const previousMonthsTotalAverage = monthlyTotals.length > 0 
    ? monthlyTotals.reduce((sum, total) => sum + total, 0) / monthlyTotals.length 
    : 0

  const previousMonthsAverage = calculateGradeAverage(previousMonthsTotalAverage, gradeNum, uniqueSubjects)
  const overallAverage = (lastMonthAverage + previousMonthsAverage) / 2

  return { lastMonthAverage, previousMonthsAverage, overallAverage }
}

// Create standardized subject object
export function createSubjectObject(grade: any, gradeNum: number) {
  return {
    subjectName: grade.subject?.subjectName || 'Unknown Subject',
    grade: grade.grade || 0,
    maxGrade: 100,
    percentage: ((grade.grade || 0) / 100) * 100,
    letterGrade: getLetterGrade(grade.grade || 0, gradeNum),
    gradeComment: grade.gradeComment || ''
  }
}

// Get semester text in Khmer
export function getSemesterText(semester: string): string {
  return SEMESTER_NAMES[semester as keyof typeof SEMESTER_NAMES] || semester
}

