import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'

interface Student {
  studentId: number
  firstName: string
  lastName: string
  gender: string
  dob: string
  class: string
  phone?: string
  status: string
  schoolYear: string
  photo?: string
  registrationDate?: string
}

interface Course {
  courseId: number
  grade: string
  section: string
  courseName: string
  schoolYear: {
    schoolYearId: number
    schoolYearCode: string
  }
  teacherId1?: number
  teacherId2?: number
  teacherId3?: number
}

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Enrollment {
  enrollmentId: number
  studentId: number
  courseId: number
  enrollmentDate: string
  drop: boolean
  dropDate?: string
  student: Student
  course: Course
}

interface Teacher {
  userId: number
  firstName: string
  lastName: string
}

export function useViewStudentClass() {
  // Loading states
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  
  // Filter states
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  
  // Remove student states
  const [removingStudent, setRemovingStudent] = useState<Enrollment | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  
  // Auto-show students when both filters are selected
  const [autoShowStudents, setAutoShowStudents] = useState(false)

  // Initialize data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Auto-show students when both filters are selected
  useEffect(() => {
    if (shouldShowStudents) {
      setAutoShowStudents(true)
    }
  }, [selectedSchoolYear, selectedCourse])

  // Fetch all data function
  const fetchAllData = async () => {
    setDataLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchSchoolYears(),
        fetchCourses(),
        fetchStudents(),
        fetchEnrollments(),
        fetchTeachers()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
    } finally {
      setDataLoading(false)
    }
  }

  // Fetch school years
  const fetchSchoolYears = async () => {
    try {
      const response = await fetch('/api/school-years')
      if (response.ok) {
        const data = await response.json()
        setSchoolYears(data)
      }
    } catch (error) {
      console.error('Error fetching school years:', error)
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        // Handle the nested structure where users are in data.users
        const users = data.users || data
        const teacherUsers = users.filter((user: any) => user.role === 'teacher')
        setTeachers(teacherUsers)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  // Remove student from course
  const removeStudentFromCourse = async (enrollment: Enrollment) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/enrollments?enrollmentId=${enrollment.enrollmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        
        // Remove from local state
        setEnrollments(prev => prev.filter(e => e.enrollmentId !== enrollment.enrollmentId))
        
        toast.success(`បានដក ${enrollment.student.firstName} ${enrollment.student.lastName} ចេញពីថ្នាក់រៀនដោយជោគជ័យ`)
        
        // Close confirmation dialog
        setShowRemoveConfirm(false)
        setRemovingStudent(null)
      } else {
        const errorData = await response.json()
        toast.error(`មានបញ្ហា: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error removing student:', error)
      toast.error('មានបញ្ហាក្នុងការដកសិស្សចេញពីថ្នាក់រៀន')
    } finally {
      setLoading(false)
    }
  }

  // Handle remove student confirmation
  const handleRemoveStudent = (enrollment: Enrollment) => {
    setRemovingStudent(enrollment)
    setShowRemoveConfirm(true)
  }

  // Get teacher name by ID
  const getTeacherName = (teacherId?: number) => {
    if (!teacherId) return 'មិនទាន់ចាត់តាំង'
    const teacher = teachers.find(t => t.userId === teacherId)
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'មិនដឹង'
  }

  // Filter courses based on selected school year
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
      !selectedSchoolYear || course.schoolYear.schoolYearCode === selectedSchoolYear
    )
  }, [courses, selectedSchoolYear])

  // Filter enrollments based on selected course
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(enrollment => {
      if (!selectedCourse || selectedCourse === 'all') return true
      return enrollment.courseId === parseInt(selectedCourse) && !enrollment.drop
    })
  }, [enrollments, selectedCourse])

  // Filter students by search term
  const filteredStudentsBySearch = useMemo(() => {
    return filteredEnrollments.filter(enrollment => {
      if (!searchTerm) return true
      const student = enrollment.student
      return student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [filteredEnrollments, searchTerm])

  // Get course name
  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.courseId === courseId)
    if (!course) return 'មិនដឹង'
    return course.courseName || `ថ្នាក់ទី ${course.grade}${course.section}`
  }

  // Get selected course details
  const getSelectedCourseDetails = () => {
    if (!selectedCourse || selectedCourse === 'all') return null
    return courses.find(c => c.courseId === parseInt(selectedCourse))
  }

  // Check if we should auto-show students
  const shouldShowStudents = selectedSchoolYear && selectedCourse && selectedCourse !== 'all'

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSchoolYear('')
    setSelectedCourse('all')
    setSearchTerm('')
    setAutoShowStudents(false)
  }

  // Handle student search
  const handleStudentSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm)
  }

  // Handle school year change
  const handleSchoolYearChange = (value: string) => {
    setSelectedSchoolYear(value)
    setSelectedCourse('all') // Reset course selection when school year changes
    setAutoShowStudents(false)
  }

  // Handle course change
  const handleCourseChange = (value: string) => {
    setSelectedCourse(value)
    // Auto-show students when both school year and course are selected
    if (selectedSchoolYear && value !== 'all') {
      setAutoShowStudents(true)
    } else {
      setAutoShowStudents(false)
    }
  }

  // Statistics
  const statistics = useMemo(() => {
    const totalStudents = students.length
    const totalCourses = courses.length
    const totalSchoolYears = schoolYears.length
    const totalEnrollments = enrollments.filter(e => !e.drop).length
    const activeEnrollments = filteredEnrollments.length
    const displayedStudents = filteredStudentsBySearch.length

    return {
      totalStudents,
      totalCourses,
      totalSchoolYears,
      totalEnrollments,
      activeEnrollments,
      displayedStudents
    }
  }, [students, courses, schoolYears, enrollments, filteredEnrollments, filteredStudentsBySearch])

  // Course distribution
  const courseDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {}
    
    filteredEnrollments.forEach(enrollment => {
      const courseName = getCourseName(enrollment.courseId)
      distribution[courseName] = (distribution[courseName] || 0) + 1
    })
    
    return distribution
  }, [filteredEnrollments])

  // School year distribution
  const schoolYearDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {}
    
    filteredEnrollments.forEach(enrollment => {
      const schoolYear = enrollment.student.schoolYear
      distribution[schoolYear] = (distribution[schoolYear] || 0) + 1
    })
    
    return distribution
  }, [filteredEnrollments])

  return {
    // Loading states
    loading,
    dataLoading,
    
    // Error state
    error,
    
    // Data
    students,
    courses: filteredCourses,
    schoolYears,
    enrollments: filteredEnrollments,
    teachers,
    filteredStudentsBySearch,
    
    // Filter states
    selectedSchoolYear,
    selectedCourse,
    searchTerm,
    showFilters,
    autoShowStudents,
    
    // Remove student states
    removingStudent,
    showRemoveConfirm,
    
    // Computed values
    statistics,
    courseDistribution,
    schoolYearDistribution,
    getCourseName,
    getSelectedCourseDetails,
    getTeacherName,
    shouldShowStudents,
    
    // Actions
    setSelectedSchoolYear,
    setSelectedCourse,
    setSearchTerm,
    setShowFilters,
    setAutoShowStudents,
    setRemovingStudent,
    setShowRemoveConfirm,
    
    // Functions
    fetchAllData,
    fetchSchoolYears,
    fetchCourses,
    fetchStudents,
    fetchEnrollments,
    fetchTeachers,
    removeStudentFromCourse,
    handleRemoveStudent,
    clearAllFilters,
    handleStudentSearch,
    handleSchoolYearChange,
    handleCourseChange
  }
}
