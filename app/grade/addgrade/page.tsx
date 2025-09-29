"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BookOpen,
  Users,
  Plus as PlusIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit3,
  GraduationCap,
  CalendarDays,
  Hash,
  TrendingUp,
  User as UserIcon
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth-service"

// Database types
interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Semester {
  semesterId: number
  semester: string
  semesterCode: string
}

interface Course {
  courseId: number
  courseName: string
  grade: string
  section: string
  schoolYear: SchoolYear
}

interface Subject {
  subjectId: number
  subjectName: string
}

interface User {
  userid: number
  username: string
  firstname: string
  lastname: string
  role: string
  position: string
  avatar: string
  phonenumber1: string | null
  phonenumber2: string | null
  photo: string | null
  status: string
  createdAt: string
  updatedAt: string
  lastLogin: string | null
}

interface Student {
  studentId: number
  firstName: string
  lastName: string
  photo: string | null
  class: string
  gender: string
  enrollments: Array<{
    enrollmentId: number
    course: Course
  }>
}

interface Grade {
  gradeId: number
  courseId: number
  studentId: number
  subjectId: number
  semesterId: number
  gradeDate: string
  grade: number
  gradeComment: string | null
  userId: number | null
  lastEdit: string | null
  createdAt: string
  updatedAt: string
  course?: Course
  semester?: Semester
  student?: Student
  subject?: Subject
  user?: {
    userId: number
    username: string
    password: string
    lastname: string
    firstname: string
    phonenumber1: string | null
    phonenumber2: string | null
    role: string
    avatar: string | null
    photo: string | null
    position: string | null
    status: string
    lastLogin: string | null
    createdAt: string
    updatedAt: string
    accountLockedUntil: string | null
    failedLoginAttempts: number
    lastFailedLogin: string | null
  }
}

interface GradeInput {
  studentId: number
  subjectId: number
  courseId: number
  semesterId: number
  score: number
  grade: number
  gradeComment?: string
  userId?: number
  month?: string
  gradeYear?: string
  gradeDate: string
}

export default function AddScorePage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <AddScoreContent />
    </RoleGuard>
  )
}

