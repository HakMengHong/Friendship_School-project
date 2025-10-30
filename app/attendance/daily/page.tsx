"use client"

// React imports
import { useState, useEffect, useMemo, useCallback } from "react"

// UI Component imports
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Icon imports
import { 
  XCircle, 
  Clock,
  CheckCircle,
  XCircle as XCircleIcon,
  Trash2 as TrashIcon,
  Edit,
  Search,
  Loader2,
  Calendar,
  BookOpen,
  Users,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  UserIcon
} from "lucide-react"

// Hook and service imports
import { toast } from "@/hooks/use-toast"
import { getCurrentUser, User as AuthUser } from "@/lib/auth-service"

// Component imports
import { CustomDatePicker } from "@/components/calendar"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  teacherId1: number | null
  teacherId2: number | null
  teacherId3: number | null
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
  semester: string
}

interface AttendanceFormData {
  studentId: number
  courseId: number
  session: 'AM' | 'PM' | 'FULL'
  status: string
  reason: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DailyAttendancePage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <DailyAttendanceContent />
    </RoleGuard>
  )
}

// ============================================================================
// MAIN CONTENT COMPONENT
// ============================================================================

function DailyAttendanceContent() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    schoolYear: "",
    course: "",
    date: new Date().toISOString().split('T')[0],
    semester: ""
  })

  // Data state
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingAttendances, setLoadingAttendances] = useState(false)

  // UI state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [attendanceToDelete, setAttendanceToDelete] = useState<number | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // User and form state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [attendanceForm, setAttendanceForm] = useState<AttendanceFormData>({
    studentId: 0,
    courseId: 0,
    session: 'AM',
    status: 'absent',
    reason: ''
  })

  // ============================================================================
  // CONSTANTS AND CONFIGURATION
  // ============================================================================
  
  const statusOptions = [
    { 
      value: 'late', 
      label: 'យឺត', 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
    },
    { 
      value: 'excused', 
      label: 'អវត្តមាន(ច្បាប់)', 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
    },
    { 
      value: 'absent', 
      label: 'អវត្តមាន(ឥតច្បាប់)', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
    }
  ]

  const sessionOptions = [
    { value: 'AM', label: 'ពេលព្រឹក' },
    { value: 'PM', label: 'ពេលរសៀល' },
    { value: 'FULL', label: 'ពេញមួយថ្ងៃ' }
  ]

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Load current user on client side
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    console.log('👤 Current user loaded:', { 
      username: user?.username, 
      role: user?.role, 
      id: user?.id
    })
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

  // Auto-select semester based on selected date
  useEffect(() => {
    if (!formData.date || semesters.length === 0) return
    const month = new Date(formData.date).getMonth() + 1
    const targetCode = month >= 9 ? 'S1' : 'S2'
    const sem = semesters.find(s => s.semesterCode === targetCode)
    if (sem && formData.semester !== sem.semesterId.toString()) {
      setFormData(prev => ({ ...prev, semester: sem.semesterId.toString() }))
    }
  }, [formData.date, semesters])


  // Filter students based on search term and sort by Khmer order
  useEffect(() => {
    let result = students;
    
    // Filter by search term
    if (searchTerm) {
      result = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Sort by Khmer alphabetical order
    result = result.sort((a, b) => {
      // Khmer alphabet order: consonants + independent vowels
      const khmerOrder = 'កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអអាឥឦឧឨឩឪឫឬឭឮឯឰឱឲឳ';
      
      const getKhmerSortValue = (char: string): number => {
        const index = khmerOrder.indexOf(char);
        return index === -1 ? 999 : index;
      };
      
      const getSortKey = (text: string): number[] => {
        return Array.from(text).map(char => getKhmerSortValue(char));
      };
      
      // Compare last names first
      const aLastKey = getSortKey(a.lastName || '');
      const bLastKey = getSortKey(b.lastName || '');
      
      for (let i = 0; i < Math.max(aLastKey.length, bLastKey.length); i++) {
        const aVal = aLastKey[i] || 999;
        const bVal = bLastKey[i] || 999;
        if (aVal !== bVal) return aVal - bVal;
      }
      
      // If last names are equal, compare first names
      const aFirstKey = getSortKey(a.firstName || '');
      const bFirstKey = getSortKey(b.firstName || '');
      
      for (let i = 0; i < Math.max(aFirstKey.length, bFirstKey.length); i++) {
        const aVal = aFirstKey[i] || 999;
        const bVal = bFirstKey[i] || 999;
        if (aVal !== bVal) return aVal - bVal;
      }
      
      return 0;
    });
    
    setFilteredStudents(result)
  }, [students, searchTerm])

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================
  
  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [schoolYearsRes, coursesRes, semestersRes] = await Promise.all([
        fetch('/api/school-years'),
        fetch('/api/courses'),
        fetch('/api/semesters')
      ])

      if (!schoolYearsRes.ok || !coursesRes.ok || !semestersRes.ok) {
        throw new Error('Failed to fetch initial data')
      }

      const [schoolYearsData, coursesData, semestersData] = await Promise.all([
        schoolYearsRes.json(),
        coursesRes.json(),
        semestersRes.json()
      ])

      setSchoolYears(schoolYearsData)
      setCourses(coursesData)
      setSemesters(semestersData)
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

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleStudentClick = useCallback((student: Student, session: 'AM' | 'PM' | 'FULL') => {
    setSelectedStudent(student)
    
    // Check if attendance already exists for this specific student, session, course, and date
    const existingAttendance = attendances.find(
      a => a.studentId === student.studentId && 
           a.session === session &&
           a.courseId === parseInt(formData.course) &&
           new Date(a.attendanceDate).toDateString() === new Date(formData.date).toDateString()
    )

    console.log('Looking for existing attendance:', {
      studentId: student.studentId,
      session,
      courseId: parseInt(formData.course),
      date: formData.date,
      found: existingAttendance
    })

    // Only set editingAttendance if we have a real attendance record with a valid ID
    if (existingAttendance && existingAttendance.attendanceId && existingAttendance.attendanceId > 0) {
      console.log('Editing existing attendance:', existingAttendance)
      setEditingAttendance(existingAttendance)
      setAttendanceForm({
        studentId: student.studentId,
        courseId: parseInt(formData.course),
        session: session,
        status: existingAttendance.status,
        reason: existingAttendance.reason || ''
      })
    } else {
      // No attendance record exists, we'll create a new one
      console.log('Creating new attendance record')
      setEditingAttendance(null)
      setAttendanceForm({
        studentId: student.studentId,
        courseId: parseInt(formData.course),
        session: session,
        status: 'absent',
        reason: ''
      })
    }

    setShowAttendanceForm(true)
  }, [attendances, formData.course, formData.date])

  const handleAttendanceSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Determine if we're editing or creating - be more strict about validation
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
          recordedBy: currentUser?.username || 'admin',
          semesterId: formData.semester ? parseInt(formData.semester) : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Attendance API error:', response.status, errorData)
        
        if (response.status === 409) {
          // Conflict - attendance already exists, try to update instead
          console.log('Conflict detected, attempting to find and update existing record')
          
          // Find the existing attendance record
          const existingAttendance = attendances.find(
            a => a.studentId === attendanceForm.studentId && 
                 a.session === attendanceForm.session &&
                 a.courseId === attendanceForm.courseId &&
                 new Date(a.attendanceDate).toDateString() === new Date(formData.date).toDateString()
          )
          
          if (existingAttendance && existingAttendance.attendanceId) {
            console.log('Found existing record, updating instead:', existingAttendance)
            // Retry with PUT method
            const updateResponse = await fetch(`/api/attendance?attendanceId=${existingAttendance.attendanceId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...attendanceForm,
                attendanceDate: formData.date,
                recordedBy: currentUser?.username || 'admin',
                semesterId: formData.semester ? parseInt(formData.semester) : undefined
              })
            })
            
            if (updateResponse.ok) {
              await updateResponse.json()
              toast({
                title: "ជោគជ័យ",
                description: "វត្តមានត្រូវបានកែសម្រួលដោយជោគជ័យ",
              })
              setShowAttendanceForm(false)
              setSelectedStudent(null)
              setEditingAttendance(null)
              fetchAttendances()
              return
            }
          }
        }
        
        throw new Error(`Failed to save attendance: ${response.status} ${errorData.error || ''}`)
      }

      await response.json()

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

  const handleDeleteClick = useCallback((attendanceId: number) => {
    setAttendanceToDelete(attendanceId)
    setShowDeleteDialog(true)
  }, [])

  const handleDeleteAttendance = useCallback(async () => {
    if (!attendanceToDelete) return

    try {
      const response = await fetch(`/api/attendance?attendanceId=${attendanceToDelete}`, {
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
      setShowDeleteDialog(false)
      setAttendanceToDelete(null)
    } catch (error) {
      console.error('Error deleting attendance:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "កំហុស",
        description: `មានបញ្ហាក្នុងការលុបវត្តមាន: ${errorMessage}`,
        variant: "destructive"
      })
    }
  }, [attendanceToDelete, fetchAttendances])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  // Filter courses based on selected school year and teacher role
  const filteredCourses = useMemo(() => {
    let filtered = formData.schoolYear 
      ? courses.filter(course => course.schoolYear.schoolYearId.toString() === formData.schoolYear)
      : courses
    
    // If user is a teacher, only show courses where they are assigned
    if (currentUser && currentUser.role === 'teacher') {
      const teacherId = currentUser.id
      filtered = filtered.filter(course => 
        course.teacherId1 === teacherId || 
        course.teacherId2 === teacherId || 
        course.teacherId3 === teacherId
      )
      
      console.log('👨‍🏫 Teacher filter applied:', {
        teacherId,
        teacherName: `${currentUser.lastname}${currentUser.firstname}`,
        totalCourses: courses.length,
        filteredBySchoolYear: formData.schoolYear ? courses.filter(c => c.schoolYear.schoolYearId.toString() === formData.schoolYear).length : courses.length,
        filteredByTeacher: filtered.length
      })
    }
    
    return filtered
  }, [courses, formData.schoolYear, currentUser])

  // Calculate statistics
  const statistics = useMemo(() => {
    const sessionStats = (session: string) => {
      const sessionAttendances = attendances.filter(a => a.session === session)
      return {
        present: sessionAttendances.filter(a => a.status === 'present').length,
        absent: sessionAttendances.filter(a => a.status === 'absent').length,
        late: sessionAttendances.filter(a => a.status === 'late').length,
        excused: sessionAttendances.filter(a => a.status === 'excused').length,
        total: sessionAttendances.length
      }
    }

    const amStats = sessionStats('AM')
    const pmStats = sessionStats('PM')
    const fullStats = sessionStats('FULL')

    // Add students without attendance records as present by default
    const studentsWithoutAM = students.length - amStats.total
    const studentsWithoutPM = students.length - pmStats.total

    const amPresent = amStats.present + studentsWithoutAM
    const pmPresent = pmStats.present + studentsWithoutPM

    return {
      amPresent, amAbsent: amStats.absent, amLate: amStats.late, amExcused: amStats.excused,
      pmPresent, pmAbsent: pmStats.absent, pmLate: pmStats.late, pmExcused: pmStats.excused,
      fullPresent: fullStats.present, fullAbsent: fullStats.absent, fullLate: fullStats.late, fullExcused: fullStats.excused,
      totalPresent: amPresent + pmPresent + fullStats.present,
      totalAbsent: amStats.absent + pmStats.absent + fullStats.absent,
      totalLate: amStats.late + pmStats.late + fullStats.late,
      totalExcused: amStats.excused + pmStats.excused + fullStats.excused
    }
  }, [attendances, students.length])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  // Get attendance status for a student in a specific session
  const getStudentAttendance = useCallback((studentId: number, session: 'AM' | 'PM' | 'FULL') => {
    return attendances.find(a => 
      a.studentId === studentId && 
      a.session === session &&
      new Date(a.attendanceDate).toDateString() === new Date(formData.date).toDateString()
    )
  }, [attendances, formData.date])

  // Get default attendance status - if no attendance record exists, default to present
  const getAttendanceStatus = useCallback((studentId: number, session: 'AM' | 'PM' | 'FULL') => {
    const attendance = attendances.find(a => 
      a.studentId === studentId && 
      a.session === session &&
      new Date(a.attendanceDate).toDateString() === new Date(formData.date).toDateString()
    )
    return attendance ? attendance.status : 'present'
  }, [attendances, formData.date])

  const getStatusBadge = useCallback((status: string) => {
    // Handle present status separately since it's not in statusOptions
    if (status === 'present') {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">វត្តមាន</Badge>
    }
    
    const statusOption = statusOptions.find(opt => opt.value === status)
    if (!statusOption) return <Badge variant="secondary">មិនច្បាស់</Badge>
    
    return <Badge className={statusOption.color}>{statusOption.label}</Badge>
  }, [])

  // ============================================================================
  // VALIDATION AND FORM LOGIC
  // ============================================================================
  
  const isFormValid = Boolean(formData.schoolYear && formData.course)

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">កំពុងទាញយកទិន្នន័យ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">
        {/* Enhanced Form Section */}
        <div className="relative mb-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/20 rounded-3xl -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />

        <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group">
          {/* Enhanced Header */}
          <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-4">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10 flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                 <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                    ព័ត៌មានមុខងារ
                  </h2>
                <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                <p className="text-white/90 mt-2 text-base md:text-lg">
                  ជ្រើសរើសថ្នាក់ និងកាលបរិច្ឆេទដើម្បីចាប់ផ្តើមកត់ត្រាវត្តមាន
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* School Year Selection */}
              <div className="space-y-3 group">
                <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-blue-600 dark:text-gray-300 transition-colors duration-200">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>ឆ្នាំសិក្សា</span>
                  <span className="text-red-500 text-base">*</span>
                </label>
                <Select 
                  value={formData.schoolYear} 
                  onValueChange={(value) => handleSelectChange('schoolYear', value)}
                >
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

              {/* Semester Selection */}
              <div className="space-y-3 group">
                <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-purple-600 dark:text-gray-300 transition-colors duration-200">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                <span>ឆមាស</span>
                  <span className="text-red-500 text-base">*</span>
              </label>
              <Select
                value={formData.semester}
                onValueChange={(value) => handleSelectChange('semester', value)}
              >
                  <SelectTrigger className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 group-hover:shadow-lg text-purple-600 dark:text-purple-400">
                  <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                  {semesters.map((s) => (
                      <SelectItem key={s.semesterId} value={s.semesterId.toString()} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:bg-purple-100 dark:focus:bg-purple-900/30 focus:text-purple-900 dark:focus:text-purple-100">
                      {s.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              {/* Class Selection */}
              <div className="space-y-3 group">
                <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-green-600 dark:text-gray-300 transition-colors duration-200">
                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>ថ្នាក់</span>
                  <span className="text-red-500 text-base">*</span>
                </label>
                <Select 
                  value={formData.course} 
                  onValueChange={(value) => handleSelectChange('course', value)}
                >
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

               {/* Date Selection */}
               <div className="space-y-3 group">
                 <label className="flex items-center space-x-2 text-sm md:text-base font-semibold text-orange-600 dark:text-gray-300 transition-colors duration-200">
                   <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                     <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                   </div>
                   <span>កាលបរិច្ឆេទ</span>
                   <span className="text-red-500 text-base">*</span>
                 </label>
                 <CustomDatePicker
                   value={formData.date}
                   onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                 />
               </div>
              
              {/* Teacher Display */}
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
            {!isFormValid && (
              <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 via-yellow-50/95 to-amber-50/90 dark:from-amber-900/10 dark:via-yellow-900/15 dark:to-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-amber-800 dark:text-amber-200">
                      សូមបំពេញព័ត៌មានមុខងារ
                    </h3>
                    <p className="text-sm md:text-base text-amber-700 dark:text-amber-300 mt-1">
                      ជ្រើសរើសឆ្នាំសិក្សា ឆមាស និងថ្នាក់ដើម្បីមើលបញ្ជីសិស្ស
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modern Statistics Overview - Only show when form is valid */}
      {isFormValid && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Modern Student List */}
            <div className="relative group">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-purple-50/30 dark:from-purple-950/20 dark:via-pink-950/15 dark:to-purple-950/20 rounded-3xl -z-10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.05),transparent_50%)]" />

              <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
                {/* Modern Header */}
                <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-4">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />

                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div>
                       <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                          បញ្ជីឈ្មោះសិស្ស
                        </h2>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge 
                          variant="secondary" 
                          className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-xs md:text-sm font-medium"
                        >
                          {(() => {
                            const selectedCourse = courses.find(c => c.courseId.toString() === formData.course)
                            return selectedCourse ? `ថ្នាក់ទី ${selectedCourse.grade}${selectedCourse.section}` : ''
                          })()}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-xs md:text-sm font-medium"
                        >
                          {filteredStudents.length} នាក់
                        </Badge>
                      </div>
                      <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                    </div>
                  </div>
                </CardHeader>
                
                {/* Search Bar Section - Separate from header */}
                <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/30 dark:to-pink-900/30 border-b border-purple-200/30 dark:border-purple-700/30">
                  <div className="p-6">
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500 dark:text-purple-400" />
                        <Input
                          placeholder="ស្វែងរកសិស្ស..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-12 w-full bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300 rounded-xl text-sm md:text-base shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-0">
                  {loadingStudents ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                      <p className="text-sm md:text-base text-muted-foreground">
                        កំពុងទាញយក...
                      </p>
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    <div className="relative">
                      {/* Modern Fixed Header */}
                      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-50/98 to-pink-50/98 dark:from-purple-900/98 dark:to-pink-900/98 backdrop-blur-xl border-b-2 border-purple-200/60 dark:border-purple-700/60 shadow-lg">
                        <div className="grid grid-cols-12 gap-4 py-4 px-4">
                          <div className="col-span-12 md:col-span-4">
                            <h3 className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full" />
                              ឈ្មោះសិស្ស
                            </h3>
                          </div>
                          <div className="col-span-6 md:col-span-4 text-center">
                            <h3 className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center justify-center gap-2">
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full" />
                              ពេលព្រឹក
                            </h3>
                          </div>
                          <div className="col-span-6 md:col-span-4 text-center">
                            <h3 className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center justify-center gap-2">
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full" />
                              ពេលរសៀល
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Modern Scrollable Student List - Shows all students */}
                      <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent hover:scrollbar-thumb-purple-400 dark:hover:scrollbar-thumb-purple-500">
                        <div className="divide-y divide-gray-200/50 dark:divide-gray-700/30">
                          {filteredStudents.map((student, index) => {
                            const amAttendance = getStudentAttendance(student.studentId, 'AM')
                            const pmAttendance = getStudentAttendance(student.studentId, 'PM')
                            
                            return (
                              <div 
                                key={student.studentId} 
                                className={`group grid grid-cols-12 gap-4 py-4 px-4 hover:bg-gradient-to-r hover:from-purple-50/60 hover:to-pink-50/60 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 hover:scale-[1.005] hover:shadow-md ${
                                  index % 2 === 0 
                                    ? 'bg-white/40 dark:bg-gray-800/40' 
                                    : 'bg-purple-50/30 dark:bg-purple-900/20'
                                }`}
                              >
                                {/* Modern Student Info */}
                                <div className="col-span-12 md:col-span-4 flex items-center gap-3 md:gap-4">
                                  <div className="relative group/avatar flex-shrink-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm md:text-lg font-bold shadow-lg ring-2 ring-purple-200/50 dark:ring-purple-700/50 group-hover/avatar:scale-110 group-hover/avatar:shadow-xl transition-all duration-300">
                                      {student.photo ? (
                                        <img
                                          src={student.photo}
                                          alt={`${student.firstName} ${student.lastName}`}
                                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover ring-1 ring-white/30"
                                        />
                                      ) : (
                                        student.firstName.charAt(0)
                                      )}
                                    </div>
                                    {/* Student Number Badge */}
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md group-hover/avatar:scale-110 transition-transform duration-300">
                                      {index + 1}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-900 dark:text-white text-sm md:text-base group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300 leading-tight">
                                        {student.lastName} {student.firstName}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mt-1">
                                        ថ្នាក់ទី {(() => {
                                          const enrollment = student.enrollments?.[0]
                                          if (enrollment?.course) {
                                            return `${enrollment.course.grade}${enrollment.course.section}`
                                          }
                                          return 'N/A'
                                        })()}
                                    </div>
                                  </div>
                                </div>

                                {/* Modern Morning Attendance */}
                                <div className="col-span-6 md:col-span-4 flex justify-center">
                                  <div 
                                    className="flex flex-col items-center gap-2 md:gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 group/attendance"
                                    onClick={() => handleStudentClick(student, "AM")}
                                  >
                                    <div className="group-hover/attendance:scale-110 transition-transform duration-300">
                                    {getStatusBadge(getAttendanceStatus(student.studentId, "AM"))}
                                    </div>
                                    {amAttendance?.reason && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400 max-w-16 md:max-w-20 truncate text-center group-hover/attendance:text-blue-600 dark:group-hover/attendance:text-blue-400 transition-colors duration-300">
                                        {amAttendance.reason}
                                      </span>
                                    )}
                                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover/attendance:opacity-100 transition-opacity duration-300" />
                                  </div>
                                </div>

                                {/* Modern Afternoon Attendance */}
                                <div className="col-span-6 md:col-span-4 flex justify-center">
                                  <div 
                                    className="flex flex-col items-center gap-2 md:gap-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/30 p-2 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-700 group/attendance"
                                    onClick={() => handleStudentClick(student, "PM")}
                                  >
                                    <div className="group-hover/attendance:scale-110 transition-transform duration-300">
                                    {getStatusBadge(getAttendanceStatus(student.studentId, "PM"))}
                                    </div>
                                    {pmAttendance?.reason && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400 max-w-16 md:max-w-20 truncate text-center group-hover/attendance:text-orange-600 dark:group-hover/attendance:text-orange-400 transition-colors duration-300">
                                        {pmAttendance.reason}
                                      </span>
                                    )}
                                    <div className="w-1 h-1 bg-orange-400 rounded-full opacity-0 group-hover/attendance:opacity-100 transition-opacity duration-300" />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                        {searchTerm ? "រកមិនឃើញសិស្ស" : "មិនមានសិស្សនៅក្នុងថ្នាក់នេះទេ"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Modern Daily Absences */}
            <div className="relative group">
              

              <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
                {/* Modern Header */}
                <CardHeader className="relative overflow-hidden bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white p-4">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />

                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <XCircle className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                        សិស្សអវត្តមាន
                      </h2>
                      <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                        <p className="text-white/90 mt-2 text-base md:text-lg">
                          បញ្ជីសិស្សអវត្តមានប្រចាំថ្ងៃនេះ
                        </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {loadingAttendances ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                      </div>
                      <p className="text-sm md:text-lg text-muted-foreground">
                        កំពុងទាញយក...
                      </p>
                    </div>
                  ) : attendances.filter(a => a.status !== 'present').length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 py-2 px-2">
                      {attendances
                        .filter(a => a.status !== 'present')
                        .map((attendance, index) => (
                          <div 
                            key={attendance.attendanceId} 
                            className="group/absence bg-gradient-to-r from-red-50 via-red-50/95 to-red-50/90 dark:from-red-900/10 dark:via-red-900/15 dark:to-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-red-300 dark:hover:border-red-700"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center group-hover/absence:scale-110 transition-transform duration-300">
                                    <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {index + 1}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg group-hover/absence:text-red-700 dark:group-hover/absence:text-red-300 transition-colors duration-300">
                                    {attendance.student.firstName} {attendance.student.lastName}
                                  </h4>
                                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 group-hover/absence:text-red-600 dark:group-hover/absence:text-red-400 transition-colors duration-300">
                                    {sessionOptions.find(s => s.value === attendance.session)?.label}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="group-hover/absence:scale-110 transition-transform duration-300">
                                {getStatusBadge(attendance.status)}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStudentClick(attendance.student, attendance.session)}
                                    className="h-10 w-10 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-300 hover:scale-110"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(attendance.attendanceId)}
                                    className="h-10 w-10 p-0 text-red-500 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 text-sm md:text-base">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="font-bold text-gray-900 dark:text-white">ថ្នាក់ទី {attendance.course.grade}{attendance.course.section}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="text-gray-500 dark:text-gray-400 font-medium">ថ្ងៃ:</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {new Date(attendance.attendanceDate).toLocaleDateString('en-GB')}
                                </span>
                              </div>
                            </div>
                            {attendance.reason && (
                              <div className="mt-4 p-4 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                                  <span className="text-gray-600 dark:text-gray-300 font-semibold">មូលហេតុ:</span>
                                </div>
                                <p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{attendance.reason}</p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                        អស្ចារ្យ! 🎉
                      </h3>
                      <p className="text-base md:text-lg text-gray-500 dark:text-gray-400">
                        មិនមានសិស្សអវត្តមាននៅថ្ងៃនេះទេ
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Modern Attendance Form Dialog */}
      <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
        <DialogContent className="max-w-2xl max-h-[95vh] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 overflow-visible">
          {/* Enhanced Modern Header with Gradient Background */}
          <div className="relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white p-8 -m-8 mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            
            <DialogHeader className="relative z-10">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold animate-in slide-in-from-top-2 duration-500">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Edit className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-2xl font-bold mb-1">
                    {editingAttendance ? 'កែសម្រួលវត្តមាន' : 'កត់ត្រាវត្តមាន'}
                  </div>
                  <div className="text-white/90 text-base font-medium">
                    {editingAttendance ? 'កែប្រែព័ត៌មានវត្តមានសិស្ស' : 'បញ្ចូលព័ត៌មានវត្តមានសិស្សថ្មី'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-sm">
                    {new Date().toLocaleDateString('en-GB')}
                  </div>
                  <div className="text-white/60 text-xs">
                    {new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

          {selectedStudent && (
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 overflow-x-visible">
              <form id="attendance-form" onSubmit={handleAttendanceSubmit} className="space-y-6 px-2">
              {/* Enhanced Student Information Card */}
              <div className="bg-gradient-to-r from-gray-50 via-blue-50/50 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/10 rounded-2xl p-6 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left-2 duration-500">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                      {selectedStudent.photo ? (
                        <img
                          src={selectedStudent.photo}
                          alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      ) : (
                        selectedStudent.firstName.charAt(0)
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 dark:text-white text-xl mb-1">
                      {selectedStudent.lastName} {selectedStudent.firstName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      ថ្នាក់ទី {(() => {
                        const enrollment = selectedStudent.enrollments?.[0]
                        if (enrollment?.course) {
                          return `${enrollment.course.grade}${enrollment.course.section}`
                        }
                        return 'N/A'
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-gray-600 dark:text-gray-300">
                      ID: {selectedStudent.studentId}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Date and Session Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-2 duration-500 delay-100">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    កាលបរិច្ឆេទ
                  </Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 w-full bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 justify-start text-left font-medium"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {formData.date ? new Date(formData.date).toLocaleDateString('en-GB') : 'Select Date'}
                          </span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-0 z-[9999]" 
                      align="start"
                      side="bottom"
                      sideOffset={8}
                      avoidCollisions={true}
                      collisionPadding={20}
                    >
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-3">
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, date: e.target.value }))
                              setDatePickerOpen(false)
                            }}
                            className="border-0 bg-transparent text-sm focus:ring-0 focus:ring-offset-0 w-full"
                            autoFocus
                          />
                        </div>
                        <div className="px-3 pb-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            ជ្រើសរើសកាលបរិច្ឆេទថ្មី
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    ពេលវេលា
                  </Label>
                  <Select 
                    value={attendanceForm.session} 
                    onValueChange={(value: 'AM' | 'PM' | 'FULL') => setAttendanceForm(prev => ({ ...prev, session: value }))}
                  >
                    <SelectTrigger className="h-12 bg-gradient-to-r from-background to-background/95 border-2 border-primary/20 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-primary/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-xl">
                      {sessionOptions.map(session => (
                        <SelectItem 
                          key={session.value} 
                          value={session.value}
                          className="rounded-lg hover:bg-primary/5"
                        >
                          {session.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Status Selection with Modern Cards */}
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 delay-200">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  ស្ថានភាពវត្តមាន
                </Label>
                <RadioGroup 
                  value={attendanceForm.status} 
                  onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, status: value }))}
                  className="grid grid-cols-1 gap-4"
                >
                  {statusOptions.map((status, index) => (
                    <div key={status.value} className="relative animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                      <RadioGroupItem 
                        value={status.value} 
                        id={status.value} 
                        className="sr-only"
                      />
                      <Label 
                        htmlFor={status.value}
                        className={`group flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                          attendanceForm.status === status.value
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 shadow-xl ring-2 ring-blue-200 dark:ring-blue-800'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                          attendanceForm.status === status.value
                            ? 'border-blue-500 bg-blue-500 shadow-lg'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                        }`}>
                          {attendanceForm.status === status.value && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full m-0.5 animate-in zoom-in-50 duration-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-base">
                            {status.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {status.value === 'present' && 'សិស្សមានវត្តមាន'}
                            {status.value === 'absent' && 'សិស្សអវត្តមាន'}
                            {status.value === 'late' && 'សិស្សមកយឺតយ៉ាវ'}
                          </div>
                        </div>
                        <div className={`p-2 rounded-xl transition-all duration-200 ${
                          status.value === 'present' ? 'bg-green-100 dark:bg-green-900/30' :
                          status.value === 'absent' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-yellow-100 dark:bg-yellow-900/30'
                        }`}>
                          {status.value === 'present' && (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                          {status.value === 'absent' && (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                          {status.value === 'late' && (
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Enhanced Reason Input */}
              <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-500 delay-300">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  មូលហេតុ (បើមាន)
                </Label>
                <Textarea
                  value={attendanceForm.reason}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="បញ្ចូលមូលហេតុអវត្តមាន ឬការយឺតយ៉ាវ..."
                  rows={4}
                  className="bg-gradient-to-r from-background to-background/95 border-2 border-primary/20 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200 resize-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <span>បញ្ចូលមូលហេតុជាក់ស្តែងសម្រាប់ការអវត្តមាន ឬការយឺតយ៉ាវ</span>
                </div>
              </div>

              </form>
            </div>
          )}
          
          {/* Enhanced Fixed Action Buttons - Always visible */}
          <div className="flex justify-between items-center gap-4 pt-6 border-t-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 px-4 -mx-8 -mb-8 p-8 animate-in slide-in-from-bottom-2 duration-500 delay-400">
            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>ព័ត៌មានវត្តមានត្រូវបានរក្សាទុកដោយសុវត្ថិភាព</span>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAttendanceForm(false)}
                className="px-6 py-3 rounded-xl border-2 border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 font-medium shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  បោះបង់
                </div>
              </Button>
              <Button 
                type="submit" 
                form="attendance-form"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
              >
                <div className="flex items-center gap-2">
                  {editingAttendance ? (
                    <>
                      <Edit className="h-4 w-4" />
                      ធ្វើបច្ចុប្បន្នភាព
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      រក្សាទុក
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl font-bold text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <TrashIcon className="h-6 w-6" />
              </div>
              លុបវត្តមាន
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
              តើអ្នកប្រាកដជាចង់លុបវត្តមាននេះមែនទេ? 
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">
                សកម្មភាពនេះមិនអាចត្រលប់បានទេ។
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false)
                setAttendanceToDelete(null)
              }}
              className="px-6 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:scale-105 font-medium shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                បោះបង់
              </div>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAttendance}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
            >
              <div className="flex items-center gap-2">
                <TrashIcon className="h-4 w-4" />
                លុបវត្តមាន
              </div>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}
