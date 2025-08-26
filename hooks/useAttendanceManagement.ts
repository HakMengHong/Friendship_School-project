import { useState, useEffect, useMemo, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

// Database types
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
  class: string
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

export function useAttendanceManagement() {
  const { toast } = useToast()
  
  // State variables for filtering
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Data states
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAttendances, setLoadingAttendances] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const [schoolYearsRes, coursesRes] = await Promise.all([
        fetch('/api/school-years'),
        fetch('/api/courses')
      ])

      if (!schoolYearsRes.ok || !coursesRes.ok) {
        const errorMessage = `Failed to fetch initial data: ${schoolYearsRes.status} ${schoolYearsRes.statusText}`
        throw new Error(errorMessage)
      }

      const [schoolYearsData, coursesData] = await Promise.all([
        schoolYearsRes.json(),
        coursesRes.json()
      ])

      setSchoolYears(schoolYearsData)
      setCourses(coursesData)
      
      // Set first school year as default if available
      if (schoolYearsData.length > 0) {
        setSelectedSchoolYear(schoolYearsData[0].schoolYearId.toString())
      }
      
      console.log(`✅ Successfully loaded ${schoolYearsData.length} school years and ${coursesData.length} courses`)
      setError(null) // Clear any previous errors
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch initial data')
      // Set empty arrays to prevent undefined errors
      setSchoolYears([])
      setCourses([])
      toast({
        title: "Error",
        description: "Failed to fetch initial data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Fetch attendances
  const fetchAttendances = useCallback(async () => {
    if (!selectedDate) return
    
    try {
      setLoadingAttendances(true)
      const params = new URLSearchParams({
        date: selectedDate
      })
      
      if (selectedCourse) {
        params.append('courseId', selectedCourse)
      }

      if (selectedStatus) {
        params.append('status', selectedStatus)
      }

      const response = await fetch(`/api/attendance?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAttendances(data)
      
      // Show success message if data is fetched
      if (data.length > 0) {
        console.log(`✅ Successfully fetched ${data.length} attendance records`)
      } else {
        console.log('ℹ️ No attendance records found for the selected criteria')
      }
      setError(null) // Clear any previous errors
    } catch (error) {
      console.error('Error fetching attendances:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch attendances')
      // Set empty array to show "no data" state
      setAttendances([])
      toast({
        title: "Error",
        description: "Failed to fetch attendances",
        variant: "destructive"
      })
    } finally {
      setLoadingAttendances(false)
    }
  }, [selectedDate, selectedCourse, selectedStatus, toast])

  // Filter courses based on selected school year
  const filteredCourses = useMemo(() => 
    selectedSchoolYear 
      ? courses.filter(course => course.schoolYear.schoolYearId.toString() === selectedSchoolYear)
      : courses
  , [courses, selectedSchoolYear])

  // Filter attendances based on search term
  const filteredAttendances = useMemo(() => {
    if (!searchTerm) return attendances
    
    return attendances.filter(attendance => 
      attendance.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.student.studentId.toString().includes(searchTerm) ||
      attendance.course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [attendances, searchTerm])

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const total = filteredAttendances.length
    const present = filteredAttendances.filter(a => a.status === 'PRESENT').length
    const absent = filteredAttendances.filter(a => a.status === 'ABSENT').length
    const late = filteredAttendances.filter(a => a.status === 'LATE').length
    const excused = filteredAttendances.filter(a => a.status === 'EXCUSED').length

    return {
      total,
      present,
      absent,
      late,
      excused,
      presentRate: total > 0 ? Math.round((present / total) * 100) : 0,
      absentRate: total > 0 ? Math.round((absent / total) * 100) : 0,
      lateRate: total > 0 ? Math.round((late / total) * 100) : 0,
      excusedRate: total > 0 ? Math.round((excused / total) * 100) : 0
    }
  }, [filteredAttendances])

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'ABSENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'CheckCircle'
      case 'ABSENT':
        return 'XCircle'
      case 'LATE':
        return 'Clock'
      case 'EXCUSED':
        return 'AlertCircle'
      default:
        return 'UserCheck'
    }
  }

  // Handle school year change
  const handleSchoolYearChange = (schoolYearId: string) => {
    setSelectedSchoolYear(schoolYearId)
    setSelectedCourse('') // Reset course selection
  }

  // Handle course change
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
  }

  // Handle status change
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
  }

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  // Handle search change
  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
  }

  // Initialize data on mount
  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // Fetch attendances when filters change
  useEffect(() => {
    if (selectedDate) {
      fetchAttendances()
    }
  }, [selectedDate, selectedCourse, selectedStatus, fetchAttendances])

  return {
    // State
    selectedDate,
    selectedSchoolYear,
    selectedCourse,
    selectedStatus,
    searchTerm,
    schoolYears,
    courses,
    attendances,
    loading,
    loadingAttendances,
    error,
    
    // Computed values
    filteredCourses,
    filteredAttendances,
    attendanceStats,
    
    // Actions
    setSelectedDate,
    setSelectedSchoolYear,
    setSelectedCourse,
    setSelectedStatus,
    setSearchTerm,
    
    // Functions
    getGradeLabel,
    getStatusColor,
    getStatusIcon,
    handleSchoolYearChange,
    handleCourseChange,
    handleStatusChange,
    handleDateChange,
    handleSearchChange,
    fetchInitialData,
    fetchAttendances
  }
}
