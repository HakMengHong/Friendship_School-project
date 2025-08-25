"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  UserCheck,
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
  AlertTriangle
} from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth-service"

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

export default function DailyAttendancePage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <DailyAttendanceContent />
    </RoleGuard>
  )
}

function DailyAttendanceContent() {
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

  // Debug: Log attendances changes
  useEffect(() => {
    console.log('Attendances state changed:', attendances)
  }, [attendances])

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

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [schoolYearsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/school-years'),
        fetch('/api/admin/courses')
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

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true)
      const params = new URLSearchParams({
        courseId: formData.course
      })

      const response = await fetch(`/api/admin/students/enrolled?${params}`)
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

      const response = await fetch(`/api/admin/attendance?${params}`)
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
    setCurrentSession(session)
    
    // Check if attendance already exists
    const existingAttendance = attendances.find(
      a => a.studentId === student.studentId && a.session === session
    )

    console.log('Student clicked:', {
      student: student.studentId,
      session,
      existingAttendance,
      hasAttendanceId: existingAttendance?.attendanceId,
      attendancesCount: attendances.length
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
        reason: existingAttendance.reason || '',
        time: ''
      })
    } else {
      console.log('Creating new attendance record')
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
        ? `/api/admin/attendance?attendanceId=${editingAttendance.attendanceId}`
        : '/api/admin/attendance'

      console.log('Submitting attendance:', {
        method,
        url,
        isEditing,
        editingAttendance,
        editingAttendanceId: editingAttendance?.attendanceId,
        attendanceForm
      })

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
        console.error('Attendance API error:', response.status, errorData)
        throw new Error(`Failed to save attendance: ${response.status} ${errorData.error || ''}`)
      }

      const result = await response.json()
      console.log('Attendance saved successfully:', result)

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

  const handleDeleteAttendance = useCallback(async (attendanceId: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបវត្តមាននេះមែនទេ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/attendance?attendanceId=${attendanceId}`, {
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

  // Filter courses based on selected school year
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
    console.log(`getStudentAttendance for student ${studentId}, session ${session}:`, attendance)
    return attendance
  }, [attendances])

  // Get default attendance status - if no attendance record exists, default to present
  const getAttendanceStatus = useCallback((studentId: number, session: 'AM' | 'PM' | 'FULL') => {
    const attendance = attendances.find(a => a.studentId === studentId && a.session === session)
    const status = attendance ? attendance.status : 'present'
    console.log(`getAttendanceStatus for student ${studentId}, session ${session}: ${status} (attendance: ${attendance?.attendanceId || 'none'})`)
    return status
  }, [attendances])

  const getStatusBadge = useCallback((status: string) => {
    // Handle present status separately since it's not in statusOptions
    if (status === 'present') {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">វត្តមាន</Badge>
    }
    
    const statusOption = statusOptions.find(opt => opt.value === status)
    if (!statusOption) return <Badge variant="secondary">មិនច្បាស់</Badge>
    
    return <Badge className={statusOption.color}>{statusOption.label}</Badge>
  }, [])

  const isFormValid = Boolean(formData.schoolYear && formData.course)

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
                  ការកត់ត្រាវត្តមានប្រចាំថ្ងៃ
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  ប្រព័ន្ធគ្រប់គ្រងការកត់ត្រាវត្តមានសិស្សប្រចាំថ្ងៃ និងពេលវេលារៀន
                </p>
              </div>
              
              {/* Quick Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <CalendarDays className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {formData.date ? new Date(formData.date).toLocaleDateString('km-KH') : 'ថ្ងៃនេះ'}
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-300 font-medium">កាលបរិច្ឆេទ</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {formData.course ? courses.find(c => c.courseId.toString() === formData.course)?.courseName || 'ថ្នាក់' : 'ថ្នាក់'}
                        </p>
                        <p className="text-xs text-purple-500 dark:text-purple-300 font-medium">ថ្នាក់រៀន</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {students.length}
                        </p>
                        <p className="text-xs text-green-500 dark:text-green-300 font-medium">សិស្សសរុប</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form Section */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-indigo-50/20 to-blue-50/20 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-blue-950/10 rounded-3xl -z-10" />

            <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
              {/* Enhanced Header */}
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-6">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

                <div className="relative z-10 flex items-center space-x-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">ព័ត៌មានមុខងារ</h2>
                    <div className="h-1 w-8 bg-white/30 rounded-full mt-2" />
                  </div>
                </div>
        </CardHeader>
              <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា *</Label>
              <Select value={formData.schoolYear} onValueChange={(value) => handleSelectChange('schoolYear', value)}>
                      <SelectTrigger className="h-11 bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200">
                  <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
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
            <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">ថ្នាក់ *</Label>
              <Select value={formData.course} onValueChange={(value) => handleSelectChange('course', value)}>
                      <SelectTrigger className="h-11 bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200">
                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
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
            <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">កាលបរិច្ឆេទ</Label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                      className="h-11 bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200"
              />
            </div>
                         <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">ឈ្មោះគ្រូ</Label>
                    <div className="h-11 px-3 py-2 bg-gradient-to-r from-gray-50 via-gray-50/95 to-gray-50/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border border-gray-200 dark:border-gray-600 rounded-md flex items-center">
                 <span className="text-gray-900 dark:text-white font-medium">
                   {currentUser ? `${currentUser.lastname || ''}${currentUser.firstname || ''}` : 'កំពុងទាញយក...'}
                 </span>
               </div>
            </div>
          </div>
          {!isFormValid && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 via-yellow-50/95 to-yellow-50/90 dark:from-yellow-900/10 dark:via-yellow-900/15 dark:to-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  សូមបំពេញព័ត៌មានមុខងារទាំងអស់ដើម្បីមើលបញ្ជីសិស្ស
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
          </div>

          {/* Enhanced Statistics Cards - Only show when form is valid */}
      {isFormValid && (
        <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Morning Summary */}
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <Clock className="h-6 w-6 text-white" />
                </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {statistics.amPresent + statistics.amAbsent + statistics.amLate + statistics.amExcused} នាក់
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-300 font-medium">ពេលព្រឹក</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">វត្តមាន:</span>
                        <span className="font-medium text-green-600">{statistics.amPresent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">អវត្តមាន:</span>
                        <span className="font-medium text-red-600">{statistics.amAbsent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">យឺត:</span>
                        <span className="font-medium text-yellow-600">{statistics.amLate}</span>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 mt-4" />
                  </div>
                </div>

            {/* Afternoon Summary */}
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                        <Clock className="h-6 w-6 text-white" />
                </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {statistics.pmPresent + statistics.pmAbsent + statistics.pmLate + statistics.pmExcused} នាក់
                        </p>
                        <p className="text-xs text-orange-500 dark:text-orange-300 font-medium">ពេលរសៀល</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">វត្តមាន:</span>
                        <span className="font-medium text-green-600">{statistics.pmPresent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">អវត្តមាន:</span>
                        <span className="font-medium text-red-600">{statistics.pmAbsent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">យឺត:</span>
                        <span className="font-medium text-yellow-600">{statistics.pmLate}</span>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 mt-4" />
                  </div>
                </div>

            {/* Total Present */}
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {statistics.totalPresent} នាក់
                        </p>
                        <p className="text-xs text-green-500 dark:text-green-300 font-medium">សរុបវត្តមាន</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">ភាគរយ:</span>
                        <span className="font-medium text-green-600">
                          {students.length > 0 ? ((statistics.totalPresent / students.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">ពីពេលព្រឹក:</span>
                        <span className="font-medium text-blue-600">+{statistics.amPresent}</span>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 mt-4" />
                  </div>
                </div>

            {/* Total Absent */}
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                        <XCircleIcon className="h-6 w-6 text-white" />
                </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {statistics.totalAbsent} នាក់
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-300 font-medium">សរុបអវត្តមាន</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">ភាគរយ:</span>
                        <span className="font-medium text-red-600">
                          {students.length > 0 ? ((statistics.totalAbsent / students.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">ពីពេលព្រឹក:</span>
                        <span className="font-medium text-orange-600">+{statistics.amAbsent}</span>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 mt-4" />
                  </div>
                </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enhanced Student List */}
                  <div className="relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-pink-50/20 to-purple-50/20 dark:from-purple-950/10 dark:via-pink-950/10 dark:to-purple-950/10 rounded-3xl -z-10" />

                  <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
                    {/* Enhanced Header */}
                    <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-6">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10" />

                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white">បញ្ជីឈ្មោះសិស្ស</h2>
                            <div className="flex items-center space-x-3 mt-2">
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                {courses.find(c => c.courseId.toString() === formData.course)?.courseName || ''}
                              </Badge>
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                {filteredStudents.length} នាក់
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                    <Input
                      placeholder="ស្វែងរកសិស្ស..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 w-64 bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                    />
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">ឈ្មោះសិស្ស</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">ពេលព្រឹក</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">ពេលរសៀល</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => {
                          const amAttendance = getStudentAttendance(student.studentId, 'AM')
                          const pmAttendance = getStudentAttendance(student.studentId, 'PM')
                          
                          return (
                            <tr 
                              key={student.studentId} 
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {student.photo ? (
                                      <img
                                        src={student.photo}
                                        alt={`${student.firstName} ${student.lastName}`}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      student.firstName.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white text-sm">{student.firstName} {student.lastName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">ថ្នាក់ទី {student.class}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div 
                                className="flex flex-col items-center gap-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 p-2 rounded-lg transition-colors"
                                   onClick={() => handleStudentClick(student, "AM")}
                                 >
                                   {getStatusBadge(getAttendanceStatus(student.studentId, "AM"))}
                                   {amAttendance?.reason && (
                                     <span className="text-xs text-gray-500 dark:text-gray-400 max-w-20 truncate">{amAttendance.reason}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div 
                                className="flex flex-col items-center gap-1 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 p-2 rounded-lg transition-colors"
                                   onClick={() => handleStudentClick(student, "PM")}
                                 >
                                   {getStatusBadge(getAttendanceStatus(student.studentId, "PM"))}
                                   {pmAttendance?.reason && (
                                     <span className="text-xs text-gray-500 dark:text-gray-400 max-w-20 truncate">{pmAttendance.reason}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? "រកមិនឃើញសិស្ស" : "មិនមានសិស្សនៅក្នុងថ្នាក់នេះទេ"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
                </div>

                {/* Enhanced Daily Absences */}
                <div className="relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-pink-50/20 to-red-50/20 dark:from-red-950/10 dark:via-pink-950/10 dark:to-red-950/10 rounded-3xl -z-10" />

                  <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
                    {/* Enhanced Header */}
                    <CardHeader className="relative overflow-hidden bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white p-6">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

                      <div className="relative z-10 flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                          <XCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">ឈ្មោះសិស្សអវត្តមានប្រចាំថ្ងៃ</h2>
                          <div className="h-1 w-8 bg-white/30 rounded-full mt-2" />
                        </div>
                      </div>
              </CardHeader>
                    <CardContent className="p-6">
                {loadingAttendances ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">កំពុងទាញយក...</p>
                  </div>
                                 ) : attendances.filter(a => a.status !== 'present').length > 0 ? (
                  <div className="space-y-3">
                                         {attendances
                       .filter(a => a.status !== 'present')
                       .map((attendance) => (
                              <div key={attendance.attendanceId} className="bg-gradient-to-r from-red-50 via-red-50/95 to-red-50/90 dark:from-red-900/10 dark:via-red-900/15 dark:to-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                              <XCircleIcon className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {attendance.student.firstName} {attendance.student.lastName}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {sessionOptions.find(s => s.value === attendance.session)?.label}
                                </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                              {getStatusBadge(attendance.status)}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                  onClick={() => handleStudentClick(attendance.student, attendance.session)}
                                        className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                  onClick={() => handleDeleteAttendance(attendance.attendanceId)}
                                        className="h-8 w-8 p-0 text-white hover:text-red-200 hover:bg-white/20"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <span className="text-gray-500 dark:text-gray-400">ថ្នាក់:</span>
                              <span className="ml-2 font-medium">{attendance.course.courseName}</span>
                          </div>
                          <div>
                              <span className="text-gray-500 dark:text-gray-400">ថ្ងៃ:</span>
                              <span className="ml-2 font-medium">{new Date(attendance.attendanceDate).toLocaleDateString('km-KH')}</span>
                          </div>
                        </div>
                          {attendance.reason && (
                          <div className="mt-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">មូលហេតុ:</span>
                              <p className="text-sm font-medium mt-1">{attendance.reason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                                 ) : (
                   <div className="text-center py-8">
                     <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                     <p className="text-gray-500 dark:text-gray-400">មិនមានសិស្សអវត្តមាននៅថ្ងៃនេះទេ</p>
                   </div>
                 )}
              </CardContent>
            </Card>
                </div>
          </div>
        </>
      )}

          {/* Enhanced Attendance Form Dialog */}
      <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
            <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
              <Edit className="h-5 w-5 text-blue-600" />
              {editingAttendance ? 'កែសម្រួលវត្តមាន' : 'កត់ត្រាវត្តមាន'}
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>ឈ្មោះសិស្ស</Label>
                <Input
                  value={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                  readOnly
                      className="bg-gradient-to-r from-gray-50 via-gray-50/95 to-gray-50/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-gray-200 dark:border-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>កាលបរិច្ឆេទ</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    readOnly
                        className="bg-gradient-to-r from-gray-50 via-gray-50/95 to-gray-50/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ពេលវេលា</Label>
                  <Select 
                    value={attendanceForm.session} 
                    onValueChange={(value: 'AM' | 'PM' | 'FULL') => setAttendanceForm(prev => ({ ...prev, session: value }))}
                  >
                        <SelectTrigger className="bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionOptions.map(session => (
                        <SelectItem key={session.value} value={session.value}>
                          {session.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ស្ថានភាព</Label>
                <RadioGroup 
                  value={attendanceForm.status} 
                  onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, status: value }))}
                >
                  {statusOptions.map(status => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={status.value} id={status.value} />
                      <Label htmlFor={status.value}>{status.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>មូលហេតុ (បើមាន)</Label>
                <Textarea
                  value={attendanceForm.reason}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="បញ្ចូលមូលហេតុ..."
                  rows={3}
                      className="bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAttendanceForm(false)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  បោះបង់
                </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  {editingAttendance ? 'ធ្វើបច្ចុប្បន្នភាព' : 'រក្សាទុក'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  )
}
