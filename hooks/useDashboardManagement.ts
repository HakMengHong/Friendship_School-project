import { useState, useEffect, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'

// Database interfaces
interface Student {
  studentId: number
  firstName: string
  lastName: string
  class: string
  status: string
}

interface User {
  userId: number
  firstname: string
  lastname: string
  role: string
  status: string
}

interface Course {
  courseId: number
  courseName: string
  grade: string
  section: string
}

interface Attendance {
  attendanceId: number
  status: string
  attendanceDate: string
}

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
  priority: 'high' | 'medium' | 'low'
}

interface OutstandingStudent {
  id: number
  name: string
  grade: string
  achievement: string
  score: string
  subject: string
}

interface RecentActivity {
  id: number
  action: string
  time: string
  type: 'add' | 'edit' | 'create' | 'attendance' | 'announcement'
  user: string
}

export function useDashboardManagement() {
  const { toast } = useToast()
  
  // State for real data
  const [students, setStudents] = useState<Student[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: "1", title: "ការប្រជុំគ្រូ", content: "មានការប្រជុំគ្រូនៅថ្ងៃសៅរ៍នេះ នៅម៉ោង ៨:០០ ព្រឹក", date: "2024-01-15", author: "អ្នកគ្រប់គ្រង", priority: "high" },
    { id: "2", title: "ការប្រឡងឆមាស", content: "ការប្រឡងឆមាសនឹងចាប់ផ្តើមនៅខែក្រោយ សូមគ្រូរៀបចំសិស្ស", date: "2024-01-10", author: "អ្នកគ្រប់គ្រង", priority: "medium" },
    { id: "3", title: "ការប្រកួតអក្សរសាស្ត្រ", content: "នឹងមានការប្រកួតអក្សរសាស្ត្រនៅថ្ងៃពុធ សូមគ្រូជ្រើសរើសសិស្ស", date: "2024-01-08", author: "អ្នកគ្រប់គ្រង", priority: "low" },
  ])

  // State for outstanding students
  const [outstandingStudents] = useState<OutstandingStudent[]>([
    { id: 1, name: "សុខ សំអាង", grade: "ថ្នាក់ទី១២ក", achievement: "ពិន្ទុខ្ពស់បំផុតក្នុងថ្នាក់", score: "A+", subject: "គណិតវិទ្យា" },
    { id: 2, name: "ម៉ៅ សុធារី", grade: "ថ្នាក់ទី១១ខ", achievement: "ឈ្នះការប្រកួតអក្សរសាស្ត្រ", score: "A+", subject: "ភាសាខ្មែរ" },
    { id: 3, name: "វ៉ាន់ សុផល", grade: "ថ្នាក់ទី១០គ", achievement: "សកម្មភាពស្ម័គ្រចិត្តល្អ", score: "A", subject: "វិទ្យាសាស្ត្រ" },
    { id: 4, name: "គឹម សុខា", grade: "ថ្នាក់ទី១២ខ", achievement: "ពិន្ទុល្អក្នុងគ្រប់មុខវិជ្ជា", score: "A", subject: "គ្រប់មុខវិជ្ជា" },
  ])

  // Recent activities
  const [recentActivities] = useState<RecentActivity[]>([
    { id: 1, action: "បានបន្ថែមសិស្សថ្មី", time: "២ នាទីមុន", type: "add", user: "គ្រូ សុខា" },
    { id: 2, action: "បានកែប្រែពិន្ទុ", time: "៥ នាទីមុន", type: "edit", user: "គ្រូ ម៉ៅ" },
    { id: 3, action: "បានបង្កើតថ្នាក់ថ្មី", time: "១០ នាទីមុន", type: "create", user: "អ្នកគ្រប់គ្រង" },
    { id: 4, action: "បានបញ្ចូលអវត្តមាន", time: "១៥ នាទីមុន", type: "attendance", user: "គ្រូ វង្ស" },
    { id: 5, action: "បានបង្កើតដំណឹង", time: "២០ នាទីមុន", type: "announcement", user: "អ្នកគ្រប់គ្រង" },
  ])

  // Announcement form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    author: '',
    date: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

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

  // Learning quality data by month
  const learningQualityData = [
    { month: 'មករា', quality: 75, averageScore: 68, attendance: 92 },
    { month: 'កុម្ភៈ', quality: 82, averageScore: 72, attendance: 89 },
    { month: 'មីនា', quality: 78, averageScore: 70, attendance: 91 },
    { month: 'មេសា', quality: 85, averageScore: 75, attendance: 94 },
    { month: 'ឧសភា', quality: 90, averageScore: 80, attendance: 96 },
    { month: 'មិថុនា', quality: 88, averageScore: 78, attendance: 93 },
  ]

  // Attendance data for pie chart
  const attendanceData = [
    { name: 'មាន', value: 1150, color: '#10b981' },
    { name: 'អវត្តមាន', value: 45, color: '#ef4444' },
    { name: 'យឺតយ៉ាវ', value: 23, color: '#f59e0b' },
    { name: 'ច្បាប់', value: 12, color: '#3b82f6' },
  ]

  // Computed statistics
  const dashboardStats = useMemo(() => {
    const totalStudents = students.length
    const totalUsers = users.length
    const totalCourses = courses.length
    const totalAttendances = attendances.length

    const presentAttendances = attendances.filter(a => a.status === 'PRESENT').length
    const absentAttendances = attendances.filter(a => a.status === 'ABSENT').length
    const lateAttendances = attendances.filter(a => a.status === 'LATE').length
    const excusedAttendances = attendances.filter(a => a.status === 'EXCUSED').length

    const attendanceRate = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 0

    return {
      totalStudents,
      totalUsers,
      totalCourses,
      totalAttendances,
      presentAttendances,
      absentAttendances,
      lateAttendances,
      excusedAttendances,
      attendanceRate
    }
  }, [students, users, courses, attendances])

  // Handle add announcement
  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: "Error",
        description: "សូមបំពេញព័ត៌មានទាំងអស់",
        variant: "destructive"
      })
      return
    }
    
    const announcementToAdd: Announcement = {
      ...newAnnouncement,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    }
    
    setAnnouncements([announcementToAdd, ...announcements])
    
    // Reset form
    setNewAnnouncement({
      title: '',
      content: '',
      author: '',
      date: '',
      priority: 'medium'
    })
    setShowAddForm(false)

    toast({
      title: "Success",
      description: "បានបន្ថែមដំណឹងថ្មី"
    })
  }
  
  // Handle delete announcement
  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id))
    toast({
      title: "Success",
      description: "បានលុបដំណឹង"
    })
  }

  // Fetch data from database
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [studentsRes, usersRes, coursesRes, attendancesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/users'),
        fetch('/api/courses'),
        fetch('/api/attendance?date=' + new Date().toISOString().split('T')[0])
      ])

      // Check responses and parse data
      if (!studentsRes.ok) throw new Error(`Failed to fetch students: ${studentsRes.status}`)
      if (!usersRes.ok) throw new Error(`Failed to fetch users: ${usersRes.status}`)
      if (!coursesRes.ok) throw new Error(`Failed to fetch courses: ${coursesRes.status}`)
      if (!attendancesRes.ok) throw new Error(`Failed to fetch attendances: ${attendancesRes.status}`)

      const [studentsData, usersData, coursesData, attendancesData] = await Promise.all([
        studentsRes.json(),
        usersRes.json(),
        coursesRes.json(),
        attendancesRes.json()
      ])

      setStudents(studentsData)
      setUsers(usersData.users || [])
      setCourses(coursesData)
      setAttendances(attendancesData)

      console.log('✅ Dashboard data loaded successfully')
      console.log('📊 Students:', studentsData?.length || 0)
      console.log('👥 Users:', usersData?.users?.length || 0)
      console.log('📚 Courses:', coursesData?.length || 0)
      console.log('📅 Attendances:', attendancesData?.length || 0)
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data')
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Initialize data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    // State
    students,
    users,
    courses,
    attendances,
    announcements,
    outstandingStudents,
    recentActivities,
    loading,
    error,
    showAddForm,
    newAnnouncement,
    
    // Computed values
    dashboardStats,
    learningQualityData,
    attendanceData,
    
    // Actions
    setShowAddForm,
    setNewAnnouncement,
    
    // Functions
    getGradeLabel,
    handleAddAnnouncement,
    handleDeleteAnnouncement,
    fetchDashboardData
  }
}
