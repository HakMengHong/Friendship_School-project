import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
  createdAt: string
}

interface Subject {
  subjectId: number
  subjectName: string
  createdAt: string
}

interface Course {
  courseId: number
  schoolYearId: number
  teacherId1?: number
  teacherId2?: number
  teacherId3?: number
  grade: string
  section: string
  courseName: string
  createdAt: string
  updatedAt?: string
}

interface Teacher {
  userid: number
  username: string
  firstname: string
  lastname: string
  role: string
  position?: string
}

export function useAcademicManagement() {
  const { toast } = useToast()
  
  // State for data
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])

  // State for forms
  const [showYearForm, setShowYearForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showMultipleCourseForm, setShowMultipleCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // State for form data
  const [newSchoolYear, setNewSchoolYear] = useState({ schoolYearCode: '' })
  const [newSubject, setNewSubject] = useState({ subjectName: '' })
  const [newCourse, setNewCourse] = useState({
    schoolYearId: '',
    grade: '',
    section: '',
    courseName: '',
    teacherId1: '',
    teacherId2: '',
    teacherId3: ''
  })

  // State for UI
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    try {
      const response = await fetch('/api/courses')
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
  }, [toast])

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      const teacherUsers = data.filter((user: Teacher) => 
        user.role === 'teacher' && user.status === 'active'
      )
      setTeachers(teacherUsers || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive"
      })
    }
  }, [toast])

  // Form submission functions
  const handleAddSchoolYear = async () => {
    if (!newSchoolYear.schoolYearCode.trim()) {
      setErrors({ schoolYearCode: 'សូមបំពេញឆ្នាំសិក្សា' })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/school-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchoolYear)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "School year added successfully"
        })
        setNewSchoolYear({ schoolYearCode: '' })
        setShowYearForm(false)
        fetchSchoolYears()
      } else {
        throw new Error('Failed to add school year')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add school year",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddSubject = async () => {
    if (!newSubject.subjectName.trim()) {
      setErrors({ subjectName: 'សូមបំពេញឈ្មោះមុខវិជ្ជា' })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject added successfully"
        })
        setNewSubject({ subjectName: '' })
        setShowSubjectForm(false)
        fetchSubjects()
      } else {
        throw new Error('Failed to add subject')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subject",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddCourse = async () => {
    // Validation
    const validationErrors: Record<string, string> = {}
    if (!newCourse.schoolYearId) validationErrors.schoolYearId = 'សូមជ្រើសរើសឆ្នាំសិក្សា'
    if (!newCourse.grade) validationErrors.grade = 'សូមជ្រើសរើសថ្នាក់'
    if (!newCourse.section) validationErrors.section = 'សូមបំពេញផ្នែក'
    if (!newCourse.courseName) validationErrors.courseName = 'សូមបំពេញឈ្មោះថ្នាក់'

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      const courseData = {
        ...newCourse,
        teacherId1: newCourse.teacherId1 || null,
        teacherId2: newCourse.teacherId2 || null,
        teacherId3: newCourse.teacherId3 || null
      }

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course added successfully"
        })
        setNewCourse({
          schoolYearId: '',
          grade: '',
          section: '',
          courseName: '',
          teacherId1: '',
          teacherId2: '',
          teacherId3: ''
        })
        setShowCourseForm(false)
        fetchCourses()
      } else {
        throw new Error('Failed to add course')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបមុខវិជ្ជានេះមែនទេ?')) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject deleted successfully"
        })
        fetchSubjects()
      } else {
        throw new Error('Failed to delete subject')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTeacherAssignment = async (courseId: number, teacherId: number, position: 1 | 2 | 3) => {
    setSubmitting(true)
    try {
      const course = courses.find(c => c.courseId === courseId)
      if (!course) throw new Error('Course not found')

      const updateData = {
        ...course,
        [`teacherId${position}`]: teacherId
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Teacher assigned successfully"
        })
        fetchCourses()
      } else {
        throw new Error('Failed to assign teacher')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign teacher",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveTeacherAssignment = async (courseId: number, position: 1 | 2 | 3) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់ដកគ្រូនេះមែនទេ?')) {
      return
    }

    setSubmitting(true)
    try {
      const course = courses.find(c => c.courseId === courseId)
      if (!course) throw new Error('Course not found')

      const updateData = {
        ...course,
        [`teacherId${position}`]: null
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Teacher removed successfully"
        })
        fetchCourses()
      } else {
        throw new Error('Failed to remove teacher')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove teacher",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Computed values
  const filteredSubjects = subjects.filter(subject =>
    subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Initialize data on mount
  useEffect(() => {
    fetchSchoolYears()
    fetchSubjects()
    fetchCourses()
    fetchTeachers()
  }, [fetchSchoolYears, fetchSubjects, fetchCourses, fetchTeachers])

  return {
    // Data
    schoolYears,
    subjects,
    courses,
    teachers,
    filteredSubjects,
    
    // Form state
    showYearForm,
    showSubjectForm,
    showCourseForm,
    showMultipleCourseForm,
    editingCourse,
    newSchoolYear,
    newSubject,
    newCourse,
    
    // UI state
    submitting,
    searchTerm,
    viewMode,
    errors,
    
    // Actions
    setShowYearForm,
    setShowSubjectForm,
    setShowCourseForm,
    setShowMultipleCourseForm,
    setEditingCourse,
    setNewSchoolYear,
    setNewSubject,
    setNewCourse,
    setSearchTerm,
    setViewMode,
    setErrors,
    
    // Functions
    handleAddSchoolYear,
    handleAddSubject,
    handleAddCourse,
    handleDeleteSubject,
    handleUpdateTeacherAssignment,
    handleRemoveTeacherAssignment,
    fetchSchoolYears,
    fetchSubjects,
    fetchCourses,
    fetchTeachers
  }
}
