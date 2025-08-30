"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
  School,
  GraduationCap,
  BookOpen,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Clock3,
  CalendarDays,
  UserCheck
} from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleGuard } from "@/components/ui/role-guard"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-service"

interface Student {
  studentId: number
  firstName: string
  lastName: string
  gender: string
  dob: string | Date
  class: string
  photo?: string
  phone?: string
  registrationDate?: string | Date
  status?: string
  religion?: string
  health?: string
  emergencyContact?: string
  createdAt: string | Date
  updatedAt: string | Date
  classId?: number
  needsClothes?: boolean
  needsMaterials?: boolean
  needsTransport?: boolean
  previousSchool?: string
  registerToStudy?: boolean
  studentBirthDistrict?: string
  studentDistrict?: string
  studentHouseNumber?: string
  studentProvince?: string
  studentVillage?: string
  transferReason?: string
  vaccinated?: boolean
  schoolYear?: string
}

interface Attendance {
  attendanceId: number
  studentId: number
  courseId: number
  date: string
  status: string
  remarks?: string
  createdAt: string
  updatedAt: string
  student?: Student
  course?: {
    courseId: number
    courseName: string
    grade: string
    section: string
  }
}

interface Course {
  courseId: number
  courseName: string
  grade: string
  section: string
  schoolYear: {
    schoolYearId: number
    schoolYearCode: string
  }
}

interface Session {
  sessionId: number
  sessionName: string
  startTime: string
  endTime: string
}

export default function AttendanceDailyPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <AttendanceDailyContent />
    </RoleGuard>
  )
}

