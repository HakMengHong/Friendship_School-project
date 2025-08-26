import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getCurrentUser } from '@/lib/auth-service'

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
  gradeDate: string
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

export function useGradeManagement() {
  const { toast } = useToast()
  
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

  // Loading states
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)

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

  // Helper function to get current date
  const getCurrentDate = () => {
    const currentDate = new Date()
    return {
      month: String(currentDate.getMonth() + 1).padStart(2, '0'),
      year: String(currentDate.getFullYear())
    }
  }

  // Helper function to get grade label
  const getGradeLabel = (gradeNumber: string | number) => {
    const gradeMap: { [key: string]: string } = {
      "1": "ថ្នាក់ទី១",
      "2": "ថ្នាក់ទី២", 
      "3": "ថ្នាក់ទី៣",
      "4": "ថ្នាក់ទី៤",
      "5": "ថ្នាក់ទី៥",
      "6": "ថ្នាក់ទី៦",
      "7": "ថ្នាក់ទី៧",
      "8": "ថ្នាក់ទី៨",
      "9": "ថ្នាក់ទី៩"
    }
    return gradeMap[gradeNumber?.toString()] || gradeNumber?.toString() || "N/A"
  }

  // Fetch data functions
  const fetchSchoolYears = useCallback(async () => {
    try {
      const response = await fetch('/api/school-years')
      const data = await response.json()
      setSchoolYears(data || [])
    } catch (error) {
      console.error('Error fetching school years:', error)
      toast({
        title: "Error",
        description: "Failed to fetch school years",
        variant: "destructive"
      })
    }
  }, [toast])

  const fetchSemesters = useCallback(async () => {
    try {
      const response = await fetch('/api/semesters')
      const data = await response.json()
      setSemesters(data || [])
    } catch (error) {
      console.error('Error fetching semesters:', error)
      toast({
        title: "Error",
        description: "Failed to fetch semesters",
        variant: "destructive"
      })
    }
  }, [toast])

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch('/api/subjects')
      const data = await response.json()
      setSubjects(data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive"
      })
    }
  }, [toast])

  const fetchCourses = useCallback(async () => {
    if (!selectedSchoolYear) {
      setCourses([])
      return
    }

    try {
      const response = await fetch(`/api/courses?schoolYearId=${selectedSchoolYear}`)
      const data = await response.json()
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      })
    }
  }, [selectedSchoolYear, toast])

  const fetchStudents = useCallback(async () => {
    if (!selectedCourse) {
      setStudents([])
      return
    }

    try {
      setLoadingStudents(true)
      const response = await fetch(`/api/students/enrolled?courseId=${selectedCourse}`)
      const data = await response.json()
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      })
    } finally {
      setLoadingStudents(false)
    }
  }, [selectedCourse, toast])

  const fetchGrades = useCallback(async () => {
    if (!selectedCourse || !selectedSubject || !selectedSemester) {
      setGrades([])
      return
    }

    try {
      setLoadingGrades(true)
      const params = new URLSearchParams({
        courseId: selectedCourse,
        subjectId: selectedSubject,
        semesterId: selectedSemester
      })
      
      if (selectedMonth) params.append('month', selectedMonth)
      if (selectedGradeYear) params.append('year', selectedGradeYear)

      const response = await fetch(`/api/grades?${params.toString()}`)
      const data = await response.json()
      setGrades(data || [])
    } catch (error) {
      console.error('Error fetching grades:', error)
      toast({
        title: "Error",
        description: "Failed to fetch grades",
        variant: "destructive"
      })
    } finally {
      setLoadingGrades(false)
    }
  }, [selectedCourse, selectedSubject, selectedSemester, selectedMonth, selectedGradeYear, toast])

  // Form handling functions
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setScore("")
    setComment("")
  }

  const handleScoreSubmit = async () => {
    if (!selectedStudent || !selectedSubject || !selectedCourse || !selectedSemester || !score) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (editingGrade) {
      await handleGradeUpdate()
    } else {
      await handleGradeCreate()
    }
  }

  const handleGradeCreate = async () => {
    if (!selectedStudent || !selectedSubject || !selectedCourse || !selectedSemester || !score) {
      return
    }

    setSubmitting(true)
    try {
      const currentUser = await getCurrentUser()
      const currentDate = getCurrentDate()
      
      const gradeData: GradeInput = {
        studentId: selectedStudent.studentId,
        subjectId: parseInt(selectedSubject),
        courseId: parseInt(selectedCourse),
        semesterId: parseInt(selectedSemester),
        grade: parseFloat(score),
        gradeComment: comment || undefined,
        userId: currentUser?.userid,
        month: selectedMonth || currentDate.month,
        gradeYear: selectedGradeYear || currentDate.year,
        gradeDate: `${selectedMonth || currentDate.month}/${selectedGradeYear || currentDate.year}`
      }

      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Grade added successfully"
        })
        setScore("")
        setComment("")
        setSelectedStudent(null)
        fetchGrades()
      } else {
        throw new Error('Failed to add grade')
      }
    } catch (error) {
      console.error('Error adding grade:', error)
      toast({
        title: "Error",
        description: "Failed to add grade",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGradeUpdate = async () => {
    if (!editingGrade || !score) {
      return
    }

    setSubmitting(true)
    try {
      const gradeData = {
        grade: parseFloat(score),
        gradeComment: comment || null
      }

      const response = await fetch(`/api/grades/${editingGrade.gradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Grade updated successfully"
        })
        setScore("")
        setComment("")
        setSelectedStudent(null)
        setEditingGrade(null)
        fetchGrades()
      } else {
        throw new Error('Failed to update grade')
      }
    } catch (error) {
      console.error('Error updating grade:', error)
      toast({
        title: "Error",
        description: "Failed to update grade",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGradeDelete = async (gradeId: number) => {
    try {
      const response = await fetch(`/api/grades/${gradeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Grade deleted successfully"
        })
        fetchGrades()
      } else {
        throw new Error('Failed to delete grade')
      }
    } catch (error) {
      console.error('Error deleting grade:', error)
      toast({
        title: "Error",
        description: "Failed to delete grade",
        variant: "destructive"
      })
    }
  }

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade)
    setSelectedStudent(grade.student)
    setScore(grade.grade.toString())
    setComment(grade.gradeComment || "")
  }

  const handleCancelEdit = () => {
    setEditingGrade(null)
    setSelectedStudent(null)
    setScore("")
    setComment("")
  }

  // Filter handling functions
  const handleSchoolYearChange = (schoolYearId: string) => {
    setSelectedSchoolYear(schoolYearId)
    setSelectedCourse("")
    setSelectedStudent(null)
    setScore("")
    setComment("")
    setEditingGrade(null)
  }

  const handleSemesterChange = (semesterId: string) => {
    setSelectedSemester(semesterId)
    setSelectedStudent(null)
    setScore("")
    setComment("")
    setEditingGrade(null)
  }

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
    setSelectedStudent(null)
    setScore("")
    setComment("")
    setEditingGrade(null)
  }

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedStudent(null)
    setScore("")
    setComment("")
    setEditingGrade(null)
  }

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([
        fetchSchoolYears(),
        fetchSemesters(),
        fetchSubjects()
      ])
      setLoading(false)
    }
    initializeData()
  }, [fetchSchoolYears, fetchSemesters, fetchSubjects])

  // Fetch courses when school year changes
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Fetch students when course changes
  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Fetch grades when filters change
  useEffect(() => {
    fetchGrades()
  }, [fetchGrades])

  return {
    // State
    selectedSchoolYear,
    selectedSemester,
    selectedCourse,
    selectedMonth,
    selectedGradeYear,
    searchTerm,
    selectedSubject,
    score,
    comment,
    selectedStudent,
    editingGrade,
    schoolYears,
    semesters,
    courses,
    subjects,
    students,
    grades,
    loading,
    loadingStudents,
    loadingGrades,
    submitting,
    error,
    months,
    gradeYears,

    // Actions
    setSelectedSchoolYear,
    setSelectedSemester,
    setSelectedCourse,
    setSelectedMonth,
    setSelectedGradeYear,
    setSearchTerm,
    setSelectedSubject,
    setScore,
    setComment,
    setSelectedStudent,
    setEditingGrade,

    // Functions
    getGradeLabel,
    handleStudentSelect,
    handleScoreSubmit,
    handleGradeDelete,
    handleEditGrade,
    handleCancelEdit,
    handleSchoolYearChange,
    handleSemesterChange,
    handleCourseChange,
    handleSubjectChange,
    fetchSchoolYears,
    fetchSemesters,
    fetchSubjects,
    fetchCourses,
    fetchStudents,
    fetchGrades
  }
}
