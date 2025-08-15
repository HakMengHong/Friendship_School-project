"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  TrendingUp
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
  grade: number
  gradeComment?: string
  userId?: number
  month?: string
  gradeYear?: string
  gradeDate: string
}

export default function AddScorePage() {
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
  
  const gradeYears = [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" }
  ]

  // Loading states
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)
  
  // Helper function to get current date
  const getCurrentDate = () => {
    const currentDate = new Date()
    return {
      month: String(currentDate.getMonth() + 1).padStart(2, '0'),
      year: String(currentDate.getFullYear())
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
      
      const response = await fetch(`/api/admin/grades?${params}`)
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

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [schoolYearsRes, semestersRes, subjectsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/school-years'),
        fetch('/api/admin/semesters'),
        fetch('/api/admin/subjects'),
        fetch('/api/admin/courses')
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
          name: c.courseName, 
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

      const response = await fetch(`/api/admin/students/enrolled?${params}`)
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
        currentTeacher: `${getCurrentUser()?.firstname} ${getCurrentUser()?.lastname}`,
        currentUserId: getCurrentUser()?.id
      })
      console.log('🔍 Formatted gradeDate:', formattedGradeDate)

      if (editingGrade) {
        // Update existing grade
        const response = await fetch('/api/admin/grades', {
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
        const response = await fetch('/api/admin/grades', {
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
    
    // Reset to current date instead of empty
    const { month, year } = getCurrentDate()
    setSelectedMonth(month)
    setSelectedGradeYear(year)
  }

  const handleDelete = async (gradeId: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបពិន្ទុនេះមែនទេ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/grades?gradeId=${gradeId}`, {
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
    filteredCourses: filteredCourses.map(c => ({ id: c.courseId, name: c.courseName, schoolYear: c.schoolYear?.schoolYearCode }))
  })

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  // Calculate stats
  const totalGrades = grades.length
  const totalPoints = grades.reduce((sum, grade) => sum + grade.grade, 0)
  const averageScore = totalGrades > 0 ? (totalPoints / totalGrades).toFixed(2) : "0.00"

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <div className="animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-8 p-6">
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg text-muted-foreground">កំពុងទាញយកទិន្នន័យ...</p>
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
              <p className="text-lg text-destructive mb-2">មានបញ្ហាក្នុងការទាញយកទិន្នន័យ</p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchInitialData}>ព្យាយាមម្តងទៀត</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8 p-6">
          {/* Modern Header Section */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-green-950/20 rounded-3xl -z-10" />

            <div className="text-center space-y-6 p-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  បន្ថែមពិន្ទុសិស្ស
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  ប្រព័ន្ធគ្រប់គ្រងការបញ្ចូល និងគ្រប់គ្រងពិន្ទុសិស្សតាមថ្នាក់រៀន និងមុខវិជ្ជា
                </p>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{schoolYears.length}</p>
                        <p className="text-xs text-blue-500 dark:text-blue-300 font-medium">ឆ្នាំសិក្សា</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{courses.length}</p>
                        <p className="text-xs text-purple-500 dark:text-purple-300 font-medium">ថ្នាក់រៀន</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{students.length}</p>
                        <p className="text-xs text-green-500 dark:text-green-300 font-medium">សិស្សសរុប</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{grades.length}</p>
                        <p className="text-xs text-orange-500 dark:text-orange-300 font-medium">ពិន្ទុសរុប</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    <h2 className="text-2xl font-bold text-white">សូមជ្រើសរើស</h2>
                    <div className="h-1 w-8 bg-white/30 rounded-full mt-2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Combined Filter Row - All filters in one line */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
                    <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
                      <SelectTrigger className="h-11 bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200">
                        <SelectValue placeholder="ឆ្នាំសិក្សា" />
                      </SelectTrigger>
                      <SelectContent>
                        {schoolYears.map((year) => (
                          <SelectItem key={year.schoolYearId} value={year.schoolYearId.toString()}>
                            {year.schoolYearCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឆមាស</label>
                    <Select value={selectedSemester} onValueChange={handleSemesterChange}>
                      <SelectTrigger className="h-11 bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200">
                        <SelectValue placeholder="ឆមាស" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((semester) => (
                          <SelectItem key={semester.semesterId} value={semester.semesterId.toString()}>
                            {semester.semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ថ្នាក់</label>
                    <Select value={selectedCourse} onValueChange={handleCourseChange}>
                      <SelectTrigger className="h-11 bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200">
                        <SelectValue placeholder="ថ្នាក់" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCourses.map((course) => (
                          <SelectItem key={course.courseId} value={course.courseId.toString()}>
                            {course.courseName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ខែ</label>
                    <Select value={selectedMonth} onValueChange={handleMonthChange}>
                      <SelectTrigger className="h-11 bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200">
                        <SelectValue placeholder="ខែ" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឆ្នាំពិន្ទុ</label>
                    <Select value={selectedGradeYear} onValueChange={handleGradeYearChange}>
                      <SelectTrigger className="h-11 bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200">
                        <SelectValue placeholder="ឆ្នាំពិន្ទុ" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeYears.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឈ្មេាះគ្រូ</label>
                    <div className="h-11 px-3 py-2 bg-gradient-to-r from-gray-50 via-gray-50/95 to-gray-50/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border border-gray-200 dark:border-gray-600 rounded-md flex items-center">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {getCurrentUser()?.firstname} {getCurrentUser()?.lastname}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student List and Score Input */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Enhanced Student List */}
            <div className="xl:col-span-3">
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-emerald-50/20 to-green-50/20 dark:from-green-950/10 dark:via-emerald-950/10 dark:to-green-950/10 rounded-3xl -z-10" />

                <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
                  {/* Enhanced Header */}
                  <CardHeader className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white p-6">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">បញ្ជីឈ្មោះសិស្ស</h2>
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                              {filteredStudents.length} នាក់
                            </Badge>
                            <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loadingStudents ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">កំពុងទាញយក...</p>
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredStudents.map(student => (
                          <div 
                            key={student.studentId}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedStudent?.studentId === student.studentId 
                                ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                            }`}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {student.photo ? (
                                  <img
                                    src={student.photo}
                                    alt={`${student.firstName} ${student.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  student.firstName.charAt(0)
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white">{student.firstName} {student.lastName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ថ្នាក់ទី {student.class}</p>
                              </div>
                              <div className="text-right">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>សូមបំពេញគ្រប់ផ្នែកដើម្បីមើលបញ្ជីសិស្ស</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Side Content - Score Input Form above Score List */}
            <div className="xl:col-span-9 space-y-4">
              {/* Enhanced Score Input Form */}
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-red-50/20 to-orange-50/20 dark:from-orange-950/10 dark:via-red-950/10 dark:to-orange-950/10 rounded-3xl -z-10" />

                <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
                  {/* Enhanced Header */}
                  <CardHeader className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white p-6">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

                    <div className="relative z-10 flex items-center space-x-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <PlusIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {editingGrade ? 'កែសម្រួលពិន្ទុ' : 'កន្លែងបញ្ចូលពិន្ទុ'}
                        </h2>
                        <div className="h-1 w-8 bg-white/30 rounded-full mt-2"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {selectedStudent ? (
                      <form onSubmit={handleSubmit} className="space-y-2">
                        {/* Student Info Display */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {selectedStudent.photo ? (
                                <img
                                  src={selectedStudent.photo}
                                  alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                selectedStudent.firstName.charAt(0)
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                              <p className="text-gray-600 dark:text-gray-400">ថ្នាក់ទី {selectedStudent.class}</p>
                            </div>
                          </div>
                        </div>

                        {/* Score Input Fields */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">មុខវិជ្ជា</label>
                              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger className="h-14 text-base bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200">
                                  <SelectValue placeholder="សូមជ្រើសរើស" />
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
                          </div>

                          <div className="flex items-center grid-cols-1 gap-4">
                            <label className="text-lg font-medium text-gray-700 dark:text-gray-300">លេខពិន្ទុ:</label>
                            <Input
                              type="number"
                              value={score}
                              onChange={(e) => setScore(e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="សូមបញ្ចូល"
                              className="h-16 text-xl flex text-center bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">មតិផ្សេងៗ</label>
                            <Input
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="សូមបញ្ចូលមតិ"
                              className="h-14 text-base bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-1">
                          {editingGrade ? (
                            <>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleCancelEdit}
                                className="px-6 py-3 text-base"
                                disabled={submitting}
                              >
                                បោះបង់
                              </Button>
                              <Button 
                                type="submit" 
                                className="px-5 py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={submitting}
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
                                  setEditingGrade(null)
                                }}
                                className="px-8 py-3 text-base"
                                disabled={submitting}
                              >
                                សម្អាត
                              </Button>
                              <Button 
                                type="submit" 
                                className="px-5 py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={submitting}
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
                        <p className="text-lg font-medium mb-2">ជ្រើសរើសសិស្ស</p>
                        <p className="text-sm">សូមជ្រើសរើសសិស្សដើម្បីបញ្ចូលពិន្ទុ</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Score List */}
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-pink-50/20 to-purple-50/20 dark:from-purple-950/10 dark:via-pink-950/10 dark:to-purple-950/10 rounded-3xl -z-10" />

                <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
                  {/* Enhanced Header */}
                  <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-6">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                          <Hash className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">បញ្ជីពិន្ទុសិស្ស {selectedStudent?.firstName} {selectedStudent?.lastName || ''}</h2>
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                              សរុប: {grades.length} ពិន្ទុ
                            </Badge>
                            <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {selectedStudent ? (
                      <>
                        {loadingGrades ? (
                          <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                            <p className="text-sm text-muted-foreground">កំពុងទាញយកពិន្ទុ...</p>
                          </div>
                        ) : grades.length > 0 ? (
                          <>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="font-semibold">មុខវិជ្ជា</TableHead>
                                    <TableHead className="font-semibold">ចំនួនពិន្ទុ</TableHead>
                                    <TableHead className="font-semibold">ខែ/ឆ្នាំ</TableHead>
                                    <TableHead className="font-semibold">គ្រូ/អ្នកគ្រប់គ្រង</TableHead>
                                    <TableHead className="font-semibold">មតិ</TableHead>
                                    <TableHead className="font-semibold">សកម្មភាព</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {grades.map((grade) => (
                                    <TableRow key={grade.gradeId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <TableCell className="font-medium">{grade.subject.subjectName}</TableCell>
                                      <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                          grade.grade >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                          grade.grade >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                          grade.grade >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                          {grade.grade}
                                        </span>
                                      </TableCell>
                                      <TableCell>{grade.gradeDate}</TableCell>
                                      <TableCell>
                                        {grade.user ? (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium">
                                              {grade.user.firstname} {grade.user.lastname}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                              grade.user.role === 'teacher' 
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            }`}>
                                              {grade.user.role === 'teacher' ? 'គ្រូ' : 'អ្នកគ្រប់គ្រង'}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-sm text-gray-500">មិនមាន</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="max-w-xs truncate">{grade.gradeComment || '-'}</TableCell>
                                      <TableCell>
                                        <div className="flex space-x-1">
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-blue-600 border-blue-300"
                                            onClick={() => handleEdit(grade)}
                                          >
                                            <Edit3 className="h-3 w-3 mr-1" />
                                            កែ
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-red-600 border-red-300"
                                            onClick={() => handleDelete(grade.gradeId)}
                                          >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            លុប
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Enhanced Stats Summary */}
                            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
                              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">ចំនួនពិន្ទុ</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalGrades}</p>
                              </div>
                              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">សរុបពិន្ទុ</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalPoints}</p>
                              </div>
                              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">មធ្យមភាគ</p>
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{averageScore}</p>
                              </div>
                              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">ថ្នាក់</p>
                                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{selectedStudent.class}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">មិនមានពិន្ទុ</p>
                            <p className="text-sm">សិស្សនេះមិនទាន់មានពិន្ទុនៅឡើយទេ</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-lg font-medium mb-2">គ្មានពិន្ទុ</p>
                        <p className="text-sm">សូមជ្រើសរើសសិស្សដើម្បីមើលពិន្ទុ</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