function AddScoreContent() {
  // Helper function to get current date
  const getCurrentDate = () => {
    const currentDate = new Date()
    return {
      month: String(currentDate.getMonth() + 1).padStart(2, '0'),
      year: String(currentDate.getFullYear())
    }
  }

  // Filter states
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")

  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedGradeYear, setSelectedGradeYear] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  // Score input states
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [score, setScore] = useState("")
  const [comment, setComment] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [scoreError, setScoreError] = useState<string>("")
  const [isValidScore, setIsValidScore] = useState<boolean>(true)
  const [bulkMode, setBulkMode] = useState<boolean>(false)
  const [bulkScores, setBulkScores] = useState<{[key: number]: {score: string, comment: string}}>({})
  
  // Grade list filter states - Initialize with "all" to show all grades by default
  const [gradeListMonth, setGradeListMonth] = useState<string>("all")
  const [gradeListYear, setGradeListYear] = useState<string>("all")
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true)

  // Data states
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  
  // Month and Grade Year options
  const months = [
    { value: "01", label: "មករា" },
    { value: "02", label: "កុម្ភៈ" },
    { value: "03", label: "មីនា" },
    { value: "04", label: "មេសា" },
    { value: "05", label: "ឧសភា" },
    { value: "06", label: "មិថុនា" },
    { value: "07", label: "កក្កដា" },
    { value: "08", label: "សីហា" },
    { value: "09", label: "កញ្ញា" },
    { value: "10", label: "តុលា" },
    { value: "11", label: "វិច្ឆិកា" },
    { value: "12", label: "ធ្នូ" }
  ]
  
  // Generate dynamic year options: 3 years before and 3 years after current year
  // This automatically updates each year without needing to manually change the code
  const getGradeYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    
    // Add 3 years before current year
    for (let i = 3; i >= 1; i--) {
      const year = currentYear - i
      years.push({ value: year.toString(), label: year.toString() })
    }
    
    // Add current year
    years.push({ value: currentYear.toString(), label: currentYear.toString() })
    
    // Add 3 years after current year
    for (let i = 1; i <= 3; i++) {
      const year = currentYear + i
      years.push({ value: year.toString(), label: year.toString() })
    }
    
    console.log('📅 Generated year options:', years.map(y => y.label).join(', '))
    return years
  }
  
  const gradeYears = getGradeYears()

  // Loading states
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gradeToDelete, setGradeToDelete] = useState<Grade | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Score validation and formatting
  const validateScore = (value: string) => {
    const numValue = parseFloat(value)
    if (value === "") {
      setScoreError("")
      setIsValidScore(true)
      return true
    }
    if (isNaN(numValue)) {
      setScoreError("សូមបញ្ចូលលេខត្រឹមត្រូវ")
      setIsValidScore(false)
      return false
    }
    if (numValue < 0) {
      setScoreError("ពិន្ទុមិនអាចតិចជាង 0")
      setIsValidScore(false)
      return false
    }

    // Get maximum score based on student's grade level
    let maxScore = 100
    if (selectedStudent) {
      const gradeLevel = parseInt(getStudentGradeLevel(selectedStudent).toString())
      if (gradeLevel >= 1 && gradeLevel <= 6) {
        maxScore = 10
      }
    }

    if (numValue > maxScore) {
      setScoreError(`ពិន្ទុមិនអាចលើសជាង ${maxScore}`)
      setIsValidScore(false)
      return false
    }
    setScoreError("")
    setIsValidScore(true)
    return true
  }

  const getScoreGrade = (score: number) => {
    // Get maximum score based on student's grade level
    let maxScore = 100
    if (selectedStudent) {
      const gradeLevel = parseInt(getStudentGradeLevel(selectedStudent).toString())
      if (gradeLevel >= 1 && gradeLevel <= 6) {
        maxScore = 10
      }
    }

    // Calculate grade based on the appropriate scale
    if (maxScore === 10) {
      // 10-point scale for grades 1-6
      if (score >= 9) return { grade: "A", color: "text-green-600", bg: "bg-green-100" }
      if (score >= 8) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" }
      if (score >= 7) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100" }
      if (score >= 6) return { grade: "D", color: "text-orange-600", bg: "bg-orange-100" }
      return { grade: "F", color: "text-red-600", bg: "bg-red-100" }
    } else {
      // 100-point scale for grades 7+
      if (score >= 90) return { grade: "A", color: "text-green-600", bg: "bg-green-100" }
      if (score >= 80) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" }
      if (score >= 70) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100" }
      if (score >= 60) return { grade: "D", color: "text-orange-600", bg: "bg-orange-100" }
      return { grade: "F", color: "text-red-600", bg: "bg-red-100" }
    }
  }

  const handleScoreChange = (value: string) => {
    setScore(value)
    validateScore(value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (selectedStudent && selectedSubject && score && isValidScore) {
        handleSubmit(e as any)
      }
    }
  }

  // Helper function to get student's grade level
  const getStudentGradeLevel = (student: Student) => {
    // Find the current course enrollment for the selected course
    const currentEnrollment = student.enrollments.find(enrollment => 
      enrollment.course.courseId.toString() === selectedCourse
    )
    
    if (currentEnrollment && currentEnrollment.course) {
      return currentEnrollment.course.grade
    }
    
    // Fallback to student's class if no course enrollment found
    return student.class
  }

  // Helper function to get maximum score for a student
  const getMaxScore = (student: Student) => {
    const gradeLevel = parseInt(getStudentGradeLevel(student).toString())
    return (gradeLevel >= 1 && gradeLevel <= 6) ? 10 : 100
  }

  // Helper function to get formatted class display with section
  const getFormattedClass = (student: Student) => {
    // Find the current course enrollment for the selected course
    const currentEnrollment = student.enrollments.find(enrollment => 
      enrollment.course.courseId.toString() === selectedCourse
    )
    
    if (currentEnrollment && currentEnrollment.course) {
      const { grade, section } = currentEnrollment.course
      return `ថ្នាក់ទី ${grade}${section}`
    }
    
    // Fallback to student's class if no course enrollment found
    return `ថ្នាក់ទី ${student.class}`
  }

  const handleBulkScoreChange = (studentId: number, score: string) => {
    setBulkScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score
      }
    }))
  }

  // Initialize bulk scores with existing grades for the selected subject
  const initializeBulkScores = useCallback(() => {
    console.log('🔍 initializeBulkScores called with:', {
      selectedSubject,
      selectedCourse,
      selectedSemester,
      selectedMonth,
      selectedGradeYear,
      studentsCount: students.length,
      gradesCount: grades.length,
      bulkMode
    })

    if (!selectedSubject || !selectedCourse || !selectedSemester || !selectedMonth || !selectedGradeYear) {
      console.log('🔍 initializeBulkScores: Missing required data, clearing bulkScores')
      setBulkScores({})
      return
    }

    if (students.length === 0) {
      console.log('🔍 initializeBulkScores: No students available')
      setBulkScores({})
      return
    }

    const newBulkScores: {[key: number]: {score: string, comment: string}} = {}
    const targetDate = `${selectedMonth}/${selectedGradeYear.slice(-2)}`
    
    console.log('🔍 initializeBulkScores: Looking for grades with targetDate:', targetDate)
    console.log('🔍 Available grades:', grades.map(g => ({
      studentId: g.studentId,
      subjectId: g.subjectId,
      courseId: g.courseId,
      semesterId: g.semesterId,
      gradeDate: g.gradeDate,
      grade: g.grade
    })))
    
    // Use students instead of filteredStudents since this function is called before filteredStudents is defined
    students.forEach(student => {
      const existingGrade = grades.find(grade => 
        grade.subjectId.toString() === selectedSubject &&
        grade.studentId === student.studentId &&
        grade.courseId.toString() === selectedCourse &&
        grade.semesterId.toString() === selectedSemester &&
        grade.gradeDate === targetDate // Match exact month/year
      )
      
      if (existingGrade) {
        console.log('🔍 Found existing grade for student:', student.studentId, existingGrade)
        newBulkScores[student.studentId] = {
          score: existingGrade.grade.toString(),
          comment: existingGrade.gradeComment || ""
        }
      } else {
        console.log('🔍 No existing grade for student:', student.studentId, 'with filters:', {
          selectedSubject,
          studentId: student.studentId,
          selectedCourse,
          selectedSemester,
          targetDate
        })
      }
    })
    
    console.log('🔍 initializeBulkScores: Final bulkScores:', newBulkScores)
    setBulkScores(newBulkScores)
  }, [selectedSubject, selectedCourse, selectedSemester, selectedMonth, selectedGradeYear, students, grades, bulkMode])

  const handleBulkCommentChange = (studentId: number, comment: string) => {
    setBulkScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment
      }
    }))
  }

  const handleBulkSubmit = async () => {
    if (!selectedSubject || !selectedCourse || !selectedSemester || !selectedMonth || !selectedGradeYear) {
      toast({
        title: "កំហុស",
        description: "សូមបំពេញគ្រប់ផ្នែកដែលត្រូវការ",
        variant: "destructive"
      })
      return
    }

    const validScores = Object.entries(bulkScores).filter(([_, data]) => data.score && !isNaN(parseFloat(data.score)))
    
    if (validScores.length === 0) {
      toast({
        title: "កំហុស",
        description: "សូមបញ្ចូលពិន្ទុយ៉ាងហោចណាស់មួយ",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const formattedGradeDate = selectedMonth && selectedGradeYear 
        ? `${selectedMonth}/${selectedGradeYear.slice(-2)}`
        : `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}`

      const promises = validScores.map(async ([studentId, data]) => {
        const gradeData: GradeInput = {
          studentId: parseInt(studentId),
          subjectId: parseInt(selectedSubject),
          courseId: parseInt(selectedCourse),
          semesterId: parseInt(selectedSemester),
          score: parseFloat(data.score),
          grade: parseFloat(data.score),
          gradeComment: data.comment || undefined,
          userId: getCurrentUser()?.id,
          month: selectedMonth || undefined,
          gradeYear: selectedGradeYear || undefined,
          gradeDate: formattedGradeDate
        }

        // Check if grade already exists
        const existingGrade = grades.find(grade => 
          grade.subjectId.toString() === selectedSubject &&
          grade.studentId === parseInt(studentId) &&
          grade.courseId.toString() === selectedCourse &&
          grade.semesterId.toString() === selectedSemester
        )

        const response = await fetch('/api/grades', {
          method: existingGrade ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(existingGrade ? {
            gradeId: existingGrade.gradeId,
            ...gradeData
          } : gradeData)
        })

        if (!response.ok) {
          throw new Error(`Failed to create grade for student ${studentId}`)
        }
      })

      await Promise.all(promises)

      // Count how many were updates vs new
      const updateCount = validScores.filter(([studentId, _]) => 
        grades.find(grade => 
          grade.subjectId.toString() === selectedSubject &&
          grade.studentId === parseInt(studentId) &&
          grade.courseId.toString() === selectedCourse &&
          grade.semesterId.toString() === selectedSemester
        )
      ).length
      const newCount = validScores.length - updateCount

      toast({
        title: "ជោគជ័យ",
        description: `បាន${updateCount > 0 ? 'កែសម្រួល' : 'បញ្ចូល'}ពិន្ទុ ${validScores.length} ពិន្ទុដោយជោគជ័យ${updateCount > 0 && newCount > 0 ? ` (កែសម្រួល ${updateCount}, បញ្ចូលថ្មី ${newCount})` : ''}`,
      })

      // Reset bulk mode
      setBulkMode(false)
      setBulkScores({})
      setSelectedSubject("")
      
      // Reset to current date
      const { month, year } = getCurrentDate()
      setSelectedMonth(month)
      setSelectedGradeYear(year)
      
      fetchGrades()

    } catch (error) {
      console.error('Error submitting bulk grades:', error)
      setError('មានបញ្ហាក្នុងការបញ្ចូលពិន្ទុ')
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការបញ្ចូលពិន្ទុ",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
    

    
    // Auto-select current month and year
    const { month, year } = getCurrentDate()
    setSelectedMonth(month)
    setSelectedGradeYear(year)
    
    console.log('🔍 Auto-selected current date:', { month, year })
  }, [])

  // Fetch students when filters change
  useEffect(() => {
    if (selectedSchoolYear && selectedCourse) {
      fetchStudents()
    } else {
      setStudents([])
    }
  }, [selectedSchoolYear, selectedCourse])

  const fetchGrades = useCallback(async () => {
    if (!selectedStudent || !selectedCourse || !selectedSemester) {
      console.log('🔍 fetchGrades: Missing required data:', { 
        selectedStudent: !!selectedStudent, 
        selectedCourse: !!selectedCourse, 
        selectedSemester: !!selectedSemester 
      })
      return
    }

    try {
      setLoadingGrades(true)
      setError(null)

      const params = new URLSearchParams({
        studentId: selectedStudent.studentId.toString(),
        courseId: selectedCourse,
        semesterId: selectedSemester
      })

      console.log('🔍 fetchGrades: Fetching with params:', params.toString())
      
              const response = await fetch(`/api/grades?${params}`)
      console.log('🔍 fetchGrades: Response status:', response.status, response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔍 fetchGrades: Error response:', errorText)
        throw new Error(`Failed to fetch grades: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('🔍 fetchGrades: Success, data length:', data.length)
      setGrades(data)
    } catch (error) {
      console.error('🔍 fetchGrades: Error:', error)
      setError('មានបញ្ហាក្នុងការទាញយកពិន្ទុ')
    } finally {
      setLoadingGrades(false)
    }
  }, [selectedStudent, selectedCourse, selectedSemester])

  // Fetch grades for all students in a course (for bulk mode)
  const fetchGradesForCourse = useCallback(async () => {
    if (!selectedCourse || !selectedSemester) {
      console.log('🔍 fetchGradesForCourse: Missing required data:', { 
        selectedCourse: !!selectedCourse, 
        selectedSemester: !!selectedSemester 
      })
      return
    }

    try {
      setLoadingGrades(true)
      setError(null)

      const params = new URLSearchParams({
        courseId: selectedCourse,
        semesterId: selectedSemester
      })

      console.log('🔍 fetchGradesForCourse: Fetching with params:', params.toString())
      
      const response = await fetch(`/api/grades?${params}`)
      console.log('🔍 fetchGradesForCourse: Response status:', response.status, response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔍 fetchGradesForCourse: Error response:', errorText)
        throw new Error(`Failed to fetch grades: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('🔍 fetchGradesForCourse: Success, data length:', data.length)
      setGrades(data)
    } catch (error) {
      console.error('🔍 fetchGradesForCourse: Error:', error)
      setError('មានបញ្ហាក្នុងការទាញយកពិន្ទុ')
    } finally {
      setLoadingGrades(false)
    }
  }, [selectedCourse, selectedSemester])

  // Fetch grades when student changes
  useEffect(() => {
    console.log('🔍 useEffect grades: Checking conditions:', {
      selectedStudent: !!selectedStudent,
      selectedSchoolYear: !!selectedSchoolYear,
      selectedCourse: !!selectedCourse,
      selectedSemester: !!selectedSemester
    })
    
    if (selectedStudent && selectedSchoolYear && selectedCourse && selectedSemester) {
      console.log('🔍 useEffect grades: All conditions met, calling fetchGrades')
      fetchGrades()
    } else {
      console.log('🔍 useEffect grades: Some conditions missing, clearing grades')
      setGrades([])
    }
  }, [selectedStudent, selectedSchoolYear, selectedCourse, selectedSemester, fetchGrades])

  // Auto-filter grades when month or year filter changes
  useEffect(() => {
    if (grades.length > 0) {
      console.log('🔍 Filter changed:', { gradeListMonth, gradeListYear })
      // The filteredGrades will automatically update due to the filter logic
    }
  }, [gradeListMonth, gradeListYear, grades])

  // Auto-sync Grade List Filters with main Combined Filter Row
  useEffect(() => {
    if (autoSyncEnabled) {
      // Sync month filter
      if (selectedMonth && selectedMonth !== '') {
        setGradeListMonth(selectedMonth)
      } else {
        setGradeListMonth("all")
      }
    }
  }, [selectedMonth, autoSyncEnabled])

  useEffect(() => {
    if (autoSyncEnabled) {
      // Sync year filter
      if (selectedGradeYear && selectedGradeYear !== '') {
        setGradeListYear(selectedGradeYear)
      } else {
        setGradeListYear("all")
      }
    }
  }, [selectedGradeYear, autoSyncEnabled])

  // Fetch grades when entering bulk mode
  useEffect(() => {
    if (bulkMode && selectedCourse && selectedSemester) {
      console.log('🔍 useEffect bulk mode: Fetching grades for course')
      fetchGradesForCourse()
    }
  }, [bulkMode, selectedCourse, selectedSemester, fetchGradesForCourse])

  // Re-initialize bulk scores when month/year changes in bulk mode
  useEffect(() => {
    console.log('🔍 useEffect bulk scores: Checking conditions:', {
      bulkMode,
      selectedSubject: !!selectedSubject,
      selectedCourse: !!selectedCourse,
      selectedSemester: !!selectedSemester,
      selectedMonth: !!selectedMonth,
      selectedGradeYear: !!selectedGradeYear,
      gradesCount: grades.length,
      studentsCount: students.length
    })
    
    if (bulkMode && selectedSubject && selectedCourse && selectedSemester && selectedMonth && selectedGradeYear) {
      console.log('🔍 useEffect bulk scores: All conditions met, calling initializeBulkScores')
      initializeBulkScores()
    }
  }, [bulkMode, selectedSubject, selectedCourse, selectedSemester, selectedMonth, selectedGradeYear, grades, students, initializeBulkScores])

  // Re-check existing grade when month/year changes in single mode
  useEffect(() => {
    if (!bulkMode && selectedSubject && selectedStudent && selectedCourse && selectedSemester && selectedMonth && selectedGradeYear) {
      checkExistingGrade(selectedSubject)
    }
  }, [bulkMode, selectedSubject, selectedStudent, selectedCourse, selectedSemester, selectedMonth, selectedGradeYear, grades])

  // Debug: Log bulkScores changes
  useEffect(() => {
    console.log('🔍 bulkScores state changed:', bulkScores)
  }, [bulkScores])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [schoolYearsRes, semestersRes, subjectsRes, coursesRes] = await Promise.all([
        fetch('/api/school-years'),
        fetch('/api/semesters'),
        fetch('/api/subjects'),
        fetch('/api/courses')
      ])

      if (!schoolYearsRes.ok || !semestersRes.ok || !subjectsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch initial data')
      }

      const [schoolYearsData, semestersData, subjectsData, coursesData] = await Promise.all([
        schoolYearsRes.json(),
        semestersRes.json(),
        subjectsRes.json(),
        coursesRes.json()
      ])

      setSchoolYears(schoolYearsData)
      setSemesters(semestersData)
      setSubjects(subjectsData)
      setCourses(coursesData)
      
      // Debug courses data
      console.log('📚 Courses data:', {
        totalCourses: courses.length,
        coursesList: courses.map(c => ({ 
          id: c.courseId, 
          name: `ថ្នាក់ទី ${c.grade}${c.section}`, 
          grade: c.grade, 
          section: c.section,
          schoolYear: c.schoolYear?.schoolYearCode 
        }))
      })

    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true)
      setError(null)

      const params = new URLSearchParams({
        schoolYearId: selectedSchoolYear,
        courseId: selectedCourse
      })

              const response = await fetch(`/api/students/enrolled?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('មានបញ្ហាក្នុងការទាញយកបញ្ជីសិស្ស')
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate score first
    if (!validateScore(score)) {
      toast({
        title: "កំហុស",
        description: scoreError || "សូមបញ្ចូលពិន្ទុត្រឹមត្រូវ",
        variant: "destructive"
      })
      return
    }
    
    if (!selectedStudent || !selectedSubject || !score || !selectedCourse || !selectedSemester || !selectedMonth || !selectedGradeYear) {
      console.log('🔍 Validation failed:', {
        selectedStudent: !!selectedStudent,
        selectedSubject: !!selectedSubject,
        score: !!score,
        selectedCourse: !!selectedCourse,
        selectedSemester: !!selectedSemester,
        selectedMonth: !!selectedMonth,
        selectedGradeYear: !!selectedGradeYear
      })
      toast({
        title: "កំហុស",
        description: "សូមបំពេញគ្រប់ផ្នែកដែលត្រូវការ (រួមទាំងខែ និងឆ្នាំពិន្ទុ)",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Format gradeDate as "MM/YY" (e.g., "12/25" for December 2025)
      const formattedGradeDate = selectedMonth && selectedGradeYear 
        ? `${selectedMonth}/${selectedGradeYear.slice(-2)}`  // Take last 2 digits of year
        : `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}`

      const gradeData = {
        studentId: selectedStudent.studentId,
        subjectId: parseInt(selectedSubject),
        semesterId: parseInt(selectedSemester),
        courseId: parseInt(selectedCourse),
        grade: parseFloat(score),
        gradeComment: comment || undefined,
        gradeDate: formattedGradeDate,
        userId: getCurrentUser()?.id
      }

      console.log('🔍 Submitting grade data:', gradeData)
      console.log('🔍 Selected values:', {
        selectedStudent: selectedStudent?.studentId,
        selectedSubject,
        selectedCourse,
        selectedSemester,
        selectedMonth,
        selectedGradeYear,
        score,
        currentTeacher: `${getCurrentUser()?.lastname} ${getCurrentUser()?.firstname}`,
        currentUserId: getCurrentUser()?.id
      })
      console.log('🔍 Formatted gradeDate:', formattedGradeDate)

      if (editingGrade) {
        // Update existing grade
        const response = await fetch('/api/grades', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gradeId: editingGrade.gradeId,
            ...gradeData
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update grade')
        }

        toast({
          title: "ជោគជ័យ",
          description: "ពិន្ទុត្រូវបានកែសម្រួលដោយជោគជ័យ",
        })

        setEditingGrade(null)
      } else {
        // Create new grade
        const response = await fetch('/api/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gradeData)
        })

        if (!response.ok) {
          let errorData
          try {
            errorData = await response.json()
          } catch {
            errorData = await response.text()
          }
          console.error('Grade creation failed:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            gradeData
          })
          throw new Error(`Failed to create grade: ${response.status} ${response.statusText}`)
        }

        toast({
          title: "ជោគជ័យ",
          description: "ពិន្ទុត្រូវបានបញ្ចូលដោយជោគជ័យ",
        })
      }

      // Reset form and refresh data
      setScore("")
      setComment("")
      setSelectedSubject("")
      setScoreError("")
      setIsValidScore(true)
      
      // Reset to current date instead of empty
      const { month, year } = getCurrentDate()
      setSelectedMonth(month)
      setSelectedGradeYear(year)
      
      fetchGrades()

    } catch (error) {
      console.error('Error submitting grade:', error)
      setError('មានបញ្ហាក្នុងការបញ្ចូលពិន្ទុ')
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការបញ្ចូលពិន្ទុ",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (gradeToEdit: Grade) => {
    setEditingGrade(gradeToEdit)
    setSelectedSubject(gradeToEdit.subjectId.toString())
    setScore(gradeToEdit.grade.toString())
    setComment(gradeToEdit.gradeComment || "")
    
    // Parse gradeDate (format: "MM/YY") to populate month and year fields
    if (gradeToEdit.gradeDate && gradeToEdit.gradeDate.includes('/')) {
      const [month, year] = gradeToEdit.gradeDate.split('/')
      setSelectedMonth(month)
      setSelectedGradeYear(`20${year}`) // Convert "25" to "2025"
    }
  }

  const handleCancelEdit = () => {
    setEditingGrade(null)
    setScore("")
    setComment("")
    setSelectedSubject("")
    setScoreError("")
    setIsValidScore(true)
    
    // Reset to current date instead of empty
    const { month, year } = getCurrentDate()
    setSelectedMonth(month)
    setSelectedGradeYear(year)
  }

  // Check if subject already has a grade and auto-switch to edit mode
  const checkExistingGrade = (subjectId: string) => {
    if (!selectedStudent || !selectedCourse || !selectedSemester || !selectedMonth || !selectedGradeYear) return

    const existingGrade = grades.find(grade => 
      grade.subjectId.toString() === subjectId &&
      grade.studentId === selectedStudent.studentId &&
      grade.courseId.toString() === selectedCourse &&
      grade.semesterId.toString() === selectedSemester &&
      grade.gradeDate === `${selectedMonth}/${selectedGradeYear.slice(-2)}` // Match exact month/year
    )

    if (existingGrade) {
      // Auto-switch to edit mode
      setEditingGrade(existingGrade)
      setScore(existingGrade.grade.toString())
      setComment(existingGrade.gradeComment || "")
      
      // Parse gradeDate to populate month and year
      if (existingGrade.gradeDate) {
        const [month, year] = existingGrade.gradeDate.split('/')
        setSelectedMonth(month)
        setSelectedGradeYear(`20${year}`)
      }
      
      toast({
        title: "ពិន្ទុមានរួចហើយ",
        description: `មុខវិជ្ជា ${existingGrade.subject?.subjectName || 'មុខវិជ្ជា'} មានពិន្ទុ ${existingGrade.grade} រួចហើយ។ អ្នកអាចកែសម្រួលបាន។`,
        variant: "default"
      })
    } else {
      // Clear edit mode for new grade - no existing grade for this exact month/year
      setEditingGrade(null)
      setScore("")
      setComment("")
    }
  }

  const handleDeleteClick = (grade: Grade) => {
    setGradeToDelete(grade)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!gradeToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/grades?gradeId=${gradeToDelete.gradeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete grade')
      }

      toast({
        title: "ជោគជ័យ",
        description: "ពិន្ទុត្រូវបានលុបដោយជោគជ័យ",
      })

      fetchGrades()
      setDeleteDialogOpen(false)
      setGradeToDelete(null)
    } catch (error) {
      console.error('Error deleting grade:', error)
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការលុបពិន្ទុ",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setGradeToDelete(null)
  }

  const handleSchoolYearChange = (value: string) => {
    setSelectedSchoolYear(value)
    setSelectedCourse("")
    setSelectedStudent(null)
    setStudents([])
    setGrades([])
  }

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value)
    setSelectedStudent(null)
    setGrades([])
  }

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value)
    setGrades([])
  }

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    // You can add additional logic here if needed
  }

  const handleGradeYearChange = (value: string) => {
    setSelectedGradeYear(value)
    // You can add additional logic here if needed
  }

  // Filter courses based on selected school year, or show all if none selected
  const filteredCourses = selectedSchoolYear 
    ? courses.filter(course => course.schoolYear.schoolYearId.toString() === selectedSchoolYear)
    : courses
    
  // Debug filtered courses
  console.log('🔍 Filtered Courses:', {
    selectedSchoolYear,
    totalCourses: courses.length,
    filteredCount: filteredCourses.length,
    filteredCourses: filteredCourses.map(c => ({ id: c.courseId, name: `ថ្នាក់ទី ${c.grade}${c.section}`, schoolYear: c.schoolYear?.schoolYearCode }))
  })

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true
    const fullName = `${student.lastName} ${student.firstName}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  // Filter grades based on month and year
  const filteredGrades = grades.filter(grade => {
    // If both filters are "all", show all grades
    if (gradeListMonth === 'all' && gradeListYear === 'all') return true
    
    const gradeDate = grade.gradeDate // Format: "MM/YY"
    if (!gradeDate || typeof gradeDate !== 'string') return false
    
    const dateParts = gradeDate.split('/')
    if (dateParts.length !== 2) return false
    
    const [month, year] = dateParts
    
    // Validate month and year format
    if (!month || !year || month.length !== 2 || year.length !== 2) return false
    
    // Check month match
    const monthMatch = gradeListMonth === 'all' || month === gradeListMonth
    
    // Check year match - compare last 2 digits of the selected year with grade year
    const yearMatch = gradeListYear === 'all' || year === gradeListYear.slice(-2)
    
    return monthMatch && yearMatch
  })

  // Calculate stats based on filtered grades
  const totalGrades = filteredGrades.length
  const totalPoints = filteredGrades.reduce((sum, grade) => {
    const gradeValue = typeof grade.grade === 'number' ? grade.grade : 0
    return sum + gradeValue
  }, 0)
  const averageScore = totalGrades > 0 ? (totalPoints / totalGrades).toFixed(2) : "0.00"

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <div className="animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-8 p-6">
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-xl text-muted-foreground">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <div className="animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-8 p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-xl text-destructive mb-2">មានបញ្ហាក្នុងការទាញយកទិន្នន័យ</p>
              <p className="text-base text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchInitialData}>ព្យាយាមម្តងទៀត</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8 p-6">

          {/* Modern Filter Section */}
          <div className="relative group">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/20 rounded-3xl -z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />

            <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
              {/* Enhanced Modern Header */}
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-4">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />

                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                      ព័ត៌មានមុខងារ
                    </h2>
                    <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                    <p className="text-white/90 mt-2 text-base md:text-lg">
                      ជ្រើសរើសថ្នាក់ និងមុខវិជ្ជាដើម្បីចាប់ផ្តើមបញ្ចូលពិន្ទុ
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                      {/* Academic Year */}
                      <div className="space-y-3 group">
                        <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-blue-600 dark:text-gray-300 transition-colors duration-200">
                          <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span>ឆ្នាំសិក្សា</span>
                          <span className="text-red-500 text-base">*</span>
                        </label>
                        <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
                          <SelectTrigger className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group-hover:shadow-lg text-blue-600 dark:text-blue-400">
                            <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                            {schoolYears.map((year) => (
                              <SelectItem 
                                key={year.schoolYearId} 
                                value={year.schoolYearId.toString()}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-100 dark:focus:bg-blue-900/30 focus:text-blue-900 dark:focus:text-blue-100"
                              >
                                {year.schoolYearCode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Semester */}
                      <div className="space-y-3 group">
                        <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-purple-600 dark:text-gray-300 transition-colors duration-200">
                          <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span>ឆមាស</span>
                          <span className="text-red-500 text-base">*</span>
                        </label>
                        <Select value={selectedSemester} onValueChange={handleSemesterChange}>
                          <SelectTrigger className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 group-hover:shadow-lg text-purple-600 dark:text-purple-400">
                            <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                            {semesters.map((semester) => (
                              <SelectItem 
                                key={semester.semesterId} 
                                value={semester.semesterId.toString()}
                                className="hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:bg-purple-100 dark:focus:bg-purple-900/30 focus:text-purple-900 dark:focus:text-purple-100"
                              >
                                {semester.semester}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Class */}
                      <div className="space-y-3 group">
                        <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-green-600 dark:text-gray-300 transition-colors duration-200">
                          <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span>ថ្នាក់</span>
                          <span className="text-red-500 text-base">*</span>
                        </label>
                        <Select value={selectedCourse} onValueChange={handleCourseChange}>
                          <SelectTrigger className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-green-200 dark:border-green-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 group-hover:shadow-lg text-green-600 dark:text-green-400">
                            <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                            {filteredCourses.map((course) => (
                              <SelectItem 
                                key={course.courseId} 
                                value={course.courseId.toString()}
                                className="hover:bg-green-50 dark:hover:bg-green-900/20 focus:bg-green-100 dark:focus:bg-green-900/30 focus:text-green-900 dark:focus:text-green-100"
                              >
                                ថ្នាក់ទី {course.grade}{course.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Month */}
                      <div className="space-y-3 group">
                        <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-orange-600 dark:text-gray-300 transition-colors duration-200">
                          <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <CalendarDays className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span>ខែ</span>
                          <span className="text-red-500 text-base">*</span>
                        </label>
                        <Select value={selectedMonth} onValueChange={handleMonthChange}>
                          <SelectTrigger className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-orange-200 dark:border-orange-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 group-hover:shadow-lg text-orange-600 dark:text-orange-400">
                            <SelectValue placeholder="ជ្រើសរើសខែ" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                            {months.map((month) => (
                              <SelectItem 
                                key={month.value} 
                                value={month.value}
                                className="hover:bg-orange-50 dark:hover:bg-orange-900/20 focus:bg-orange-100 dark:focus:bg-orange-900/30 focus:text-orange-900 dark:focus:text-orange-100"
                              >
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Grade Year */}
                      <div className="space-y-3 group">
                        <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-rose-600 dark:text-gray-300 transition-colors duration-200">
                          <div className="p-1 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                          </div>
                          <span>ឆ្នាំពិន្ទុ</span>
                          <span className="text-red-500 text-base">*</span>
                        </label>
                        <Select value={selectedGradeYear} onValueChange={handleGradeYearChange}>
                          <SelectTrigger className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-rose-200 dark:border-rose-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 hover:border-rose-300 dark:hover:border-rose-600 transition-all duration-300 group-hover:shadow-lg text-rose-600 dark:text-rose-400">
                            <SelectValue placeholder="ជ្រើសរើសឆ្នាំ" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                            {gradeYears.map((year) => (
                              <SelectItem 
                                key={year.value} 
                                value={year.value}
                                className="hover:bg-rose-50 dark:hover:bg-rose-900/20 focus:bg-rose-100 dark:focus:bg-rose-900/30 focus:text-rose-900 dark:focus:text-rose-100"
                              >
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Teacher Info */}
                      <div className="space-y-3 group">
                        <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-indigo-600 dark:text-gray-300 transition-colors duration-200">
                          <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <UserIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span>ឈ្មោះគ្រូ</span>
                        </label>
                        <div className="h-12 px-4 py-3 bg-gradient-to-r from-indigo-50 via-indigo-100/50 to-indigo-50 dark:from-indigo-900/20 dark:via-indigo-800/30 dark:to-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                          <div className="text-center">
                            <span className="text-sm md:text-base font-semibold text-indigo-700 dark:text-indigo-300 block">
                              {getCurrentUser()?.lastname} {getCurrentUser()?.firstname}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - 30/70 Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-[4fr_6fr] gap-8">
            {/* Modern Student List */}
            <div className="relative group">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-purple-50/30 dark:from-purple-950/20 dark:via-pink-950/15 dark:to-purple-950/20 rounded-3xl -z-10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.05),transparent_50%)]" />
              
              <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
                <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-4">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">បញ្ជីឈ្មោះសិស្ស</h2>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                          {filteredStudents.length} នាក់
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                          ជ្រើសរើសសិស្ស
                        </Badge>
                      </div>
                      <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-4">
                  
                    {/* Modern Search and Mode Toggle */}
                    <div className="flex items-center space-x-4">
                      {students.length > 0 && (
                        <div className="relative flex-1">
                          <Input
                            type="text"
                            placeholder="ស្វែងរកសិស្ស..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200 bg-white dark:bg-gray-800 rounded-xl pl-12 pr-4 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-purple-200/50"
                          />
                          <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSearchTerm('')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {students.length > 0 && !editingGrade && (
                        <Button
                          variant={bulkMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setBulkMode(!bulkMode)
                            setBulkScores({})
                            setSelectedStudent(null)
                            // If switching to bulk mode, fetch grades for the course
                            if (!bulkMode && selectedCourse && selectedSemester) {
                              console.log('🔍 Switching to bulk mode, fetching grades for course')
                              fetchGradesForCourse()
                            }
                          }}
                          className={`h-12 px-6 font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${
                            bulkMode 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg' 
                              : 'border-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
                          }`}
                        >
                          {bulkMode ? 'បញ្ចូលតែមួយ' : 'បញ្ចូលជាក្រុម'}
                        </Button>
                      )}
                    </div>
                </div>
              </CardContent>
              
              <CardContent className="p-4">
                    {loadingStudents ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">កំពុងទាញយកសិស្ស...</p>
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent hover:scrollbar-thumb-purple-400 dark:hover:scrollbar-thumb-purple-500 px-2 py-2">
                        {filteredStudents.map((student, index) => (
                          <div 
                            key={student.studentId}
                            className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                              selectedStudent?.studentId === student.studentId 
                                ? 'border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 cursor-pointer hover:shadow-lg hover:scale-[1.02]' 
                                : 'border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:scale-[1.02]'
                            }`}
                            onClick={() => setSelectedStudent(student)}
                          >
                            {/* Background Pattern */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                              selectedStudent?.studentId === student.studentId
                                ? 'bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10'
                                : 'bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/10 dark:to-gray-700/10'
                            }`} />

                            <div className="relative z-10 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {/* Student Number Badge */}
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  {index + 1}
                                </div>
                                
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                  {student.photo ? (
                                    <img
                                      src={student.photo}
                                      alt={`${student.lastName} ${student.firstName}`}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700"
                                    />
                                  ) : (
                                    <span className="text-lg font-semibold text-purple-600 dark:text-purple-300">
                                      {student.firstName.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                                    {student.lastName} {student.firstName}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {getFormattedClass(student)}
                                  </div>
                                </div>
                              </div>
                              
                              {selectedStudent?.studentId === student.studentId && (
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchTerm ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">មិនរកឃើញសិស្ស</p>
                        <p className="text-base text-gray-500 dark:text-gray-400">សូមស្វែងរកឈ្មោះផ្សេង</p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">សូមបំពេញគ្រប់ផ្នែកដើម្បីមើលបញ្ជីសិស្ស</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            {/* Modern Score Input Section */}
            <div className="relative group">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-teal-50/30 dark:from-green-950/20 dark:via-emerald-950/15 dark:to-teal-950/20 rounded-3xl -z-10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.05),transparent_50%)]" />
              
              <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
                <CardHeader className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white p-4">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <PlusIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                        {editingGrade ? 'កែសម្រួលពិន្ទុ' : bulkMode ? 'បញ្ចូលពិន្ទុជាក្រុម' : 'បញ្ចូលពិន្ទុ'}
                      </h2>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                          {bulkMode ? 'បញ្ចូលពិន្ទុសម្រាប់សិស្សច្រើននាក់' : 'បញ្ចូលពិន្ទុសម្រាប់សិស្សម្នាក់'}
                        </Badge>
                      </div>
                      <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                    </div>
                  </div>
                </CardHeader>
              
                <CardContent className="p-4">
                  {bulkMode ? (
                    <div className="space-y-6">
                      {/* Modern Subject Selection */}
                      <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/30 dark:border-green-700/30 rounded-xl">
                        <div>
                          <label className="block text-base font-semibold mb-3 text-teal-700 dark:text-teal-300 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            មុខវិជ្ជា
                            <span className="text-red-500">*</span>
                          </label>
                          <Select value={selectedSubject} onValueChange={(value) => {
                            console.log('🔍 Subject changed in bulk mode:', value)
                            setSelectedSubject(value)
                            checkExistingGrade(value)
                            // Initialize bulk scores with existing grades
                            setTimeout(() => {
                              console.log('🔍 Calling initializeBulkScores from subject change')
                              initializeBulkScores()
                            }, 100)
                          }}>
                            <SelectTrigger className="h-14 text-base font-medium border-2 border-teal-200 focus:border-teal-500 focus:ring-teal-200 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 focus:ring-4 focus:ring-teal-200/30 px-4">
                              <SelectValue placeholder="ជ្រើសរើសមុខវិជ្ជា" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                              {subjects.map((subject) => (
                                <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                                  {subject.subjectName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Modern Bulk Score Input */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300">
                            បញ្ចូលពិន្ទុ ({filteredStudents.length} នាក់)
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                              បញ្ចូលពិន្ទុសម្រាប់សិស្សច្រើននាក់
                            </Badge>
                            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                              Debug: {Object.keys(bulkScores).length} scores
                            </Badge>
                            <Button
                              type="button"
                              onClick={() => {
                                console.log('🔍 Manual trigger of initializeBulkScores')
                                initializeBulkScores()
                              }}
                              className="h-8 px-3 text-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                              Test Init
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                console.log('🔍 Manual test: Setting test bulk scores')
                                const testScores = {
                                  1: { score: "85", comment: "Test comment 1" },
                                  2: { score: "92", comment: "Test comment 2" }
                                }
                                console.log('🔍 Setting test scores:', testScores)
                                setBulkScores(testScores)
                              }}
                              className="h-8 px-3 text-xs bg-purple-500 hover:bg-purple-600 text-white"
                            >
                              Test Data
                            </Button>
                          </div>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto border-2 border-green-200 dark:border-green-800 rounded-xl bg-gradient-to-r from-green-50/30 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/20">
                          <div className="divide-y divide-green-200 dark:divide-green-800">
                            {filteredStudents.map((student, index) => (
                              <div key={student.studentId} className="p-4 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors duration-200">
                                <div className="flex items-center space-x-4">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {index + 1}
                                  </div>
                                  
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-full flex items-center justify-center shadow-sm">
                                    {student.photo ? (
                                      <img
                                        src={student.photo}
                                        alt={`${student.lastName} ${student.firstName}`}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700"
                                      />
                                    ) : (
                                      <span className="text-sm font-semibold text-green-600 dark:text-green-300">
                                        {student.firstName.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white text-base">
                                      {student.lastName} {student.firstName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{getFormattedClass(student)}</p>
                                  </div>
                                  
                                  <div className="flex items-center space-x-3">
                                    <Input
                                      type="number"
                                      placeholder="ពិន្ទុ"
                                      value={bulkScores[student.studentId]?.score || ""}
                                      onChange={(e) => handleBulkScoreChange(student.studentId, e.target.value)}
                                      min="0"
                                      max={getMaxScore(student)}
                                      step="0.01"
                                      className="w-24 h-10 text-center text-sm font-semibold border-2 border-green-200 focus:border-green-500 focus:ring-green-200 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-green-200/50"
                                      onFocus={() => console.log('🔍 Score input focused for student:', student.studentId, 'bulkScores:', bulkScores[student.studentId])}
                                    />
                                    <Input
                                      type="text"
                                      placeholder="មតិ"
                                      value={bulkScores[student.studentId]?.comment || ""}
                                      onChange={(e) => handleBulkCommentChange(student.studentId, e.target.value)}
                                      className="w-44 h-10 text-sm border-2 border-green-200 focus:border-green-500 focus:ring-green-200 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-green-200/50"
                                      onFocus={() => console.log('🔍 Comment input focused for student:', student.studentId, 'bulkScores:', bulkScores[student.studentId])}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Modern Action Buttons */}
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setBulkMode(false)
                            setBulkScores({})
                            setSelectedSubject("")
                          }}
                          className="flex-1 h-12 px-6 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                          disabled={submitting}
                        >
                          បោះបង់
                        </Button>
                        <Button
                          type="button"
                          onClick={handleBulkSubmit}
                          className="flex-1 h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          disabled={submitting || !selectedSubject || Object.keys(bulkScores).length === 0}
                        >
                          {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                          បញ្ចូលពិន្ទុ
                        </Button>
                      </div>
                      </div>
                    ) : selectedStudent ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Modern Selected Student Info */}
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {selectedStudent.photo ? (
                                <img
                                  src={selectedStudent.photo}
                                  alt={`${selectedStudent.lastName} ${selectedStudent.firstName}`}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700"
                                />
                              ) : (
                                selectedStudent.firstName.charAt(0)
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedStudent.lastName} {selectedStudent.firstName}</h3>
                              <p className="text-base text-gray-600 dark:text-gray-400 font-medium mb-2">{getFormattedClass(selectedStudent)}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                  ពិន្ទុអតិបរមា: {getMaxScore(selectedStudent)} ពិន្ទុ
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Modern Score Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Modern Subject Selection */}
                          <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/30 dark:border-green-700/30 rounded-xl">
                            <label className="block text-base font-semibold mb-3 text-teal-700 dark:text-teal-300 flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              មុខវិជ្ជា
                              <span className="text-red-500">*</span>
                            </label>
                            <Select value={selectedSubject} onValueChange={(value) => {
                              setSelectedSubject(value)
                              checkExistingGrade(value)
                            }}>
                              <SelectTrigger className="h-14 text-base font-medium border-2 border-teal-200 focus:border-teal-500 focus:ring-teal-200 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 focus:ring-4 focus:ring-teal-200/30 px-4">
                                <SelectValue placeholder="ជ្រើសរើសមុខវិជ្ជា" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl shadow-xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                                {subjects.map((subject) => (
                                  <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                                    {subject.subjectName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Modern Score Input */}
                          <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/30 dark:border-green-700/30 rounded-xl">
                            <label className="block text-base font-semibold mb-3 text-teal-700 dark:text-teal-300 flex items-center gap-2">
                              <Hash className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              លេខពិន្ទុ
                              <span className="text-red-500">*</span>
                            </label>
                            
                            <div className="relative">
                              <Input
                                type="number"
                                value={score}
                                onChange={(e) => handleScoreChange(e.target.value)}
                                onKeyPress={handleKeyPress}
                                min="0"
                                max={selectedStudent ? getMaxScore(selectedStudent) : 100}
                                step="0.01"
                                placeholder={selectedStudent ? `បញ្ចូលពិន្ទុ (0-${getMaxScore(selectedStudent)})` : "បញ្ចូលពិន្ទុ (0-100)"}
                                className={`h-12 text-lg text-center font-semibold border-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ${
                                  scoreError 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 focus:ring-2 focus:ring-red-200/50' 
                                    : isValidScore && score 
                                      ? 'border-green-500 focus:border-green-500 focus:ring-green-200 focus:ring-2 focus:ring-green-200/50' 
                                      : 'border-green-200 focus:border-green-500 focus:ring-green-200 focus:ring-2 focus:ring-green-200/50'
                                }`}
                              />
                            </div>

                            {/* Error Message */}
                            {scoreError && (
                              <div className="flex items-center space-x-2 text-red-600 text-base mt-3">
                                <AlertCircle className="h-4 w-4" />
                                <span>{scoreError}</span>
                              </div>
                            )}
                          </div>
                        </div>
                          {/* Modern Comment Input */}
                          <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/30 dark:border-green-700/30 rounded-xl">
                            <label className="block text-base font-semibold mb-3 text-teal-700 dark:text-teal-300 flex items-center gap-2">
                              <Edit3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              មតិផ្សេងៗ
                              <span className="text-gray-400 text-sm font-normal">(ជម្រើស)</span>
                            </label>
                            <Input
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="បញ្ចូលមតិឬយោបល់បន្ថែម(ដាក់ក្នុងសៀវភៅតាមដាន)"
                              className="h-12 text-base border-2 border-green-200 focus:border-green-500 focus:ring-green-200 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-green-200/50"
                            />
                          </div>
                        

                        {/* Modern Action Buttons */}
                        <div className="flex gap-4">
                          {editingGrade ? (
                            <>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleCancelEdit}
                                className="flex-1 h-12 px-6 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                                disabled={submitting}
                              >
                                បោះបង់
                              </Button>
                              <Button 
                                type="submit" 
                                className="flex-1 h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                disabled={submitting || !isValidScore || !selectedSubject || !score}
                              >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                ធ្វើបច្ចុប្បន្នភាព
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedSubject("")
                                  setScore("")
                                  setComment("")
                                  setScoreError("")
                                  setIsValidScore(true)
                                  setEditingGrade(null)
                                }}
                                className="flex-1 h-12 px-6 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                                disabled={submitting}
                              >
                                សម្អាត
                              </Button>
                              <Button 
                                type="submit" 
                                className="flex-1 h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                disabled={submitting || !isValidScore || !selectedSubject || !score}
                              >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                បន្ថែមពិន្ទុ
                              </Button>
                            </>
                          )}
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
                          <PlusIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {bulkMode ? 'បញ្ចូលពិន្ទុជាក្រុម' : 'ជ្រើសរើសសិស្ស'}
                        </p>
                        <p className="text-base text-gray-500 dark:text-gray-400">
                          {bulkMode 
                            ? 'សូមជ្រើសរើសមុខវិជ្ជាដើម្បីបញ្ចូលពិន្ទុសម្រាប់សិស្សទាំងអស់'
                            : 'សូមជ្រើសរើសសិស្សដើម្បីបញ្ចូលពិន្ទុ'
                          }
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Modern Grade List Section */}
          {selectedStudent && (
          <div className="relative group">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-yellow-50/30 dark:from-orange-950/20 dark:via-amber-950/15 dark:to-yellow-950/20 rounded-3xl -z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.05),transparent_50%)]" />
            
            <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-600 to-yellow-600 text-white p-4">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Hash className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                      បញ្ជីពិន្ទុសិស្ស {selectedStudent?.lastName} {selectedStudent?.firstName || ''}
                    </h2>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                        សរុប {totalGrades} ពិន្ទុ
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                        មធ្យមភាគ {averageScore}
                      </Badge>
                      {gradeListMonth !== 'all' && gradeListYear !== 'all' && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                          ខែ {gradeListMonth}/{gradeListYear}
                        </Badge>
                      )}
                      {gradeListMonth !== 'all' && gradeListYear === 'all' && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                          ខែ {gradeListMonth}
                        </Badge>
                      )}
                      {gradeListMonth === 'all' && gradeListYear !== 'all' && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                          ឆ្នាំ {gradeListYear}
                        </Badge>
                      )}
                    </div>
                    <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                  </div>
                  
                  {/* Header Filter Controls - Right Side */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <label className="text-base font-semibold text-white">ខែ</label>
                      <Select value={gradeListMonth} onValueChange={setGradeListMonth}>
                        <SelectTrigger className="w-32 h-12 text-base font-semibold border-2 border-white/40 bg-white/30 backdrop-blur-sm text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-white/50 px-4">
                          <SelectValue placeholder="ទាំងអស់" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                          <SelectItem value="all" className="text-base">ទាំងអស់</SelectItem>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = String(i + 1).padStart(2, '0')
                            const monthNames = [
                              'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
                              'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
                            ]
                            return (
                              <SelectItem key={month} value={month} className="text-base">
                                {monthNames[i]}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <label className="text-base font-semibold text-white">ឆ្នាំ</label>
                      <Select value={gradeListYear} onValueChange={setGradeListYear}>
                        <SelectTrigger className="w-32 h-12 text-base font-semibold border-2 border-white/40 bg-white/30 backdrop-blur-sm text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-white/50 px-4">
                          <SelectValue placeholder="ទាំងអស់" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                          <SelectItem value="all" className="text-base">ទាំងអស់</SelectItem>
                          {gradeYears.map((year) => (
                            <SelectItem key={year.value} value={year.value} className="text-base">
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Clear Filters Button */}
                    {((gradeListMonth && gradeListMonth !== 'all') || (gradeListYear && gradeListYear !== 'all')) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setGradeListMonth("all")
                          setGradeListYear("all")
                        }}
                        className="h-12 px-6 text-base font-semibold text-white hover:text-white hover:bg-white/30 rounded-xl transition-all duration-300"
                      >
                        សម្អាត
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                
                
                {/* Grade List Display */}
                {selectedStudent ? (
                  filteredGrades.length > 0 ? (
                    <div className="space-y-3 mt-2">

                      <div className="grid gap-3">
                        {filteredGrades.map((grade, index) => (
                          <div
                            key={grade.gradeId}
                            className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {/* Grade Number Badge */}
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  {index + 1}
                                </div>
                                
                                {/* Subject Info */}
                                <div className="flex-1">
                                  <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300">
                                    {grade.subject?.subjectName || 'មុខវិជ្ជា'}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {(() => {
                                      // Parse gradeDate (format: "MM/YY")
                                      const [month, year] = grade.gradeDate ? grade.gradeDate.split('/') : ['', '']
                                      const monthNames = [
                                        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
                                        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
                                      ]
                                      const monthName = month && parseInt(month) <= 12 ? monthNames[parseInt(month) - 1] : 'N/A'
                                      const fullYear = year ? `20${year}` : 'N/A'
                                      const semesterText = grade.semester?.semester || 'N/A'
                                      const inputDate = grade.createdAt ? new Date(grade.createdAt).toLocaleDateString('en-GB') : 'N/A'
                                      const teacherName = grade.user ? `${grade.user.lastname}${grade.user.firstname}` : 'N/A'
                                      
                                      let infoText = `ខែ${monthName} ឆ្នាំ${fullYear} • ${semesterText} • ថ្ងៃខែឆ្នាំបញ្ចូល: ${inputDate} • គ្រូដែលបញ្ចូល: ${teacherName}`
                                      
                                      return infoText
                                    })()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Score Display */}
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {grade.grade}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    ពិន្ទុ
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                  {/* Edit Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingGrade(grade)
                                      setScore(grade.grade.toString())
                                      setComment(grade.gradeComment || "")
                                      setSelectedSubject(grade.subjectId.toString())
                                    }}
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-xl p-2 group-hover:scale-110 transition-all duration-300"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  
                                  {/* Delete Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(grade)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl p-2 group-hover:scale-110 transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Comment Display */}
                            {grade.gradeComment && (
                              <div className="mt-3 pt-3 border-t border-orange-200/50 dark:border-orange-700/50">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">មតិ:</span> {grade.gradeComment}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Hash className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">គ្មានពិន្ទុ</p>
                      <p className="text-base text-gray-400">សិស្សនេះមិនទាន់មានពិន្ទុ</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <Hash className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">គ្មានពិន្ទុ</p>
                    <p className="text-base text-gray-400">សូមជ្រើសរើសសិស្សដើម្បីមើលពិន្ទុ</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 dark:from-gray-900 dark:via-red-950/30 dark:to-orange-950/20 backdrop-blur-xl border-0 shadow-2xl dark:shadow-red-900/20 rounded-2xl">
          <DialogHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl shadow-lg dark:shadow-red-900/20">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-red-800 dark:text-red-200">
                  លុបពិន្ទុ
                </DialogTitle>
                <DialogDescription className="text-red-700 dark:text-red-300 font-medium">
                  តើអ្នកប្រាកដជាចង់លុបពិន្ទុនេះមែនទេ?
                </DialogDescription>
              </div>
            </div>
            
            {gradeToDelete && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 border border-red-200 dark:border-red-700 rounded-xl shadow-sm dark:shadow-red-900/10">
                <div className="space-y-2">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {gradeToDelete.subject?.subjectName || 'មុខវិជ្ជា'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ពិន្ទុ: <span className="font-bold text-red-600 dark:text-red-400">{gradeToDelete.grade}</span>
                  </div>
                  {gradeToDelete.gradeComment && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      មតិ: {gradeToDelete.gradeComment}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogHeader>
          
          <DialogFooter className="flex justify-between items-center gap-4 pt-6 border-t-2 border-red-200/50 dark:border-red-700/50 bg-gradient-to-r from-white via-red-50/50 to-white dark:from-gray-900 dark:via-red-950/30 dark:to-gray-900 px-4 -mx-6 -mb-6 p-6">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
              សកម្មភាពនេះមិនអាចត្រឡប់បាន
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-6 py-2 bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-600 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-sm dark:shadow-red-900/10"
              >
                បោះបង់
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white rounded-xl font-semibold shadow-lg dark:shadow-red-900/30 hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    កំពុងលុប...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    លុបពិន្ទុ
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} // End of AddScoreContent component
