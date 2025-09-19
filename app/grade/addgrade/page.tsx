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
  studentId: number
  subjectId: number
  courseId: number
  semesterId: number
  grade: number
  gradeComment: string | null
  gradeDate: string  // Now stores "MM/YY" format like "12/25"
  userId: number | null
  user?: {
    userId: number
    firstname: string
    lastname: string
    role: string
  }
  student: Student
  subject: Subject
  course: Course
  semester: Semester
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
  const initializeBulkScores = () => {
    if (!selectedSubject || !selectedCourse || !selectedSemester) return

    const newBulkScores: {[key: number]: {score: string, comment: string}} = {}
    
    filteredStudents.forEach(student => {
      const existingGrade = grades.find(grade => 
        grade.subjectId.toString() === selectedSubject &&
        grade.studentId === student.studentId &&
        grade.courseId.toString() === selectedCourse &&
        grade.semesterId.toString() === selectedSemester
      )
      
      if (existingGrade) {
        newBulkScores[student.studentId] = {
          score: existingGrade.grade.toString(),
          comment: existingGrade.gradeComment || ""
        }
      }
    })
    
    setBulkScores(newBulkScores)
  }

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

      const gradeData: GradeInput = {
        studentId: selectedStudent.studentId,
        subjectId: parseInt(selectedSubject),
        courseId: parseInt(selectedCourse),
        semesterId: parseInt(selectedSemester),
        score: parseFloat(score),
        grade: parseFloat(score),
        gradeComment: comment || undefined,
        userId: getCurrentUser()?.id,
        month: selectedMonth || undefined,
        gradeYear: selectedGradeYear || undefined,
        gradeDate: formattedGradeDate
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
          const errorData = await response.text()
          console.error('Grade creation failed:', {
            status: response.status,
            statusText: response.statusText,
            errorData
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
    if (!selectedStudent || !selectedCourse || !selectedSemester) return

    const existingGrade = grades.find(grade => 
      grade.subjectId.toString() === subjectId &&
      grade.studentId === selectedStudent.studentId &&
      grade.courseId.toString() === selectedCourse &&
      grade.semesterId.toString() === selectedSemester
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
        description: `មុខវិជ្ជា ${existingGrade.subject.subjectName} មានពិន្ទុ ${existingGrade.grade} រួចហើយ។ អ្នកអាចកែសម្រួលបាន។`,
        variant: "default"
      })
    } else {
      // Clear edit mode for new grade
      setEditingGrade(null)
      setScore("")
      setComment("")
    }
  }

  const handleDelete = async (gradeId: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបពិន្ទុនេះមែនទេ?')) {
      return
    }

    try {
              const response = await fetch(`/api/grades?gradeId=${gradeId}`, {
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
    } catch (error) {
      console.error('Error deleting grade:', error)
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការលុបពិន្ទុ",
        variant: "destructive"
      })
    }
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
    <div>
      <div className="animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8 p-6">

          {/* Enhanced Filter Bar */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-indigo-50/20 to-blue-50/20 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-blue-950/10 rounded-3xl -z-10" />

            <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
              {/* Enhanced Header */}
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-6">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10" />

                <div className="relative z-10 flex items-center space-x-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">សូមជ្រើសរើស</h2>
                    <div className="h-1 w-8 bg-white/30 rounded-full mt-2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                {/* Modern Filter Row - Enhanced Design */}
                <div className="space-y-6">

                  {/* Filter Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {/* Academic Year */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-base font-semibold text-primary dark:text-gray-300">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>ឆ្នាំសិក្សា</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/60 transition-all duration-200 rounded-xl">
                          <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {schoolYears.map((year) => (
                            <SelectItem key={year.schoolYearId} value={year.schoolYearId.toString()}>
                              {year.schoolYearCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Semester */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-base font-semibold text-primary dark:text-gray-300">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>ឆមាស</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <Select value={selectedSemester} onValueChange={handleSemesterChange}>
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/60 transition-all duration-200 rounded-xl">
                          <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {semesters.map((semester) => (
                            <SelectItem key={semester.semesterId} value={semester.semesterId.toString()}>
                              {semester.semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Class */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-base font-semibold text-primary dark:text-gray-300">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span>ថ្នាក់</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <Select value={selectedCourse} onValueChange={handleCourseChange}>
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/60 transition-all duration-200 rounded-xl">
                          <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {filteredCourses.map((course) => (
                            <SelectItem key={course.courseId} value={course.courseId.toString()}>
                              ថ្នាក់ទី {course.grade}{course.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Month */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-base font-semibold text-primary dark:text-gray-300">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>ខែ</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <Select value={selectedMonth} onValueChange={handleMonthChange}>
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/60 transition-all duration-200 rounded-xl">
                          <SelectValue placeholder="ជ្រើសរើសខែ" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Grade Year */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-base font-semibold text-primary dark:text-gray-300">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>ឆ្នាំពិន្ទុ</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <Select value={selectedGradeYear} onValueChange={handleGradeYearChange}>
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/60 transition-all duration-200 rounded-xl">
                          <SelectValue placeholder="ជ្រើសរើសឆ្នាំ" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {gradeYears.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Teacher Info */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-base font-semibold text-primary dark:text-gray-300">
                        <UserIcon className="h-4 w-4 text-primary" />
                        <span>ឈ្មោះគ្រូ</span>
                      </label>
                      <div className="h-12 px-4 py-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 border-2 border-primary/20 dark:border-primary/30 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-base font-semibold text-primary dark:text-primary-foreground block">
                            {getCurrentUser()?.lastname} {getCurrentUser()?.firstname}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Side by Side Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Side: Student List */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-primary dark:text-white">បញ្ជីឈ្មោះសិស្ស</h2>
                      <p className="text-base text-gray-500 dark:text-gray-400">
                        {filteredStudents.length} នាក់ • ជ្រើសរើសសិស្សដើម្បីបញ្ចូលពិន្ទុ
                      </p>
                    </div>
                  </div>
                  
                  {/* Search and Mode Toggle */}
                  <div className="flex items-center space-x-3">
                    {students.length > 0 && (
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="ស្វែងរកសិស្ស..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-64 h-9 pl-9"
                        />
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        }}
                        className="h-9"
                      >
                        {bulkMode ? 'បញ្ចូលតែមួយ' : 'បញ្ចូលជាក្រុម'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {loadingStudents ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-base text-gray-500">កំពុងទាញយកសិស្ស...</p>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {filteredStudents.map(student => (
                      <div 
                        key={student.studentId}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedStudent?.studentId === student.studentId 
                            ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-500 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800'
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
                            {student.photo ? (
                              <img
                                src={student.photo}
                                alt={`${student.lastName} ${student.firstName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              student.firstName.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-primary dark:text-white truncate text-base">
                              {student.lastName} {student.firstName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{getFormattedClass(student)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">មិនរកឃើញសិស្ស</p>
                    <p className="text-base text-gray-400">សូមស្វែងរកឈ្មោះផ្សេង</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">សូមបំពេញគ្រប់ផ្នែកដើម្បីមើលបញ្ជីសិស្ស</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Score Input */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <PlusIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-primary dark:text-white">
                      {editingGrade ? 'កែសម្រួលពិន្ទុ' : bulkMode ? 'បញ្ចូលពិន្ទុជាក្រុម' : 'បញ្ចូលពិន្ទុ'}
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400">
                      {bulkMode ? 'បញ្ចូលពិន្ទុសម្រាប់សិស្សច្រើននាក់' : 'បញ្ចូលពិន្ទុសម្រាប់សិស្សម្នាក់'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                    {bulkMode ? (
                      <div className="space-y-4">
                        {/* Subject Selection */}
                        <div>
                          <label className="block text-base font-medium mb-2 text-primary dark:text-gray-300">
                            មុខវិជ្ជា <span className="text-red-500">*</span>
                          </label>
                          <Select value={selectedSubject} onValueChange={(value) => {
                            setSelectedSubject(value)
                            checkExistingGrade(value)
                            // Initialize bulk scores with existing grades
                            setTimeout(() => initializeBulkScores(), 100)
                          }}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="ជ្រើសរើសមុខវិជ្ជា" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                                  {subject.subjectName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Bulk Score Input - Compact Table */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-primary dark:text-white">
                              បញ្ចូលពិន្ទុ ({filteredStudents.length} នាក់)
                            </h3>
                            <div className="text-sm text-gray-500">
                              បញ្ចូលពិន្ទុសម្រាប់សិស្សច្រើននាក់
                            </div>
                          </div>
                          
                          <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="divide-y divide-gray-200 dark:divide-gray-600">
                              {filteredStudents.map(student => (
                                <div key={student.studentId} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                      {student.photo ? (
                                        <img
                                          src={student.photo}
                                          alt={`${student.lastName} ${student.firstName}`}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        student.firstName.charAt(0)
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-primary dark:text-white text-base truncate">
                                        {student.lastName} {student.firstName}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">{getFormattedClass(student)}</p>
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
                                        className="w-24 h-9 text-center text-base"
                                      />
                                      <Input
                                        type="text"
                                        placeholder="មតិ"
                                        value={bulkScores[student.studentId]?.comment || ""}
                                        onChange={(e) => handleBulkCommentChange(student.studentId, e.target.value)}
                                        className="w-44 h-9 text-base"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setBulkMode(false)
                              setBulkScores({})
                              setSelectedSubject("")
                            }}
                            className="flex-1 h-10"
                            disabled={submitting}
                          >
                            បោះបង់
                          </Button>
                          <Button
                            type="button"
                            onClick={handleBulkSubmit}
                            className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
                            disabled={submitting || !selectedSubject || Object.keys(bulkScores).length === 0}
                          >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            បញ្ចូលពិន្ទុ
                          </Button>
                        </div>
                      </div>
                    ) : selectedStudent ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Selected Student Info */}
                        <div className="bg-gradient-to-r p-4 from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {selectedStudent.photo ? (
                                <img
                                  src={selectedStudent.photo}
                                  alt={`${selectedStudent.lastName} ${selectedStudent.firstName}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                selectedStudent.firstName.charAt(0)
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-primary dark:text-white">{selectedStudent.lastName} {selectedStudent.firstName}</h3>
                              <p className="text-base text-gray-600 dark:text-gray-400 pt-1 pb-1">{getFormattedClass(selectedStudent)}</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                ពិន្ទុអតិបរមា: {getMaxScore(selectedStudent)} ពិន្ទុ
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Score Input Fields */}
                        <div className="space-y-4 pt-4">
                          {/* Subject Selection */}
                          <div>
                            <label className="block text-base font-medium mb-2 text-primary dark:text-gray-300">
                              មុខវិជ្ជា <span className="text-red-500">*</span>
                            </label>
                            <Select value={selectedSubject} onValueChange={(value) => {
                              setSelectedSubject(value)
                              checkExistingGrade(value)
                            }}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="ជ្រើសរើសមុខវិជ្ជា" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map((subject) => (
                                  <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                                    {subject.subjectName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Score Input */}
                          <div className="space-y-3">
                            <label className="block text-base font-medium text-primary dark:text-gray-300">
                              លេខពិន្ទុ <span className="text-red-500">*</span>
                            </label>
                            
                            {/* Score Input with Grade Preview */}
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
                                className={`h-12 text-lg text-center font-semibold ${
                                  scoreError 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : isValidScore && score 
                                      ? 'border-green-500 focus:border-green-500' 
                                      : ''
                                }`}
                              />
                              
                            </div>

                            {/* Error Message */}
                            {scoreError && (
                              <div className="flex items-center space-x-2 text-red-600 text-base">
                                <AlertCircle className="h-4 w-4" />
                                <span>{scoreError}</span>
                              </div>
                            )}
                          </div>

                          {/* Comment Input */}
                          <div>
                            <label className="block text-base font-medium mb-2 text-primary dark:text-gray-300">
                              មតិផ្សេងៗ
                              <span className="text-gray-400 text-sm ml-2">(ជម្រើស)</span>
                            </label>
                            <Input
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="បញ្ចូលមតិឬយោបល់បន្ថែម"
                              className="h-11"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {editingGrade ? (
                            <>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleCancelEdit}
                                className="flex-1 h-10"
                                disabled={submitting}
                              >
                                បោះបង់
                              </Button>
                              <Button 
                                type="submit" 
                                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={submitting || !isValidScore || !selectedSubject || !score}
                              >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
                                className="flex-1 h-10"
                                disabled={submitting}
                              >
                                សម្អាត
                              </Button>
                              <Button 
                                type="submit" 
                                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={submitting || !isValidScore || !selectedSubject || !score}
                              >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                បន្ថែមពិន្ទុ
                              </Button>
                            </>
                          )}
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <PlusIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">
                          {bulkMode ? 'បញ្ចូលពិន្ទុជាក្រុម' : 'ជ្រើសរើសសិស្ស'}
                        </p>
                        <p className="text-base">
                          {bulkMode 
                            ? 'សូមជ្រើសរើសមុខវិជ្ជាដើម្បីបញ្ចូលពិន្ទុសម្រាប់សិស្សទាំងអស់'
                            : 'សូមជ្រើសរើសសិស្សដើម្បីបញ្ចូលពិន្ទុ'
                          }
                        </p>
                      </div>
                    )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Grade List - Full Width */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Hash className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-primary dark:text-white">
                        បញ្ជីពិន្ទុសិស្ស {selectedStudent?.lastName} {selectedStudent?.firstName || ''}
                      </h2>
                      <p className="text-base text-gray-500 dark:text-gray-400">
                        សរុប {totalGrades} ពិន្ទុ • មធ្យមភាគ {averageScore}
                        {gradeListMonth !== 'all' && gradeListYear !== 'all' && (
                          <span className="ml-2 text-green-600 dark:text-green-400">
                            (ខែ {gradeListMonth}/{gradeListYear.slice(-2)})
                          </span>
                        )}
                        {gradeListMonth !== 'all' && gradeListYear === 'all' && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            (ខែ {gradeListMonth})
                          </span>
                        )}
                        {gradeListMonth === 'all' && gradeListYear !== 'all' && (
                          <span className="ml-2 text-purple-600 dark:text-purple-400">
                            (ឆ្នាំ {gradeListYear})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Grade List Filters */}
                  {selectedStudent && grades.length > 0 && (
                    <div className="space-y-2">
                      {/* Auto-sync explanation and toggle */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>តម្រងនេះនឹងសម្រួលដោយស្វ័យប្រវត្តិពីតម្រងខាងលើ</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">សម្រួលស្វ័យប្រវត្តិ:</label>
                          <button
                            onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                              autoSyncEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                autoSyncEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                      {/* Sync Status Indicator */}
                      {autoSyncEnabled && ((selectedMonth && selectedMonth !== '') || (selectedGradeYear && selectedGradeYear !== '')) ? (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-md">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            តម្រងដោយស្វ័យប្រវត្តិ
                          </span>
                        </div>
                      ) : !autoSyncEnabled && (gradeListMonth !== 'all' || gradeListYear !== 'all') ? (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                            តម្រងដោយដៃ
                          </span>
                        </div>
                      ) : (gradeListMonth !== 'all' || gradeListYear !== 'all') ? (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            កំពុងតម្រង
                          </span>
                        </div>
                      ) : null}
                      <div className="flex items-center space-x-2">
                        <label className="text-base font-medium text-primary dark:text-gray-300">ខែ</label>
                        <Select value={gradeListMonth} onValueChange={setGradeListMonth}>
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue placeholder="ទាំងអស់" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ទាំងអស់</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = String(i + 1).padStart(2, '0')
                              const monthNames = [
                                'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
                                'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
                              ]
                              return (
                                <SelectItem key={month} value={month}>
                                  {monthNames[i]}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-base font-medium text-primary dark:text-gray-300">ឆ្នាំ</label>
                        <Select value={gradeListYear} onValueChange={setGradeListYear}>
                          <SelectTrigger className="w-30 h-8">
                            <SelectValue placeholder="ទាំងអស់" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ទាំងអស់</SelectItem>
                            {gradeYears.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {((gradeListMonth && gradeListMonth !== 'all') || (gradeListYear && gradeListYear !== 'all')) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGradeListMonth("all")
                            setGradeListYear("all")
                          }}
                          className="h-8 px-3"
                        >
                          សម្អាត
                        </Button>
                      )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            
            <div className="p-4">
                {selectedStudent ? (
                  <>
                    {loadingGrades ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-600" />
                        <p className="text-base text-gray-500">កំពុងទាញយកពិន្ទុ...</p>
                      </div>
                    ) : filteredGrades.length > 0 ? (
                      <>
                        {/* Compact Grade List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredGrades.map((grade) => (
                            <div key={grade.gradeId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-base">
                                  {grade.subject.subjectName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-primary dark:text-white text-base">
                                    {grade.subject.subjectName}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {grade.gradeDate} • {grade.user ? `${grade.user.lastname} ${grade.user.firstname}` : 'មិនមាន'}
                                    {grade.gradeDate && (
                                      <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm">
                                        {grade.gradeDate}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <span className={`px-3 py-1 rounded-full text-base font-bold ${
                                    grade.grade >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                    grade.grade >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                    grade.grade >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  }`}>
                                    {grade.grade}
                                  </span>
                                </div>
                                
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-blue-600 border-blue-300 hover:bg-blue-50"
                                    onClick={() => handleEdit(grade)}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => handleDelete(grade.gradeId)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Stats Summary - Compact */}
                        <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">ចំនួនពិន្ទុ</p>
                            <p className="text-lg font-bold text-primary dark:text-white">{totalGrades}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">សរុបពិន្ទុ</p>
                            <p className="text-lg font-bold text-primary dark:text-white">{totalPoints}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">មធ្យមភាគ</p>
                            <p className="text-lg font-bold text-primary dark:text-white">{averageScore}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">ថ្នាក់</p>
                            <p className="text-lg font-bold text-primary dark:text-white">{selectedStudent ? getFormattedClass(selectedStudent) : '-'}</p>
                          </div>
                        </div>
                        </>
                      ) : grades.length > 0 ? (
                        <div className="text-center py-8">
                          <Hash className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-500 font-medium">មិនរកឃើញពិន្ទុ</p>
                          <p className="text-base text-gray-400">
                            មិនមានពិន្ទុសម្រាប់ខែ និងឆ្នាំដែលបានជ្រើសរើស
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGradeListMonth("all")
                              setGradeListYear("all")
                            }}
                            className="mt-3"
                          >
                            មើលពិន្ទុទាំងអស់
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-500 font-medium">មិនមានពិន្ទុ</p>
                          <p className="text-base text-gray-400">សិស្សនេះមិនទាន់មានពិន្ទុនៅឡើយទេ</p>
                        </div>
                      )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Hash className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">គ្មានពិន្ទុ</p>
                    <p className="text-base text-gray-400">សូមជ្រើសរើសសិស្សដើម្បីមើលពិន្ទុ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
} // End of AddScoreContent component
