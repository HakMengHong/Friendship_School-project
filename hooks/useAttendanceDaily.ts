import { useState, useEffect, useMemo, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getCurrentUser } from '@/lib/auth-service'

// Database types based on updated schema
interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Course {
  courseId: number
  courseName: string
  grade: string
  section: string
  schoolYear: SchoolYear
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

interface Attendance {
  attendanceId: number
  studentId: number
  courseId: number
  attendanceDate: string
  session: 'AM' | 'PM' | 'FULL'
  status: string
  reason: string | null
  recordedBy: string | null
  createdAt: string
  updatedAt: string
  student: Student
  course: Course
}

interface FormData {
  schoolYear: string
  course: string
  date: string
}

interface AttendanceFormData {
  studentId: number
  courseId: number
  session: 'AM' | 'PM' | 'FULL'
  status: string
  reason: string
  time: string
}

export function useAttendanceDaily() {
  const { toast } = useToast()
  
  // State management
  const [formData, setFormData] = useState<FormData>({
    schoolYear: "",
    course: "",
    date: new Date().toISOString().split('T')[0],
  })

  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  
  const [loading, setLoading] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingAttendances, setLoadingAttendances] = useState(false)

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const [currentSession, setCurrentSession] = useState<'AM' | 'PM' | 'FULL'>('AM')
  const [searchTerm, setSearchTerm] = useState("")

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [attendanceForm, setAttendanceForm] = useState<AttendanceFormData>({
    studentId: 0,
    courseId: 0,
    session: 'AM',
    status: 'absent',
    reason: '',
    time: ''
  })

  const statusOptions = [
    { value: 'late', label: 'យឺត', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { value: 'absent', label: 'អវត្តមាន(ឥតច្បាប់)', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    { value: 'excused', label: 'អវត្តមាន(មានច្បាប់)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
  ]

  const sessionOptions = [
    { value: 'AM', label: 'ពេលព្រឹក' },
    { value: 'PM', label: 'ពេលរសៀល' },
    { value: 'FULL', label: 'ពេញមួយថ្ងៃ' }
  ]

  // Load current user on client side
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Fetch students when course changes
  useEffect(() => {
    if (formData.course) {
      fetchStudents()
    } else {
      setStudents([])
      setFilteredStudents([])
    }
  }, [formData.course])

  // Fetch attendances when course and date change
  useEffect(() => {
    if (formData.course && formData.date) {
      fetchAttendances()
    } else {
      setAttendances([])
    }
  }, [formData.course, formData.date])

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [students, searchTerm])

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [schoolYearsRes, coursesRes] = await Promise.all([
        fetch('/api/school-years'),
        fetch('/api/courses')
      ])

      if (!schoolYearsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch initial data')
      }

      const [schoolYearsData, coursesData] = await Promise.all([
        schoolYearsRes.json(),
        coursesRes.json()
      ])

      setSchoolYears(schoolYearsData)
      setCourses(coursesData)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true)
      const params = new URLSearchParams({
        courseId: formData.course
      })

      const response = await fetch(`/api/students/enrolled?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការទាញយកបញ្ជីសិស្ស",
        variant: "destructive"
      })
    } finally {
      setLoadingStudents(false)
    }
  }

  // Fetch attendances
  const fetchAttendances = async () => {
    try {
      setLoadingAttendances(true)
      const params = new URLSearchParams({
        courseId: formData.course,
        date: formData.date
      })

      const response = await fetch(`/api/attendance?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch attendances')
      }

      const data = await response.json()
      setAttendances(data)
    } catch (error) {
      console.error('Error fetching attendances:', error)
      // Don't show error toast for attendances as they might not exist yet
    } finally {
      setLoadingAttendances(false)
    }
  }

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  // Handle select changes
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  // Handle student click
  const handleStudentClick = useCallback((student: Student, session: 'AM' | 'PM' | 'FULL') => {
    setSelectedStudent(student)
    setCurrentSession(session)
    
    // Check if attendance already exists
    const existingAttendance = attendances.find(
      a => a.studentId === student.studentId && a.session === session
    )

    // Only set editingAttendance if we have a real attendance record with a valid ID
    if (existingAttendance && existingAttendance.attendanceId && existingAttendance.attendanceId > 0) {
      setEditingAttendance(existingAttendance)
      setAttendanceForm({
        studentId: student.studentId,
        courseId: parseInt(formData.course),
        session: session,
        status: existingAttendance.status,
        reason: existingAttendance.reason || '',
        time: ''
      })
    } else {
      // No attendance record exists, we'll create a new one
      setEditingAttendance(null)
      setAttendanceForm({
        studentId: student.studentId,
        courseId: parseInt(formData.course),
        session: session,
        status: 'absent',
        reason: '',
        time: ''
      })
    }

    setShowAttendanceForm(true)
  }, [attendances, formData.course])

  // Handle attendance submission
  const handleAttendanceSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Determine if we're editing or creating
      const isEditing = editingAttendance && 
                       editingAttendance.attendanceId && 
                       editingAttendance.attendanceId > 0 &&
                       typeof editingAttendance.attendanceId === 'number'
      
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing 
        ? `/api/attendance?attendanceId=${editingAttendance.attendanceId}`
        : '/api/attendance'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...attendanceForm,
          attendanceDate: formData.date,
          recordedBy: currentUser?.username || 'admin'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to save attendance: ${response.status} ${errorData.error || ''}`)
      }

      const result = await response.json()

      toast({
        title: "ជោគជ័យ",
        description: isEditing 
          ? "វត្តមានត្រូវបានកែសម្រួលដោយជោគជ័យ" 
          : "វត្តមានត្រូវបានរក្សាទុកដោយជោគជ័យ",
      })

      setShowAttendanceForm(false)
      setSelectedStudent(null)
      setEditingAttendance(null)
      fetchAttendances() // Refresh attendances
    } catch (error) {
      console.error('Error saving attendance:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "កំហុស",
        description: `មានបញ្ហាក្នុងការរក្សាទុកវត្តមាន: ${errorMessage}`,
        variant: "destructive"
      })
    }
  }, [attendanceForm, formData.date, editingAttendance, currentUser?.username])

  // Handle attendance deletion
  const handleDeleteAttendance = useCallback(async (attendanceId: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបវត្តមាននេះមែនទេ?')) {
      return
    }

    try {
      const response = await fetch(`/api/attendance?attendanceId=${attendanceId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete attendance')
      }

      toast({
        title: "ជោគជ័យ",
        description: "វត្តមានត្រូវបានលុបដោយជោគជ័យ",
      })

      fetchAttendances() // Refresh attendances
    } catch (error) {
      console.error('Error deleting attendance:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "កំហុស",
        description: `មានបញ្ហាក្នុងការលុបវត្តមាន: ${errorMessage}`,
        variant: "destructive"
      })
    }
  }, [])

  // Filtered courses based on selected school year
  const filteredCourses = useMemo(() => 
    formData.schoolYear 
      ? courses.filter(course => course.schoolYear.schoolYearId.toString() === formData.schoolYear)
      : courses
  , [courses, formData.schoolYear])

  // Calculate statistics
  const statistics = useMemo(() => {
    // Count students with attendance records
    const amPresent = attendances.filter(a => a.session === 'AM' && a.status === 'present').length
    const amAbsent = attendances.filter(a => a.session === 'AM' && a.status === 'absent').length
    const amLate = attendances.filter(a => a.session === 'AM' && a.status === 'late').length
    const amExcused = attendances.filter(a => a.session === 'AM' && a.status === 'excused').length
    
    const pmPresent = attendances.filter(a => a.session === 'PM' && a.status === 'present').length
    const pmAbsent = attendances.filter(a => a.session === 'PM' && a.status === 'absent').length
    const pmLate = attendances.filter(a => a.session === 'PM' && a.status === 'late').length
    const pmExcused = attendances.filter(a => a.session === 'PM' && a.status === 'excused').length

    const fullPresent = attendances.filter(a => a.session === 'FULL' && a.status === 'present').length
    const fullAbsent = attendances.filter(a => a.session === 'FULL' && a.status === 'absent').length
    const fullLate = attendances.filter(a => a.session === 'FULL' && a.status === 'late').length
    const fullExcused = attendances.filter(a => a.session === 'FULL' && a.status === 'excused').length

    // Add students without attendance records as present by default
    const studentsWithoutAM = students.length - attendances.filter(a => a.session === 'AM').length
    const studentsWithoutPM = students.length - attendances.filter(a => a.session === 'PM').length

    return {
      amPresent: amPresent + studentsWithoutAM, amAbsent, amLate, amExcused,
      pmPresent: pmPresent + studentsWithoutPM, pmAbsent, pmLate, pmExcused,
      fullPresent, fullAbsent, fullLate, fullExcused,
      totalPresent: (amPresent + studentsWithoutAM) + (pmPresent + studentsWithoutPM) + fullPresent,
      totalAbsent: amAbsent + pmAbsent + fullAbsent,
      totalLate: amLate + pmLate + fullLate,
      totalExcused: amExcused + pmExcused + fullExcused
    }
  }, [attendances, students.length])

  // Get attendance status for a student in a specific session
  const getStudentAttendance = useCallback((studentId: number, session: 'AM' | 'PM' | 'FULL') => {
    const attendance = attendances.find(a => a.studentId === studentId && a.session === session)
    return attendance
  }, [attendances])

  // Get default attendance status
  const getAttendanceStatus = useCallback((studentId: number, session: 'AM' | 'PM' | 'FULL') => {
    const attendance = attendances.find(a => a.studentId === studentId && a.session === session)
    const status = attendance ? attendance.status : 'present'
    return status
  }, [attendances])

  // Get status badge
  const getStatusBadge = useCallback((status: string) => {
    // Handle present status separately since it's not in statusOptions
    if (status === 'present') {
      return { label: 'វត្តមាន', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' }
    }
    
    const statusOption = statusOptions.find(opt => opt.value === status)
    if (!statusOption) return { label: 'មិនច្បាស់', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
    
    return { label: statusOption.label, color: statusOption.color }
  }, [])

  // Form validation
  const isFormValid = Boolean(formData.schoolYear && formData.course)

  return {
    // State
    formData,
    schoolYears,
    courses,
    students: filteredStudents,
    attendances,
    loading,
    loadingStudents,
    loadingAttendances,
    selectedStudent,
    showAttendanceForm,
    editingAttendance,
    currentSession,
    searchTerm,
    currentUser,
    attendanceForm,
    statusOptions,
    sessionOptions,
    filteredCourses,
    statistics,
    isFormValid,
    
    // Actions
    setFormData,
    setSearchTerm,
    setSelectedStudent,
    setShowAttendanceForm,
    setEditingAttendance,
    setCurrentSession,
    setAttendanceForm,
    
    // Functions
    handleInputChange,
    handleSelectChange,
    handleStudentClick,
    handleAttendanceSubmit,
    handleDeleteAttendance,
    getStudentAttendance,
    getAttendanceStatus,
    getStatusBadge,
    fetchInitialData,
    fetchStudents,
    fetchAttendances
  }
}