function AttendanceDailyContent() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editAttendance, setEditAttendance] = useState<Attendance | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Status options for attendance
  const statusOptions = [
    { value: 'present', label: 'មានវត្តមាន', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    { value: 'absent', label: 'អវត្តមាន', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    { value: 'late', label: 'មកយឺត', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { value: 'excused', label: 'មានអធិការដីកា', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    { value: 'sick', label: 'ឈឺ', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' }
  ]

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      if (res.ok) {
        setStudents(data.students || [])
      } else {
        console.error('Error fetching students:', data.error)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }, [])

  // Fetch attendances
  const fetchAttendances = useCallback(async () => {
    if (!selectedCourse || !selectedDate) return

    try {
      const params = new URLSearchParams({
        courseId: selectedCourse,
        date: selectedDate
      })
      if (selectedSession) {
        params.append('sessionId', selectedSession)
      }

      const res = await fetch(`/api/attendance?${params}`)
      const data = await res.json()
      if (res.ok) {
        setAttendances(data.attendances || [])
      } else {
        console.error('Error fetching attendances:', data.error)
      }
    } catch (error) {
      console.error('Error fetching attendances:', error)
    }
  }, [selectedCourse, selectedDate, selectedSession])

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      if (res.ok) {
        setCourses(data.courses || [])
      } else {
        console.error('Error fetching courses:', data.error)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }, [])

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions')
      const data = await res.json()
      if (res.ok) {
        setSessions(data.sessions || [])
      } else {
        console.error('Error fetching sessions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }, [])

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([
        fetchStudents(),
        fetchCourses(),
        fetchSessions()
      ])
      setLoading(false)
    }
    initializeData()
  }, [fetchStudents, fetchCourses, fetchSessions])

  // Fetch attendances when filters change
  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchAttendances()
    }
  }, [selectedCourse, selectedDate, selectedSession, fetchAttendances])

  // Set current session based on time
  useEffect(() => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const currentSession = sessions.find(session => {
      const [startHour, startMin] = session.startTime.split(':').map(Number)
      const [endHour, endMin] = session.endTime.split(':').map(Number)
      const sessionStart = startHour * 60 + startMin
      const sessionEnd = endHour * 60 + endMin
      
      return currentTime >= sessionStart && currentTime <= sessionEnd
    })
    
    setCurrentSession(currentSession || null)
  }, [sessions])

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    let filtered = students

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const attendanceMap = new Map(attendances.map(a => [a.studentId, a.status]))
      filtered = filtered.filter(student => {
        const status = attendanceMap.get(student.studentId)
        return status === statusFilter
      })
    }

    return filtered
  }, [students, searchTerm, statusFilter, attendances])

  // Get attendance status for a student
  const getAttendanceStatus = (studentId: number): string => {
    const attendance = attendances.find(a => a.studentId === studentId)
    return attendance?.status || 'not-marked'
  }

  // Get attendance remarks for a student
  const getAttendanceRemarks = (studentId: number): string => {
    const attendance = attendances.find(a => a.studentId === studentId)
    return attendance?.remarks || ''
  }

  // Mark attendance for a student
  const markAttendance = useCallback(async (studentId: number, status: string, remarks?: string) => {
    if (!selectedCourse || !selectedDate) return

    setSubmitting(true)
    try {
      const body: {
        studentId: number
        courseId: number
        date: string
        status: string
        remarks?: string
        sessionId?: number
      } = {
        studentId,
        courseId: parseInt(selectedCourse),
        date: selectedDate,
        status,
        remarks
      }

      if (selectedSession) {
        body.sessionId = parseInt(selectedSession)
      }

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (res.ok) {
        toast({
          title: 'បានចុះវត្តមានជោគជ័យ',
          description: `បានចុះវត្តមានសម្រាប់ ${data.attendance.student?.firstName} ${data.attendance.student?.lastName}`,
        })
        fetchAttendances()
      } else {
        toast({
          title: 'បរាជ័យ',
          description: data.error || 'មានបញ្ហាក្នុងការចុះវត្តមាន',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast({
        title: 'បរាជ័យ',
        description: 'មានបញ្ហាក្នុងការចុះវត្តមាន',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }, [selectedCourse, selectedDate, selectedSession, fetchAttendances, toast])

  // Update attendance
  const updateAttendance = useCallback(async (attendanceId: number, status: string, remarks?: string) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks })
      })

      const data = await res.json()
      if (res.ok) {
        toast({
          title: 'បានកែប្រែវត្តមានជោគជ័យ',
          description: `បានកែប្រែវត្តមានសម្រាប់ ${data.attendance.student?.firstName} ${data.attendance.student?.lastName}`,
        })
        setEditDialogOpen(false)
        setEditAttendance(null)
        fetchAttendances()
      } else {
        toast({
          title: 'បរាជ័យ',
          description: data.error || 'មានបញ្ហាក្នុងការកែប្រែវត្តមាន',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
      toast({
        title: 'បរាជ័យ',
        description: 'មានបញ្ហាក្នុងការកែប្រែវត្តមាន',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }, [fetchAttendances, toast])

  // Bulk mark attendance
  const bulkMarkAttendance = useCallback(async (status: string) => {
    if (!selectedCourse || !selectedDate) return

    setSubmitting(true)
    try {
      const promises = filteredStudents.map(student => 
        markAttendance(student.studentId, status)
      )
      await Promise.all(promises)
      
      toast({
        title: 'បានចុះវត្តមានជោគជ័យ',
        description: `បានចុះវត្តមានសម្រាប់សិស្ស ${filteredStudents.length} នាក់`,
      })
    } catch (error) {
      console.error('Error bulk marking attendance:', error)
      toast({
        title: 'បរាជ័យ',
        description: 'មានបញ្ហាក្នុងការចុះវត្តមាន',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }, [filteredStudents, selectedCourse, selectedDate, markAttendance, toast])

  // Get status color
  const getStatusColor = (status: string): string => {
    const option = statusOptions.find(opt => opt.value === status)
    return option?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  // Get status label
  const getStatusLabel = (status: string): string => {
    const option = statusOptions.find(opt => opt.value === status)
    return option?.label || status
  }

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const total = filteredStudents.length
    const present = attendances.filter(a => a.status === 'present').length
    const absent = attendances.filter(a => a.status === 'absent').length
    const late = attendances.filter(a => a.status === 'late').length
    const excused = attendances.filter(a => a.status === 'excused').length
    const sick = attendances.filter(a => a.status === 'sick').length
    const notMarked = total - (present + absent + late + excused + sick)

    return {
      total,
      present,
      absent,
      late,
      excused,
      sick,
      notMarked,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0
    }
  }, [filteredStudents, attendances])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ចុះវត្តមានប្រចាំថ្ងៃ</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            ចុះវត្តមានសិស្សប្រចាំថ្ងៃ និងតាមថ្នាក់រៀន
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>តម្រង</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              fetchAttendances()
            }}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>ធ្វើបច្ចុប្បន្នភាព</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">តម្រងវត្តមាន</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Course Filter */}
              <div>
                <Label htmlFor="course-filter">ថ្នាក់រៀន</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសថ្នាក់រៀន" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId.toString()}>
                        {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div>
                <Label htmlFor="date-filter">ថ្ងៃខែ</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Session Filter */}
              <div>
                <Label htmlFor="session-filter">វគ្គរៀន</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសវគ្គរៀន" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ទាំងអស់</SelectItem>
                    {sessions.map((session) => (
                      <SelectItem key={session.sessionId} value={session.sessionId.toString()}>
                        {session.sessionName} ({session.startTime} - {session.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label htmlFor="status-filter">ស្ថានភាព</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ទាំងអស់</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ស្វែងរកសិស្ស..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button
          onClick={() => bulkMarkAttendance('present')}
          disabled={submitting || filteredStudents.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          ចុះមានវត្តមានទាំងអស់
        </Button>
      </div>

      {/* Statistics */}
      {selectedCourse && selectedDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">សរុបសិស្ស</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.total}</div>
              <p className="text-xs text-muted-foreground">
                សិស្សទាំងអស់ក្នុងថ្នាក់
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">មានវត្តមាន</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
              <p className="text-xs text-muted-foreground">
                {attendanceStats.presentPercentage}% នៃសិស្សទាំងអស់
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">អវត្តមាន</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
              <p className="text-xs text-muted-foreground">
                សិស្សដែលអវត្តមាន
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">មកយឺត</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
              <p className="text-xs text-muted-foreground">
                សិស្សដែលមកយឺត
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Session Alert */}
      {currentSession && (
        <Alert>
          <Clock3 className="h-4 w-4" />
          <AlertDescription>
            វគ្គរៀនបច្ចុប្បន្ន: <strong>{currentSession.sessionName}</strong> 
            ({currentSession.startTime} - {currentSession.endTime})
          </AlertDescription>
        </Alert>
      )}

      {/* Students Table */}
      {selectedCourse && selectedDate ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">បញ្ជីសិស្ស</h3>
                <p className="text-sm text-muted-foreground">
                  ចុះវត្តមានសម្រាប់ថ្ងៃ {format(new Date(selectedDate), 'dd/MM/yyyy')}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {attendanceStats.total} សិស្ស
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {attendanceStats.present} មានវត្តមាន
                </Badge>
                <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {attendanceStats.absent} អវត្តមាន
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  គ្មានសិស្សទេ
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  សូមជ្រើសរើសថ្នាក់រៀនផ្សេង ឬថ្ងៃខែផ្សេង
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => {
                  const status = getAttendanceStatus(student.studentId)
                  const remarks = getAttendanceRemarks(student.studentId)
                  
                  return (
                    <div
                      key={student.studentId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.photo} alt={student.firstName} />
                          <AvatarFallback>
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ថ្នាក់ទី {student.class}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Status Badge */}
                        <Badge className={getStatusColor(status)}>
                          {getStatusLabel(status)}
                        </Badge>

                        {/* Action Buttons */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {statusOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() => markAttendance(student.studentId, option.value)}
                                disabled={submitting}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${option.value === 'present' ? 'bg-green-500' : option.value === 'absent' ? 'bg-red-500' : option.value === 'late' ? 'bg-yellow-500' : option.value === 'excused' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                                  <span>{option.label}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              onClick={() => {
                                setEditAttendance({
                                  attendanceId: attendances.find(a => a.studentId === student.studentId)?.attendanceId || 0,
                                  studentId: student.studentId,
                                  courseId: parseInt(selectedCourse),
                                  date: selectedDate,
                                  status: status,
                                  remarks: remarks,
                                  createdAt: '',
                                  updatedAt: '',
                                  student: student
                                })
                                setEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              កែប្រែ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ជ្រើសរើសថ្នាក់រៀន និងថ្ងៃខែ
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              សូមជ្រើសរើសថ្នាក់រៀន និងថ្ងៃខែដើម្បីចុះវត្តមាន
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Attendance Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>កែប្រែវត្តមាន</DialogTitle>
            <DialogDescription>
              កែប្រែស្ថានភាពវត្តមាន និងចំណាំសម្រាប់សិស្ស
            </DialogDescription>
          </DialogHeader>
          
          {editAttendance && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">ស្ថានភាព</Label>
                <Select
                  value={editAttendance.status}
                  onValueChange={(value) => setEditAttendance({ ...editAttendance, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="remarks">ចំណាំ</Label>
                <Textarea
                  id="remarks"
                  value={editAttendance.remarks || ''}
                  onChange={(e) => setEditAttendance({ ...editAttendance, remarks: e.target.value })}
                  placeholder="បញ្ជូលចំណាំ (ស្រេចចិត្ត)"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">បោះបង់</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (editAttendance) {
                  updateAttendance(editAttendance.attendanceId, editAttendance.status, editAttendance.remarks)
                }
              }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : (
                'រក្សាទុក'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
