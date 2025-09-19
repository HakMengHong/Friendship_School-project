"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, User, Users, GraduationCap, Loader2, BookOpen, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

interface Student {
  studentId: number
  firstName: string
  lastName: string
  class: string
  gender: string
  phone?: string
  schoolYear?: string
}

interface Teacher {
  userid: number
  firstname: string
  lastname: string
  username: string
  role: string
  position?: string
  phonenumber1?: string
}

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

interface Enrollment {
  studentId: number
  courseId: number
  drop: boolean
}

export default function IDCardsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateType, setGenerateType] = useState<'students' | 'teachers'>('students')
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [availableGrades, setAvailableGrades] = useState<string[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  
  // Individual loading states for each button
  const [loadingStates, setLoadingStates] = useState({
    studentCard: false,
    teacherCard: false,
    bulkStudents: false,
    allStudentsInCourse: false,
    allStudentsBack: false,
    classIDCards: false
  })
  
  // Popup states
  const [showTeacherConfirmDialog, setShowTeacherConfirmDialog] = useState(false)
  const [teacherConfirmData, setTeacherConfirmData] = useState<{
    count: number
    teachers: Teacher[]
  } | null>(null)
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([])
  
  const { toast } = useToast()

  // Handle teacher selection
  const handleTeacherSelection = (teacherId: number, checked: boolean) => {
    if (checked) {
      setSelectedTeachers(prev => [...prev, teacherId])
    } else {
      setSelectedTeachers(prev => prev.filter(id => id !== teacherId))
    }
  }

  // Select all teachers
  const selectAllTeachers = () => {
    if (teacherConfirmData?.teachers) {
      setSelectedTeachers(teacherConfirmData.teachers.map(teacher => teacher.userid))
    }
  }

  // Deselect all teachers
  const deselectAllTeachers = () => {
    setSelectedTeachers([])
  }

  // Data fetching functions
  const fetchData = useCallback(async (endpoint: string) => {
    try {
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        // Handle users API which returns { users: [...] }
        if (endpoint === '/api/users' && data.users) {
          return data.users
        }
        return Array.isArray(data) ? data : []
      }
      console.error(`Failed to fetch ${endpoint}:`, response.status)
      return []
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      return []
    }
  }, [])

  // Fetch all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      const [schoolYearsData, coursesData, enrollmentsData, studentsData, teachersData] = await Promise.all([
        fetchData('/api/school-years'),
        fetchData('/api/courses'),
        fetchData('/api/enrollments'),
        fetchData('/api/students'),
        fetchData('/api/users')
      ])

      setSchoolYears(schoolYearsData as SchoolYear[])
      setCourses(coursesData as Course[])
      setEnrollments(enrollmentsData as Enrollment[])
      setStudents(studentsData as Student[])
      setTeachers(teachersData as Teacher[])

      // Extract unique grades from students
      const grades = [...new Set(studentsData.map((s: Student) => s.class))].sort() as string[]
      setAvailableGrades(grades)
    }

    loadAllData()
  }, [fetchData])

  // Memoized filtered data
  const filteredCourses = useMemo(() => 
    courses.filter(course => 
      !selectedSchoolYear || course.schoolYear.schoolYearCode === selectedSchoolYear
    ), [courses, selectedSchoolYear]
  )

  const filteredEnrollments = useMemo(() => 
    enrollments.filter(enrollment => {
      if (!selectedCourse || selectedCourse === 'all') return true
      return enrollment.courseId === parseInt(selectedCourse) && !enrollment.drop
    }), [enrollments, selectedCourse]
  )

  // Helper functions
  const getCourseName = useCallback((courseId: number) => {
    const course = courses.find(c => c.courseId === courseId)
    return course ? `ថ្នាក់ទី ${course.grade}${course.section}` : 'មិនដឹង'
  }, [courses])

  const getSelectedCourseDetails = useCallback(() => {
    if (!selectedCourse || selectedCourse === 'all') return null
    return courses.find(c => c.courseId === parseInt(selectedCourse))
  }, [courses, selectedCourse])

  // Memoized filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const lowerSearchTerm = searchTerm.toLowerCase()
      const matchesSearch = 
        student.firstName.toLowerCase().includes(lowerSearchTerm) ||
        student.lastName.toLowerCase().includes(lowerSearchTerm) ||
        (student.class && student.class.toLowerCase().includes(lowerSearchTerm))
      
      const matchesSchoolYear = !selectedSchoolYear || student.schoolYear === selectedSchoolYear
      
      if (selectedCourse && selectedCourse !== 'all') {
        const isEnrolled = filteredEnrollments.some(enrollment => 
          enrollment.studentId === student.studentId
        )
        return matchesSearch && matchesSchoolYear && isEnrolled
      }
      
      return matchesSearch && matchesSchoolYear
    })
  }, [students, searchTerm, selectedSchoolYear, selectedCourse, filteredEnrollments])

  // Selection management functions
  const toggleStudentSelection = useCallback((studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }, [])

  const toggleTeacherSelection = useCallback((userId: number) => {
    setSelectedTeachers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }, [])

  const selectAllStudents = useCallback(() => {
    setSelectedStudents(filteredStudents.map(s => s.studentId))
  }, [filteredStudents])


  const clearStudentSelection = useCallback(() => {
    setSelectedStudents([])
  }, [])

  const clearTeacherSelection = useCallback(() => {
    setSelectedTeachers([])
  }, [])

  // Handler functions
  const handleSchoolYearChange = useCallback((value: string) => {
    setSelectedSchoolYear(value)
    setSelectedCourse('all') // Reset course selection when school year changes
  }, [])

  const handleCourseChange = useCallback((value: string) => {
    setSelectedCourse(value)
  }, [])

  // Memoized filtered teachers
  const filteredTeachers = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    return teachers.filter(teacher => 
      teacher.firstname.toLowerCase().includes(lowerSearchTerm) ||
      teacher.lastname.toLowerCase().includes(lowerSearchTerm) ||
      teacher.username.toLowerCase().includes(lowerSearchTerm)
    )
  }, [teachers, searchTerm])

  // PDF generation helper with specific loading state
  const generatePDF = useCallback(async (requestBody: any, filename: string, successMessage: string, errorMessage: string, loadingKey: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }))
    try {
      const response = await fetch('/api/pdf-generate/generate-id-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "ជោគជ័យ",
          description: successMessage,
          variant: "default",
        })
      } else {
        const error = await response.json()
        toast({
          title: "កំហុស",
          description: error.error || errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "កំហុស",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }))
    }
  }, [toast])

  // Generate student ID card
  const generateStudentIDCard = useCallback(async (studentId: number) => {
    await generatePDF(
      { type: 'student', variant: 'single', studentIds: [studentId] },
      `student-id-card-${studentId}.pdf`,
      "ប័ណ្ណសម្គាល់សិស្សត្រូវបានបង្កើតដោយជោគជ័យ!",
      "មិនអាចបង្កើតប័ណ្ណសម្គាល់សិស្សបាន",
      'studentCard'
    )
  }, [generatePDF])

  // Generate teacher ID card
  const generateTeacherIDCard = useCallback(async (userId: number) => {
    await generatePDF(
      { type: 'teacher', variant: 'single', userIds: [userId] },
      `teacher-id-card-${userId}.pdf`,
      "ប័ណ្ណសម្គាល់គ្រូបង្រៀនត្រូវបានបង្កើតដោយជោគជ័យ!",
      "មិនអាចបង្កើតប័ណ្ណសម្គាល់គ្រូបង្រៀនបាន",
      'teacherCard'
    )
  }, [generatePDF])

  // Generate bulk student ID cards (4 per page)
  const generateBulkStudentIDCards = useCallback(async (studentIds: number[]) => {
    if (studentIds.length === 0) {
      toast({
        title: "កំហុស",
        description: "សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់។",
        variant: "destructive",
      })
      return
    }

    if (studentIds.length > 4) {
      toast({
        title: "កំហុស",
        description: "អាចបង្កើតប័ណ្ណសម្គាល់សិស្សបានច្រើនបំផុត 4 នាក់ក្នុងមួយទំព័រ។",
        variant: "destructive",
      })
      return
    }

    await generatePDF(
      { 
        type: 'student',
        variant: 'bulk',
        studentIds,
        schoolYear: selectedSchoolYear || '2024-2025'
      },
      `student-id-cards-${studentIds.length}-students.pdf`,
      `បានបង្កើតប័ណ្ណសម្គាល់សិស្ស ${studentIds.length} នាក់ក្នុងមួយទំព័រ។`,
      "មិនអាចបង្កើតប័ណ្ណសម្គាល់សិស្ស (ច្រើន) បាន",
      'bulkStudents'
    )
  }, [generatePDF, selectedSchoolYear, toast])

  // Generate ID cards for entire class
  const generateClassIDCards = async (classId: string) => {
    if (!classId) {
      toast({
        title: "កំហុស",
        description: "សូមជ្រើសរើសថ្នាក់សិក្សា។",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/pdf-generate/generate-id-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'student',
          variant: 'bulk',
          classId,
          schoolYear: selectedSchoolYear || '2024-2025'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `student-id-cards-${getCourseName(parseInt(classId))}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "ជោគជ័យ",
          description: "បានបង្កើតប័ណ្ណសម្គាល់សិស្សថ្នាក់ដោយជោគជ័យ",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "កំហុស",
          description: errorData.error || "មិនអាចបង្កើតប័ណ្ណសម្គាល់សិស្សថ្នាក់បាន",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error generating class ID cards:', error)
      toast({
        title: "កំហុស",
        description: "មិនអាចបង្កើតប័ណ្ណសម្គាល់សិស្សថ្នាក់បាន",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate bulk teacher ID cards (4 per page)
  const generateBulkTeacherIDCards = useCallback(async (userIds: number[]) => {
    if (userIds.length === 0) {
      toast({
        title: "កំហុស",
        description: "សូមជ្រើសរើសគ្រូយ៉ាងហោចណាស់ម្នាក់។",
        variant: "destructive",
      })
      return
    }

    if (userIds.length > 4) {
      toast({
        title: "កំហុស",
        description: "អាចបង្កើតប័ណ្ណសម្គាល់គ្រូបានច្រើនបំផុត 4 នាក់ក្នុងមួយទំព័រ។",
        variant: "destructive",
      })
      return
    }

    await generatePDF(
      { 
        type: 'teacher',
        variant: 'bulk',
        userIds,
        schoolYear: selectedSchoolYear || '2024-2025'
      },
      `teacher-id-cards-${userIds.length}-teachers.pdf`,
      `បានបង្កើតប័ណ្ណសម្គាល់គ្រូ ${userIds.length} នាក់ក្នុងមួយទំព័រ។`,
      "មិនអាចបង្កើតប័ណ្ណសម្គាល់គ្រូ (ច្រើន) បាន",
      'teacherCard'
    )
  }, [generatePDF, selectedSchoolYear, toast])

  // Generate all teacher ID cards (optimized for 3 teachers)
  const generateAllTeacherIDCards = async () => {
    const teachersToGenerate = teachers || []
    
    if (teachersToGenerate.length === 0) {
      toast({
        title: "ព្រមាន",
        description: "មិនមានគ្រូបង្រៀន ឬអ្នកគ្រប់គ្រងដើម្បីបង្កើតប័ណ្ណសម្គាល់",
        variant: "destructive",
      })
      return
    }

    // Initialize with all teachers selected
    setSelectedTeachers(teachersToGenerate.map(teacher => teacher.userid))
    setTeacherConfirmData({
      count: teachersToGenerate.length,
      teachers: teachersToGenerate
    })
    setShowTeacherConfirmDialog(true)
  }

  // Confirm teacher ID card generation
  const confirmTeacherIDCardGeneration = async () => {
    if (!teacherConfirmData || selectedTeachers.length === 0) {
      toast({
        title: "កំហុស",
        description: "សូមជ្រើសរើសគ្រូយ៉ាងហោចណាស់ម្នាក់។",
        variant: "destructive",
      })
      return
    }

    setShowTeacherConfirmDialog(false)
    
    // Use bulk generation for better performance
    const teacherIds = selectedTeachers
    
    // Generate PDF directly without conflicting loading states
    await generatePDF(
      { 
        type: 'teacher',
        variant: 'bulk',
        userIds: teacherIds,
        schoolYear: selectedSchoolYear || '2024-2025'
      },
      `teacher-id-cards-${teacherIds.length}-teachers.pdf`,
      `បានបង្កើតប័ណ្ណសម្គាល់គ្រូ ${teacherIds.length} នាក់ក្នុងមួយទំព័រ។`,
      "មិនអាចបង្កើតប័ណ្ណសម្គាល់គ្រូ (ច្រើន) បាន",
      'teacherCard'
    )
  }

  // Generate ID cards with filters (for students only)
  const generateIDCardsWithFilters = async () => {
    if (!selectedSchoolYear) {
      toast({
        title: "ព្រមាន",
        description: "សូមជ្រើសរើសឆ្នាំសិក្សា",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0

    try {
      const studentsToGenerate = filteredStudents
      for (const student of studentsToGenerate) {
        try {
          await generateStudentIDCard(student.studentId)
          successCount++
        } catch (error) {
          errorCount++
        }
      }

      toast({
        title: "ប័ណ្ណសម្គាល់សិស្សត្រូវបានបង្កើត",
        description: `បានបង្កើតប័ណ្ណសម្គាល់សិស្ស ${successCount} ដោយជោគជ័យ។ បរាជ័យ ${errorCount}។`,
        variant: successCount > 0 ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "កំហុស",
        description: "មិនអាចបង្កើតប័ណ្ណសម្គាល់សិស្សបាន",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowGenerateModal(false)
    }
  }

  // Generate all students in selected course with 4 ID cards per page
  const generateAllStudentsInCourse = async () => {
    if (!selectedSchoolYear) {
      toast({
        title: "ព្រមាន",
        description: "សូមជ្រើសរើសឆ្នាំសិក្សា",
        variant: "destructive",
      })
      return
    }

    if (!selectedCourse || selectedCourse === 'all') {
      toast({
        title: "ព្រមាន",
        description: "សូមជ្រើសរើសវគ្គសិក្សា",
        variant: "destructive",
      })
      return
    }

    setLoadingStates(prev => ({ ...prev, allStudentsInCourse: true }))
    try {
      // Get the selected course details
      const selectedCourseData = getSelectedCourseDetails()
      if (!selectedCourseData) {
        toast({
          title: "ព្រមាន",
          description: "មិនរកឃើញថ្នាក់រៀនដែលបានជ្រើសរើស",
          variant: "destructive",
        })
        return
      }

      // Generate bulk ID cards for all students in the course
      const response = await fetch('/api/pdf-generate/generate-id-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'student',
          variant: 'bulk',
          courseId: selectedCourseData.courseId,
          schoolYear: selectedSchoolYear
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `student-id-cards-${getCourseName(selectedCourseData.courseId)}-${selectedSchoolYear}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "ជោគជ័យ",
          description: `បានបង្កើតប័ណ្ណសម្គាល់សិស្ស${getCourseName(selectedCourseData.courseId)} ដោយជោគជ័យ`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "កំហុស",
          description: errorData.error || "មិនអាចបង្កើតប័ណ្ណសម្គាល់សិស្សថ្នាក់បាន",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error generating class ID cards:', error)
      toast({
        title: "កំហុស",
        description: "មិនអាចបង្កើតប័ណ្ណសម្គាល់សិស្សថ្នាក់បាន",
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, allStudentsInCourse: false }))
      setShowGenerateModal(false)
    }
  }

  // Generate back ID cards for all students in selected course
  const generateAllStudentsBackIDCards = async () => {
    if (!selectedSchoolYear) {
      toast({
        title: "ព្រមាន",
        description: "សូមជ្រើសរើសឆ្នាំសិក្សា",
        variant: "destructive",
      })
      return
    }

    if (!selectedCourse || selectedCourse === 'all') {
      toast({
        title: "ព្រមាន",
        description: "សូមជ្រើសរើសវគ្គសិក្សា",
        variant: "destructive",
      })
      return
    }

    setLoadingStates(prev => ({ ...prev, allStudentsBack: true }))
    try {
      // Get the selected course details
      const selectedCourseData = getSelectedCourseDetails()
      if (!selectedCourseData) {
        toast({
          title: "ព្រមាន",
          description: "មិនរកឃើញថ្នាក់រៀនដែលបានជ្រើសរើស",
          variant: "destructive",
        })
        return
      }

      // Generate bulk back ID cards for all students in the course
      const response = await fetch('/api/pdf-generate/generate-id-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'student',
          variant: 'back',
          courseId: selectedCourseData.courseId,
          schoolYear: selectedSchoolYear
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `student-id-cards-back-${getCourseName(selectedCourseData.courseId)}-${selectedSchoolYear}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "ជោគជ័យ",
          description: `បានបង្កើតប័ណ្ណសម្គាល់ខាងក្រោយសិស្ស${getCourseName(selectedCourseData.courseId)} ដោយជោគជ័យ`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "កំហុស",
          description: errorData.error || "មិនអាចបង្កើតប័ណ្ណសម្គាល់ខាងក្រោយសិស្សថ្នាក់បាន",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error generating back class ID cards:', error)
      toast({
        title: "កំហុស",
        description: "មិនអាចបង្កើតប័ណ្ណសម្គាល់ខាងក្រោយសិស្សថ្នាក់បាន",
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, allStudentsBack: false }))
      setShowGenerateModal(false)
    }
  }


  return (
    <div>
      <div>  

        {/* ID Card Generation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${loadingStates.studentCard ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} border-white/20 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl`}
          onClick={loadingStates.studentCard ? undefined : () => {
            setGenerateType('students')
            setShowGenerateModal(true)
          }}
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-600/10 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:via-blue-600/15 group-hover:to-indigo-500/10 transition-all duration-500" />
          
          {/* Content */}
          <div className="relative p-8">
            {/* Icon with animated background */}
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                {loadingStates.studentCard ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <GraduationCap className="h-8 w-8 text-white" />
                )}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-blue-500 opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            </div>

            {/* Title and Description */}
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-500">
                ប័ណ្ណសម្គាល់សិស្ស
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {loadingStates.studentCard ? 'កំពុងបង្កើត និងទាញយកប័ណ្ណសម្គាល់...' : 'បង្កើតប័ណ្ណសម្គាល់សម្រាប់សិស្សតាមឆ្នាំសិក្សា និងថ្នាក់'}
              </p>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-center">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-all duration-500 ${
                loadingStates.studentCard 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                  : 'bg-muted text-muted-foreground group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg'
              }`}>
                <span>{loadingStates.studentCard ? 'កំពុងបង្កើត...' : 'បង្កើតប័ណ្ណសម្គាល់'}</span>
                {!loadingStates.studentCard && (
                  <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${loadingStates.teacherCard ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} border-white/20 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl`}
          onClick={loadingStates.teacherCard ? undefined : generateAllTeacherIDCards}
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-green-600/10 to-emerald-500/5 group-hover:from-green-500/10 group-hover:via-green-600/15 group-hover:to-emerald-500/10 transition-all duration-500" />
          
          {/* Content */}
          <div className="relative p-8">
            {/* Icon with animated background */}
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-green-500 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                {loadingStates.teacherCard ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-green-500 opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            </div>

            {/* Title and Description */}
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-500">
                ប័ណ្ណសម្គាល់គ្រូបង្រៀន
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {loadingStates.teacherCard ? 'កំពុងបង្កើត និងទាញយកប័ណ្ណសម្គាល់...' : `ចុចដើម្បីបង្កើតប័ណ្ណសម្គាល់សម្រាប់គ្រូបង្រៀន ${(teachers || []).length} នាក់ (ឯកសារតែមួយ)`}
              </p>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-center">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-all duration-500 ${
                loadingStates.teacherCard 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                  : 'bg-muted text-muted-foreground group-hover:bg-green-500 group-hover:text-white group-hover:shadow-lg'
              }`}>
                <span>{loadingStates.teacherCard ? 'កំពុងបង្កើត...' : 'បង្កើតប័ណ្ណសម្គាល់'}</span>
                {!loadingStates.teacherCard && (
                  <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Modal - Students Only */}
      {showGenerateModal && generateType === 'students' && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-6">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      បង្កើតប័ណ្ណសម្គាល់សិស្ស
                    </CardTitle>
                    <div className="h-1 w-8 bg-white/30 rounded-full mt-2"></div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGenerateModal(false)}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white hover:text-white transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                {/* School Year Selection */}
                <div className="space-y-2">
                  <Label htmlFor="schoolYear" className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span>ឆ្នាំសិក្សា</span>
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
                    <SelectTrigger className="h-11 text-sm bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200">
                      <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears.map((year) => (
                        <SelectItem key={year.schoolYearId} value={year.schoolYearCode}>
                          {year.schoolYearCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Course Selection */}
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>ថ្នាក់រៀន</span>
                  </Label>
                  <Select value={selectedCourse} onValueChange={handleCourseChange}>
                    <SelectTrigger className="h-11 text-sm bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200">
                      <SelectValue placeholder="ជ្រើសរើសថ្នាក់រៀន (ទុកទទេសម្រាប់ទាំងអស់)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ទាំងអស់</SelectItem>
                      {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId.toString()}>
                          ថ្នាក់ទី {course.grade}{course.section}
                        </SelectItem>
                      )) : (
                        <SelectItem value="no-courses" disabled>
                          មិនមានថ្នាក់រៀន
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview Count */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      នឹងបង្កើតប័ណ្ណសម្គាល់សម្រាប់: 
                      <span className="font-semibold text-blue-800 dark:text-blue-200 ml-1">
                        {filteredStudents.length} សិស្ស
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Bulk Actions */}
                {selectedStudents.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800/50">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
                          <Users className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                          បានជ្រើសរើស {selectedStudents.length} សិស្ស
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => generateBulkStudentIDCards(selectedStudents)}
                          disabled={loadingStates.bulkStudents || selectedStudents.length > 4}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-sm transition-all duration-200"
                        >
                          {loadingStates.bulkStudents ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          {loadingStates.bulkStudents ? 'កំពុងបង្កើត...' : 'បង្កើតប័ណ្ណ (ច្រើន)'}
                        </Button>
                        <Button
                          onClick={clearStudentSelection}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                          លុបចេញ
                        </Button>
                      </div>
                      {selectedStudents.length > 4 && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          អាចបង្កើតបានច្រើនបំផុត 4 នាក់ក្នុងមួយទំព័រ
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Generate All Students in Course Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => generateAllStudentsInCourse()}
                    disabled={loadingStates.allStudentsInCourse || !selectedSchoolYear || !selectedCourse || selectedCourse === 'all'}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-all duration-200 flex items-center gap-2"
                  >
                    {loadingStates.allStudentsInCourse ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {loadingStates.allStudentsInCourse ? 'កំពុងបង្កើត...' : `បង្កើតប័ណ្ណសម្គាល់${getSelectedCourseDetails() ? getCourseName(getSelectedCourseDetails()!.courseId) : 'ថ្នាក់រៀន'} (${filteredStudents.length} សិស្ស)`}
                  </Button>
                  
                  <Button
                    onClick={() => generateAllStudentsBackIDCards()}
                    disabled={loadingStates.allStudentsBack || !selectedSchoolYear || !selectedCourse || selectedCourse === 'all'}
                    variant="outline"
                    className="w-full h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
                  >
                    {loadingStates.allStudentsBack ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {loadingStates.allStudentsBack ? 'កំពុងបង្កើត...' : `បង្កើតប័ណ្ណខាងក្រោយ${getSelectedCourseDetails() ? getCourseName(getSelectedCourseDetails()!.courseId) : 'ថ្នាក់រៀន'} (${filteredStudents.length} សិស្ស)`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teacher ID Card Confirmation Dialog */}
      <Dialog open={showTeacherConfirmDialog} onOpenChange={setShowTeacherConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="h-5 w-5 text-green-500" />
              បញ្ជាក់ការបង្កើតប័ណ្ណសម្គាល់គ្រូ
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              ជ្រើសរើសគ្រូបង្រៀនដែលអ្នកចង់បង្កើតប័ណ្ណសម្គាល់ ({selectedTeachers.length} នាក់ជ្រើសរើស)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Teacher Selection */}
            {teacherConfirmData?.teachers && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    បញ្ជីគ្រូបង្រៀន:
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllTeachers}
                      className="text-xs h-7"
                    >
                      ជ្រើសរើសទាំងអស់
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deselectAllTeachers}
                      className="text-xs h-7"
                    >
                      លុបជ្រើសរើស
                    </Button>
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {teacherConfirmData.teachers.map((teacher, index) => (
                    <div key={teacher.userid} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Checkbox
                        id={`teacher-${teacher.userid}`}
                        checked={selectedTeachers.includes(teacher.userid)}
                        onCheckedChange={(checked) => handleTeacherSelection(teacher.userid, checked as boolean)}
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {teacher.lastname} {teacher.firstname}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {teacher.role === 'admin' ? 'អ្នកគ្រប់គ្រង' : 'គ្រូបង្រៀន'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Info Box */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">ព័ត៌មានសំខាន់:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• នេះនឹងបង្កើតឯកសារ PDF តែមួយ</li>
                    <li>• ប័ណ្ណសម្គាល់ទាំងអស់នឹងត្រូវបានបង្កើតក្នុងមួយទំព័រ</li>
                    <li>• ឯកសារនឹងចាប់ផ្តើមទាញយកដោយស្វ័យប្រវត្តិ</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTeacherConfirmDialog(false)}
              className="flex-1"
            >
              បោះបង់
            </Button>
            <Button
              onClick={confirmTeacherIDCardGeneration}
              disabled={loadingStates.teacherCard || selectedTeachers.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {loadingStates.teacherCard ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  កំពុងបង្កើត...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  បញ្ជាក់
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </div>
  )
}
