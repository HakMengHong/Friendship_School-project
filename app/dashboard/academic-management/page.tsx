'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Calendar, 
  GraduationCap,
  X,
  Check,
  AlertCircle,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Users,
  School,
  BookOpenCheck,
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Clock,
  UserCheck,
  Building2,
  Sparkles
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

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

export default function AcademicManagementPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AcademicManagementContent />
    </RoleGuard>
  )
}

function AcademicManagementContent() {
  const { toast } = useToast()
  
  // State for data
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])

  // Ensure teachers is always an array
  const safeTeachers = teachers || []

  // State for forms
  const [showYearForm, setShowYearForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showMultipleCourseForm, setShowMultipleCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Form data
  const [newYear, setNewYear] = useState({ schoolYearCode: '' })
  const [newSubject, setNewSubject] = useState({ subjectName: '' })
  const [newCourse, setNewCourse] = useState({ 
    schoolYearId: '', 
    grade: '', 
    section: '', 
    courseName: '',
    teacherId1: undefined as number | undefined,
    teacherId2: undefined as number | undefined,
    teacherId3: undefined as number | undefined
  })
  
  const [gradeRange, setGradeRange] = useState({
    startGrade: 1,
    endGrade: 12
  })

  // Filter and search state
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Loading states
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Error states
  const [errors, setErrors] = useState<{
    fetch?: string
    year?: string
    subject?: string
    course?: string
    schoolYearId?: string
    grade?: string
    section?: string
    subjectName?: string
  }>({})

  // Confirmation dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteItemType, setDeleteItemType] = useState<'year' | 'subject' | 'course' | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null)
  const [deleteItemName, setDeleteItemName] = useState<string>('')
  
  // Bulk creation confirmation dialogs
  const [bulkCreateConfirmOpen, setBulkCreateConfirmOpen] = useState(false)
  const [existingCoursesWarningOpen, setExistingCoursesWarningOpen] = useState(false)
  const [existingCoursesList, setExistingCoursesList] = useState<string[]>([])
  const [coursesToCreate, setCoursesToCreate] = useState<any[]>([])
  
  // Single course creation confirmation dialogs
  const [singleCreateConfirmOpen, setSingleCreateConfirmOpen] = useState(false)
  const [singleCourseData, setSingleCourseData] = useState<any>(null)
  
  // Duplicate course warning dialog
  const [duplicateCourseWarningOpen, setDuplicateCourseWarningOpen] = useState(false)
  const [duplicateCourseData, setDuplicateCourseData] = useState<any>(null)
  
  // Duplicate school year warning dialog
  const [duplicateSchoolYearWarningOpen, setDuplicateSchoolYearWarningOpen] = useState(false)
  const [duplicateSchoolYearData, setDuplicateSchoolYearData] = useState<any>(null)
  
  // Duplicate subject warning dialog
  const [duplicateSubjectWarningOpen, setDuplicateSubjectWarningOpen] = useState(false)
  const [duplicateSubjectData, setDuplicateSubjectData] = useState<any>(null)
  
  
  // Subject editing state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editSubjectName, setEditSubjectName] = useState('')
  
  // Course editing state (using existing editingCourse from line 102)
  const [editCourse, setEditCourse] = useState({
    schoolYearId: '',
    grade: '',
    section: '',
    courseName: '',
    teacherId1: undefined as number | undefined,
    teacherId2: undefined as number | undefined,
    teacherId3: undefined as number | undefined
  })

  // Memoized filtered data
  const filteredCourses = useMemo(() => {
    let filtered = courses
    
    if (selectedSchoolYear && selectedSchoolYear !== 'all') {
      filtered = filtered.filter(course => 
        course.schoolYearId.toString() === selectedSchoolYear
      )
    }
    
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.grade?.toString().includes(searchTerm)
      )
    }
    
    // Sort courses numerically by grade (1, 2, 3, ..., 12)
    filtered = filtered.sort((a, b) => {
      const gradeA = parseInt(a.grade) || 0
      const gradeB = parseInt(b.grade) || 0
      return gradeA - gradeB
    })
    
    return filtered
  }, [courses, selectedSchoolYear, searchTerm])

  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return subjects
    return subjects.filter(subject => 
      subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [subjects, searchTerm])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setErrors({})
      
      // Fetch all data in parallel
      const [yearsResponse, subjectsResponse, coursesResponse, teachersResponse] = await Promise.all([
        fetch('/api/school-years'),
        fetch('/api/subjects'),
        fetch('/api/courses'),
        fetch('/api/users')
      ])

      if (yearsResponse.ok) {
        const yearsData = await yearsResponse.json()
        setSchoolYears(yearsData)
      } else {
        throw new Error('Failed to fetch school years')
      }

      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json()
        setSubjects(subjectsData)
      } else {
        throw new Error('Failed to fetch subjects')
      }

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData)
      } else {
        throw new Error('Failed to fetch courses')
      }

      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json()
        // Show all users, not just teachers, so admin can assign any user
        if (teachersData && teachersData.users && Array.isArray(teachersData.users)) {
          setTeachers(teachersData.users)
          console.log('✅ Teachers loaded successfully:', teachersData.users.length)
        } else {
          console.warn('⚠️ Teachers data structure unexpected:', teachersData)
          setTeachers([])
        }
      } else {
        throw new Error('Failed to fetch teachers')
      }

      toast({
        title: "ទិន្នន័យត្រូវបានផ្ទុកដោយជោគជ័យ",
        description: "បានផ្ទុកទិន្នន័យទាំងអស់ដោយជោគជ័យ",
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "កំហុសក្នុងការផ្ទុកទិន្នន័យ",
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
      setErrors({ fetch: 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Add new school year
  const handleAddYear = async () => {
    if (!newYear.schoolYearCode.trim()) {
      setErrors({ year: 'សូមបំពេញឆ្នាំសិក្សា' })
      return
    }

    // Check for duplicate school year before making API call
    const trimmedYear = newYear.schoolYearCode.trim()
    const existingYear = schoolYears.find(year => 
      year.schoolYearCode.toLowerCase() === trimmedYear.toLowerCase()
    )
    
    if (existingYear) {
      // Show duplicate school year warning popup
      setDuplicateSchoolYearData({
        schoolYearCode: trimmedYear
      })
      setDuplicateSchoolYearWarningOpen(true)
      return
    }

    try {
      setSubmitting(true)
      setErrors({})

              const response = await fetch('/api/school-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolYearCode: newYear.schoolYearCode.trim() })
      })

      if (response.ok) {
        const addedYear = await response.json()
        setSchoolYears(prev => [addedYear, ...prev])
        setNewYear({ schoolYearCode: '' })
        setShowYearForm(false)
        toast({
          title: "បានបន្ថែមឆ្នាំសិក្សាដោយជោគជ័យ",
          description: `បានបន្ថែមឆ្នាំសិក្សា ${addedYear.schoolYearCode}`,
        })
      } else {
        // Try to get the specific error message from the API response
        let errorMessage = 'Failed to add school year'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          // If we can't parse the error response, use a generic message
          errorMessage = response.status === 409 ? 'ឆ្នាំសិក្សានេះមានរួចហើយ' : 'Failed to add school year'
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error adding school year:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Check if it's a duplicate error
      if (errorMessage.includes('ឆ្នាំសិក្សានេះមានរួចហើយ') || errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        toast({
          title: "ឆ្នាំសិក្សាមានរួចហើយ",
          description: `ឆ្នាំសិក្សា ${newYear.schoolYearCode} មានរួចហើយក្នុងប្រព័ន្ធ`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "កំហុសក្នុងការបន្ថែមឆ្នាំសិក្សា",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Add new subject
  const handleAddSubject = async () => {
    const errors: Record<string, string> = {}
    if (!newSubject.subjectName.trim()) errors.subjectName = 'សូមបំពេញឈ្មោះមុខវិជ្ជា'
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }

    // Check for duplicate subject before making API call
    const trimmedSubject = newSubject.subjectName.trim()
    const existingSubject = subjects.find(subject => 
      subject.subjectName.toLowerCase() === trimmedSubject.toLowerCase()
    )
    
    if (existingSubject) {
      // Show duplicate subject warning popup
      setDuplicateSubjectData({
        subjectName: trimmedSubject
      })
      setDuplicateSubjectWarningOpen(true)
      return
    }

    try {
      setSubmitting(true)
      setErrors({})

      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: newSubject.subjectName.trim()
        })
      })

      if (response.ok) {
        const addedSubject = await response.json()
        setSubjects(prev => [addedSubject, ...prev])
        setNewSubject({ subjectName: '' })
        setShowSubjectForm(false)
        toast({
          title: "បានបន្ថែមមុខវិជ្ជាដោយជោគជ័យ",
          description: `បានបន្ថែមមុខវិជ្ជា ${addedSubject.subjectName}`,
        })
      } else {
        // Try to get the specific error message from the API response
        let errorMessage = 'Failed to add subject'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          // If we can't parse the error response, use a generic message
          errorMessage = response.status === 409 ? 'មុខវិជ្ជានេះមានរួចហើយ' : 'Failed to add subject'
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error adding subject:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Check if it's a duplicate error
      if (errorMessage.includes('មុខវិជ្ជានេះមានរួចហើយ') || errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        toast({
          title: "មុខវិជ្ជាមានរួចហើយ",
          description: `មុខវិជ្ជា ${trimmedSubject} មានរួចហើយក្នុងប្រព័ន្ធ`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "កំហុសក្នុងការបន្ថែមមុខវិជ្ជា",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Edit subject
  const handleEditSubject = async () => {
    if (!editingSubject || !editSubjectName.trim()) {
      toast({
        title: "ព័ត៌មានមិនគ្រប់គ្រាន់",
        description: "សូមបំពេញឈ្មោះមុខវិជ្ជា",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate subject name (excluding current subject)
    const trimmedSubject = editSubjectName.trim()
    const existingSubject = subjects.find(subject => 
      subject.subjectId !== editingSubject.subjectId &&
      subject.subjectName.toLowerCase() === trimmedSubject.toLowerCase()
    )
    
    if (existingSubject) {
      toast({
        title: "មុខវិជ្ជាមានរួចហើយ",
        description: `មុខវិជ្ជា ${trimmedSubject} មានរួចហើយក្នុងប្រព័ន្ធ`,
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/subjects/${editingSubject.subjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: trimmedSubject
        })
      })

      if (response.ok) {
        const updatedSubject = await response.json()
        setSubjects(prev => prev.map(subject => 
          subject.subjectId === editingSubject.subjectId ? updatedSubject : subject
        ))
        setEditingSubject(null)
        setEditSubjectName('')
        toast({
          title: "បានកែប្រែមុខវិជ្ជាដោយជោគជ័យ",
          description: `បានកែប្រែមុខវិជ្ជាជា ${updatedSubject.subjectName}`,
        })
      } else {
        // Try to get the specific error message from the API response
        let errorMessage = 'Failed to update subject'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          errorMessage = response.status === 409 ? 'មុខវិជ្ជានេះមានរួចហើយ' : 'Failed to update subject'
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error updating subject:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Check if it's a duplicate error
      if (errorMessage.includes('មុខវិជ្ជានេះមានរួចហើយ') || errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        toast({
          title: "មុខវិជ្ជាមានរួចហើយ",
          description: `មុខវិជ្ជា ${trimmedSubject} មានរួចហើយក្នុងប្រព័ន្ធ`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "កំហុសក្នុងការកែប្រែមុខវិជ្ជា",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Start editing subject
  const startEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setEditSubjectName(subject.subjectName)
  }

  // Cancel editing subject
  const cancelEditSubject = () => {
    setEditingSubject(null)
    setEditSubjectName('')
  }

  // Add new course
  const handleAddCourse = async () => {
    const errors: Record<string, string> = {}
    if (!newCourse.schoolYearId) errors.schoolYearId = 'សូមជ្រើសរើសឆ្នាំសិក្សា'
    if (!newCourse.grade) errors.grade = 'សូមជ្រើសរើសថ្នាក់'
    if (!newCourse.section.trim()) errors.section = 'សូមបំពេញផ្នែក'
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }

    // Check if course already exists
    const existingCourse = courses.find(c => 
      c.grade === newCourse.grade && 
      c.section === newCourse.section.trim() && 
      c.schoolYearId === parseInt(newCourse.schoolYearId)
    )
    

    if (existingCourse) {
      // Show duplicate course warning popup
      setDuplicateCourseData({
        grade: newCourse.grade,
        section: newCourse.section.trim(),
        schoolYear: schoolYears.find(sy => sy.schoolYearId === parseInt(newCourse.schoolYearId))?.schoolYearCode || 'Unknown'
      })
      setDuplicateCourseWarningOpen(true)
      return
    }

    // Store course data and show confirmation dialog
    setSingleCourseData({
      ...newCourse,
      section: newCourse.section.trim(),
      courseName: newCourse.courseName.trim() || `ថ្នាក់ទី ${newCourse.grade}`
    })
    setSingleCreateConfirmOpen(true)
  }

  // Confirm single course creation
  const handleConfirmSingleCreate = async () => {
    if (!singleCourseData) return

    try {
      setSubmitting(true)
      setSingleCreateConfirmOpen(false)
      setErrors({})

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleCourseData)
      })

      if (response.ok) {
        const addedCourse = await response.json()
        setCourses(prev => [addedCourse, ...prev])
        setNewCourse({ schoolYearId: '', grade: '', section: '', courseName: '', teacherId1: undefined, teacherId2: undefined, teacherId3: undefined })
        setShowCourseForm(false)
        toast({
          title: "បានបន្ថែមថ្នាក់រៀនដោយជោគជ័យ",
          description: `បានបន្ថែមថ្នាក់រៀន ${addedCourse.courseName || `ថ្នាក់ទី ${addedCourse.grade} ${addedCourse.section}`}`,
        })
      } else {
        // Try to get the specific error message from the API response
        let errorMessage = 'Failed to add course'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          errorMessage = response.status === 409 ? 'ថ្នាក់រៀននេះមានរួចហើយ' : 'Failed to add course'
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error adding course:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Check if it's a duplicate error
      if (errorMessage.includes('ថ្នាក់រៀននេះមានរួចហើយ') || errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        toast({
          title: "ថ្នាក់រៀនមានរួចហើយ",
          description: `ថ្នាក់ទី ${singleCourseData.grade} ផ្នែក ${singleCourseData.section} មានរួចហើយសម្រាប់ឆ្នាំសិក្សានេះ`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "កំហុសក្នុងការបន្ថែមថ្នាក់រៀន",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Edit course
  const handleEditCourse = async () => {
    if (!editingCourse) return

    const errors: Record<string, string> = {}
    if (!editingCourse.schoolYearId) errors.schoolYearId = 'សូមជ្រើសរើសឆ្នាំសិក្សា'
    if (!editingCourse.grade) errors.grade = 'សូមជ្រើសរើសថ្នាក់'
    if (!editingCourse.section?.trim()) errors.section = 'សូមបំពេញផ្នែក'
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }

    // Check for duplicate course (excluding current course)
    const existingCourse = courses.find(c => 
      c.courseId !== editingCourse.courseId &&
      c.grade === editingCourse.grade && 
      c.section === editingCourse.section?.trim() && 
      c.schoolYearId === editingCourse.schoolYearId
    )

    if (existingCourse) {
      toast({
        title: "ថ្នាក់រៀនមានរួចហើយ",
        description: `ថ្នាក់ទី ${editingCourse.grade} ផ្នែក ${editingCourse.section?.trim()} មានរួចហើយសម្រាប់ឆ្នាំសិក្សានេះ`,
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      setErrors({})

      const response = await fetch(`/api/courses/${editingCourse.courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingCourse,
          section: editingCourse.section?.trim(),
          courseName: editingCourse.courseName?.trim() || `ថ្នាក់ទី ${editingCourse.grade}`
        })
      })

      if (response.ok) {
        const updatedCourse = await response.json()
        setCourses(prev => prev.map(course => 
          course.courseId === editingCourse.courseId ? updatedCourse : course
        ))
        setEditingCourse(null)
        toast({
          title: "បានធ្វើបច្ចុប្បន្នភាពថ្នាក់រៀនដោយជោគជ័យ",
          description: `បានធ្វើបច្ចុប្បន្នភាពថ្នាក់រៀន ${updatedCourse.courseName || `ថ្នាក់ទី ${updatedCourse.grade} ${updatedCourse.section}`}`,
        })
      } else {
        // Try to get the specific error message from the API response
        let errorMessage = 'Failed to update course'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          errorMessage = response.status === 409 ? 'ថ្នាក់រៀននេះមានរួចហើយ' : 'Failed to update course'
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error updating course:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Check if it's a duplicate error
      if (errorMessage.includes('ថ្នាក់រៀននេះមានរួចហើយ') || errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        toast({
          title: "ថ្នាក់រៀនមានរួចហើយ",
          description: `ថ្នាក់ទី ${editingCourse.grade} ផ្នែក ${editingCourse.section?.trim()} មានរួចហើយសម្រាប់ឆ្នាំសិក្សានេះ`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "កំហុសក្នុងការធ្វើបច្ចុប្បន្នភាពថ្នាក់រៀន",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Start editing course
  const startEditCourse = (course: Course) => {
    setEditingCourse(course)
    setEditCourse({
      schoolYearId: course.schoolYearId.toString(),
      grade: course.grade,
      section: course.section,
      courseName: course.courseName,
      teacherId1: course.teacherId1 || undefined,
      teacherId2: course.teacherId2 || undefined,
      teacherId3: course.teacherId3 || undefined
    })
    setErrors({})
  }

  // Cancel editing course
  const cancelEditCourse = () => {
    setEditingCourse(null)
    setEditCourse({
      schoolYearId: '',
      grade: '',
      section: '',
      courseName: '',
      teacherId1: undefined,
      teacherId2: undefined,
      teacherId3: undefined
    })
  }

  // Delete functions
  const handleDeleteYear = async (id: number) => {
    const year = schoolYears.find(y => y.schoolYearId === id)
    setDeleteItemType('year')
    setDeleteItemId(id)
    setDeleteItemName(year?.schoolYearCode || 'ឆ្នាំសិក្សានេះ')
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSubject = async (id: number) => {
    const subject = subjects.find(s => s.subjectId === id)
    setDeleteItemType('subject')
    setDeleteItemId(id)
    setDeleteItemName(subject?.subjectName || 'មុខវិជ្ជានេះ')
    setDeleteConfirmOpen(true)
  }

  const handleDeleteCourse = async (id: number) => {
    const course = courses.find(c => c.courseId === id)
    setDeleteItemType('course')
    setDeleteItemId(id)
    setDeleteItemName(course?.courseName || `ថ្នាក់ទី ${course?.grade}${course?.section}` || 'ថ្នាក់រៀននេះ')
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteItemId || !deleteItemType) return

    try {
      setSubmitting(true)
      let response: Response
      let successMessage = ''
      let errorMessage = ''

      switch (deleteItemType) {
        case 'year':
          response = await fetch(`/api/school-years/${deleteItemId}`, {
            method: 'DELETE',
          })
          successMessage = "បានលុបឆ្នាំសិក្សាដោយជោគជ័យ"
          errorMessage = "កំហុសក្នុងការលុបឆ្នាំសិក្សា"
          break
        case 'subject':
          response = await fetch(`/api/subjects/${deleteItemId}`, {
            method: 'DELETE',
          })
          successMessage = "បានលុបមុខវិជ្ជាដោយជោគជ័យ"
          errorMessage = "កំហុសក្នុងការលុបមុខវិជ្ជា"
          break
        case 'course':
          response = await fetch(`/api/courses/${deleteItemId}`, {
            method: 'DELETE',
          })
          successMessage = "បានលុបថ្នាក់រៀនដោយជោគជ័យ"
          errorMessage = "កំហុសក្នុងការលុបថ្នាក់រៀន"
          break
        default:
          return
      }

      if (response.ok) {
        // Update the appropriate state based on item type
        switch (deleteItemType) {
          case 'year':
            setSchoolYears(prev => prev.filter(year => year.schoolYearId !== deleteItemId))
            break
          case 'subject':
            setSubjects(prev => prev.filter(subject => subject.subjectId !== deleteItemId))
            break
          case 'course':
            setCourses(prev => prev.filter(course => course.courseId !== deleteItemId))
            break
        }
        
        toast({
          title: successMessage,
          description: `${deleteItemName} ត្រូវបានលុបចេញពីប្រព័ន្ធ`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: errorMessage,
          description: errorData.error || "សូមព្យាយាមម្តងទៀត",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error deleting ${deleteItemType}:`, error)
      const errorMessage = deleteItemType === 'year' ? "កំហុសក្នុងការលុបឆ្នាំសិក្សា" : 
                          deleteItemType === 'subject' ? "កំហុសក្នុងការលុបមុខវិជ្ជា" : 
                          "កំហុសក្នុងការលុបថ្នាក់រៀន"
      toast({
        title: errorMessage,
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
      setDeleteConfirmOpen(false)
      setDeleteItemType(null)
      setDeleteItemId(null)
      setDeleteItemName('')
    }
  }

  const handleBulkCreateCourses = async () => {
    if (!newCourse.schoolYearId || !newCourse.section.trim()) {
      toast({
        title: "ព័ត៌មានមិនគ្រប់គ្រាន់",
        description: "សូមជ្រើសរើសឆ្នាំសិក្សានិងផ្នែក",
        variant: "destructive",
      })
      return
    }

    if (gradeRange.startGrade > gradeRange.endGrade) {
      toast({
        title: "កំហុសក្នុងការជ្រើសរើសថ្នាក់",
        description: "ថ្នាក់ចាប់ផ្តើមមិនអាចធំជាងថ្នាក់បញ្ចប់បានទេ",
        variant: "destructive",
      })
      return
    }

    // Check for existing courses first
    const existingCourses = []
    const coursesToCreate = []
    
    for (let grade = gradeRange.startGrade; grade <= gradeRange.endGrade; grade++) {
      const existingCourse = courses.find(c => 
        c.grade === grade.toString() && 
        c.section === newCourse.section.trim() && 
        c.schoolYearId === parseInt(newCourse.schoolYearId)
      )
      
      if (existingCourse) {
        existingCourses.push(`ថ្នាក់ទី ${grade}${newCourse.section.trim()}`)
      } else {
        coursesToCreate.push({
          schoolYearId: parseInt(newCourse.schoolYearId),
          grade: grade.toString(),
          section: newCourse.section.trim(),
          courseName: `ថ្នាក់ទី ${grade}`,
          teacherId1: newCourse.teacherId1,
          teacherId2: newCourse.teacherId2,
          teacherId3: newCourse.teacherId3
        })
      }
    }

    if (coursesToCreate.length === 0) {
      toast({
        title: "ថ្នាក់ទាំងអស់មានរួចហើយ",
        description: "ថ្នាក់ទី " + gradeRange.startGrade + "-" + gradeRange.endGrade + " ផ្នែក " + newCourse.section + " មានរួចហើយទាំងអស់",
        variant: "destructive",
      })
      return
    }

    // Store data for confirmation dialogs
    setCoursesToCreate(coursesToCreate)
    setExistingCoursesList(existingCourses)

    // Show appropriate dialog
    if (existingCourses.length > 0) {
      setExistingCoursesWarningOpen(true)
    } else {
      setBulkCreateConfirmOpen(true)
    }
  }

  const handleConfirmBulkCreate = async () => {
    try {
      setSubmitting(true)
      setBulkCreateConfirmOpen(false)
      setExistingCoursesWarningOpen(false)

      // Create courses one by one
      const createdCourses: Course[] = []
      const failedCourses: string[] = []
      
      for (const courseData of coursesToCreate) {
        try {
          const response = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
          })

          if (response.ok) {
            const createdCourse = await response.json()
            createdCourses.push(createdCourse)
          } else {
            const errorData = await response.json()
            failedCourses.push(`${courseData.courseName}${courseData.section}: ${errorData.message || 'Unknown error'}`)
          }
        } catch (error) {
          failedCourses.push(`${courseData.courseName}${courseData.section}: Network error`)
        }
      }

      // Show results
      if (createdCourses.length > 0) {
        // Add new courses to state
        setCourses(prev => [...createdCourses, ...prev])
        
        // Clear form
        setNewCourse({ schoolYearId: '', grade: '', section: '', courseName: '', teacherId1: undefined, teacherId2: undefined, teacherId3: undefined })
        setGradeRange({ startGrade: 1, endGrade: 12 })
        
        let message = `បានបង្កើតថ្នាក់រៀន ${createdCourses.length} ថ្នាក់ដោយជោគជ័យ!`
        
        if (existingCoursesList.length > 0) {
          message += `\nថ្នាក់ ${existingCoursesList.length} ថ្នាក់មានរួចហើយ។`
        }
        
        if (failedCourses.length > 0) {
          message += `\nថ្នាក់ ${failedCourses.length} ថ្នាក់បង្កើតមិនបាន។`
        }
        
        toast({
          title: "បានបង្កើតថ្នាក់រៀនដោយជោគជ័យ",
          description: message,
        })
      } else {
        toast({
          title: "មិនអាចបង្កើតថ្នាក់រៀនបាន",
          description: "មិនអាចបង្កើតថ្នាក់រៀនណាមួយបានទេ",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating bulk courses:', error)
      toast({
        title: "កំហុសក្នុងការបង្កើតថ្នាក់រៀន",
        description: "មានបញ្ហាក្នុងការបង្កើតថ្នាក់រៀន សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        {/* School Years Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Courses Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        {/* Subjects Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-green-950/20 rounded-3xl -z-10" />
        <div className="text-center space-y-6 p-8">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* School Years Card */}
            <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{schoolYears.length}</p>
                    <p className="text-lg text-blue-500 dark:text-blue-300 font-medium">ឆ្នាំសិក្សា</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Courses Card */}
            <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <School className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{courses.length}</p>
                    <p className="text-lg text-purple-500 dark:text-purple-300 font-medium">ថ្នាក់រៀន</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Subjects Card */}
            <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{subjects.length}</p>
                    <p className="text-lg text-green-500 dark:text-green-300 font-medium">មុខវិជ្ជា</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Teachers Card */}
            <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{safeTeachers.length}</p>
                    <p className="text-lg text-orange-500 dark:text-orange-300 font-medium">គ្រូបង្រៀន</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>

         
        </div>
      </div>

      {/* Error Display */}
      {errors.fetch && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="font-medium">{errors.fetch}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* School Years Section */}
      <div className="relative mb-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-indigo-50/20 to-blue-50/20 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-blue-950/10 rounded-3xl -z-10" />
        
        <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Enhanced Header */}
          <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-6">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">ឆ្នាំសិក្សា</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {schoolYears.length} ឆ្នាំ
                    </Badge>
                    <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowYearForm(!showYearForm)}
                className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                variant="ghost"
              >
                <div className="flex items-center gap-2">
                  {showYearForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  <span>{showYearForm ? 'បោះបង់' : 'បន្ថែមឆ្នាំ'}</span>
                </div>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Enhanced Form */}
            {showYearForm && (
              <div className="mb-6 overflow-hidden border-2 border-dashed border-blue-300/50 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-inner backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        បន្ថែមឆ្នាំសិក្សាថ្មី
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400">បំពេញព័ត៌មានឆ្នាំសិក្សាថ្មី</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-3">
                        <Calendar className="h-5 w-5" />
                        ឆ្នាំសិក្សា
                      </label>
                      <Input
                        value={newYear.schoolYearCode}
                        onChange={(e) => {
                          setNewYear({...newYear, schoolYearCode: e.target.value})
                          if (errors.year) setErrors(prev => ({ ...prev, year: '' }))
                        }}
                        placeholder="ឧ. 2024-2025"
                        className={`h-14 text-lg px-4 rounded-xl border-2 transition-all duration-300 ${
                          errors.year 
                            ? 'border-red-400 ring-red-200 bg-red-50 dark:bg-red-950/20' 
                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800'
                        }`}
                      />
                      {errors.year && (
                        <div className="mt-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                          <p className="text-red-600 dark:text-red-400 text-base flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.year}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowYearForm(false)
                        setErrors({})
                        setNewYear({ schoolYearCode: '' })
                      }}
                      className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                    >
                      <X className="h-5 w-5 mr-2" />
                      បោះបង់
                    </Button>
                    <Button 
                      onClick={handleAddYear} 
                      disabled={submitting}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    >
                      {submitting ? (
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-5 w-5 mr-2" />
                      )}
                      បន្ថែមឆ្នាំ
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Empty State */}
            {schoolYears.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mx-auto w-24 h-24 mb-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full animate-pulse" />
                  <div className="absolute inset-2 bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-800/30 dark:to-indigo-800/30 rounded-full" />
                  <Calendar className="absolute inset-0 m-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">គ្មានឆ្នាំសិក្សាទេ</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-3">ចុចប៊ូតុង &quot;បន្ថែមឆ្នាំ&quot; ដើម្បីចាប់ផ្តើម</p>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto"></div>
              </div>
            ) : (
              /* Enhanced Year Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {schoolYears.map((year) => (
                  <div key={year.schoolYearId} className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                    {/* Hover Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Card Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{year.schoolYearCode}</h3>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteYear(year.schoolYearId)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl p-2"
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-base text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>បង្កើត: {new Date(year.createdAt).toLocaleDateString('km-KH')}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500 group-hover:w-full w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Courses Section */}
      <div className="relative mb-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-pink-50/20 to-purple-50/20 dark:from-purple-950/10 dark:via-pink-950/10 dark:to-purple-950/10 rounded-3xl -z-10" />
        
        <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Enhanced Header */}
          <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-6">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <School className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">ថ្នាក់រៀន</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {courses.length} ថ្នាក់
                    </Badge>
                    <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <Button 
                  onClick={() => setShowCourseForm(!showCourseForm)}
                  className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  variant="ghost"
                >
                  <div className="flex items-center gap-2">
                    {showCourseForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    <span>{showCourseForm ? 'បោះបង់' : 'បន្ថែមថ្នាក់'}</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setShowMultipleCourseForm(!showMultipleCourseForm)}
                  className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  variant="ghost"
                >
                  <div className="flex items-center gap-2">
                    {showMultipleCourseForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    <span>{showMultipleCourseForm ? 'បោះបង់' : 'បង្កើតថ្នាក់រៀនច្រើន'}</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardHeader>
                  <CardContent className="p-6">
            
            {showCourseForm && (
            <div className="mb-3 border-2 border-dashed border-purple-300 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30 shadow-inner">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  បន្ថែមថ្នាក់រៀនថ្មី
                </h3>
              </div>
              <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-base text-blue-700 dark:text-blue-300 font-medium">
                    <strong>ចំណាំ:</strong> ឈ្មោះថ្នាក់នឹងត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិពីថ្នាក់ និងផ្នែកដែលអ្នកជ្រើសរើស។
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
                  <Select 
                    value={newCourse.schoolYearId} 
                    onValueChange={(value) => {
                      setNewCourse({...newCourse, schoolYearId: value})
                      if (errors.schoolYearId) setErrors(prev => ({ ...prev, schoolYearId: '' }))
                    }}
                  >
                    <SelectTrigger className={errors.schoolYearId ? 'border-red-500' : ''}>
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
                  {errors.schoolYearId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.schoolYearId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">ថ្នាក់</label>
                  <Select 
                    value={newCourse.grade} 
                    onValueChange={(value) => {
                      setNewCourse({...newCourse, grade: value})
                      if (errors.grade) setErrors(prev => ({ ...prev, grade: '' }))
                    }}
                  >
                    <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                      <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          ថ្នាក់ទី {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.grade && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.grade}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">ផ្នែក</label>
                  <Input
                    value={newCourse.section}
                    onChange={(e) => {
                      setNewCourse({...newCourse, section: e.target.value})
                      if (errors.section) setErrors(prev => ({ ...prev, section: '' }))
                    }}
                    placeholder="ឧ. A, B, C"
                    className={errors.section ? 'border-red-500' : ''}
                  />
                  {errors.section && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.section}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី១</label>
                  <Select 
                    value={newCourse.teacherId1?.toString() || 'none'} 
                    onValueChange={(value) => setNewCourse({...newCourse, teacherId1: value === 'none' ? undefined : parseInt(value)})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "កំពុងផ្ទុក..." : "ជ្រើសរើសគ្រូទី១"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {safeTeachers.length === 0 && !loading ? (
                        <SelectItem value="no-teachers" disabled>
                          គ្មានគ្រូដែលអាចជ្រើសរើសបានទេ
                        </SelectItem>
                      ) : (
                        safeTeachers.map((teacher) => (
                          <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{teacher.lastname}{teacher.firstname}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី២</label>
                  <Select 
                    value={newCourse.teacherId2?.toString() || 'none'} 
                    onValueChange={(value) => setNewCourse({...newCourse, teacherId2: value === 'none' ? undefined : parseInt(value)})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "កំពុងផ្ទុក..." : "ជ្រើសរើសគ្រូទី២"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {safeTeachers.length === 0 && !loading ? (
                        <SelectItem value="no-teachers" disabled>
                          គ្មានគ្រូដែលអាចជ្រើសរើសបានទេ
                        </SelectItem>
                      ) : (
                        safeTeachers.map((teacher) => (
                          <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{teacher.lastname}{teacher.firstname}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី៣</label>
                  <Select 
                    value={newCourse.teacherId3?.toString() || 'none'} 
                    onValueChange={(value) => setNewCourse({...newCourse, teacherId3: value === 'none' ? undefined : parseInt(value)})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "កំពុងផ្ទុក..." : "ជ្រើសរើសគ្រូទី៣"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {safeTeachers.length === 0 && !loading ? (
                        <SelectItem value="no-teachers" disabled>
                          គ្មានគ្រូដែលអាចជ្រើសរើសបានទេ
                        </SelectItem>
                      ) : (
                        safeTeachers.map((teacher) => (
                          <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{teacher.lastname}{teacher.firstname}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCourseForm(false)
                    setErrors({})
                    setNewCourse({ schoolYearId: '', grade: '', section: '', courseName: '', teacherId1: undefined, teacherId2: undefined, teacherId3: undefined })
                  }}
                >
                  បោះបង់
                </Button>
                <Button onClick={handleAddCourse} disabled={submitting}>
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                  <Check className="h-4 w-4 mr-2" />
                  )}
                  បន្ថែម
                </Button>
              </div>
            </div>
          )}

          {/* Multiple Course Creation Form */}
          {showMultipleCourseForm && (
            <div className="mb-3 border-2 border-dashed border-green-300 rounded-xl p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30 shadow-inner">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  បង្កើតថ្នាក់រៀនច្រើនក្នុងពេលតែមួយ
                </h3>
              </div>
              
              <div className="mb-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-base text-emerald-700 dark:text-emerald-300 font-medium">
                    <strong>ចំណាំ:</strong> ប្រព័ន្ធនឹងបង្កើតថ្នាក់ពីថ្នាក់ទី {gradeRange.startGrade} ទៅថ្នាក់ទី {gradeRange.endGrade} សម្រាប់ផ្នែកដែលអ្នកជ្រើសរើស។ ឈ្មោះថ្នាក់នឹងត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិ។
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-base font-medium mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    ឆ្នាំសិក្សា
                  </label>
                  <Select 
                    value={newCourse.schoolYearId} 
                    onValueChange={(value) => {
                      setNewCourse({...newCourse, schoolYearId: value})
                      if (errors.schoolYearId) setErrors(prev => ({ ...prev, schoolYearId: '' }))
                    }}
                  >
                    <SelectTrigger className={`h-12 text-base ${errors.schoolYearId ? 'border-red-500 ring-red-200' : 'border-green-200 focus:border-green-500 focus:ring-green-200'}`}>
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
                  {errors.schoolYearId && (
                    <p className="text-red-500 text-base mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {errors.schoolYearId}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-base font-medium mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <School className="h-4 w-4" />
                    ផ្នែក
                  </label>
                  <Input
                    value={newCourse.section}
                    onChange={(e) => {
                      setNewCourse({...newCourse, section: e.target.value})
                      if (errors.section) setErrors(prev => ({ ...prev, section: '' }))
                    }}
                    placeholder="ឧ. A, B, C"
                    className={`h-12 text-base ${errors.section ? 'border-red-500 ring-red-200' : 'border-green-200 focus:border-green-500 focus:ring-green-200'}`}
                  />
                  {errors.section && (
                    <p className="text-red-500 text-base mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {errors.section}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-base font-medium mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    ជ្រើសរើសថ្នាក់
                  </label>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={gradeRange.startGrade.toString()} 
                      onValueChange={(value) => setGradeRange({...gradeRange, startGrade: parseInt(value)})}
                    >
                      <SelectTrigger className="h-12 text-base border-green-200 focus:border-green-500 focus:ring-green-200">
                        <SelectValue placeholder="ថ្នាក់ចាប់ផ្តើម" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            ថ្នាក់ទី {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-green-600 dark:text-green-400 font-medium">ទៅ</span>
                    
                    <Select 
                      value={gradeRange.endGrade.toString()} 
                      onValueChange={(value) => setGradeRange({...gradeRange, endGrade: parseInt(value)})}
                    >
                      <SelectTrigger className="h-12 text-base border-green-200 focus:border-green-500 focus:ring-green-200">
                        <SelectValue placeholder="ថ្នាក់បញ្ចប់" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            ថ្នាក់ទី {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    ថ្នាក់ដែលនឹងត្រូវបង្កើត
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {(() => {
                      const grades = [];
                      for (let i = gradeRange.startGrade; i <= gradeRange.endGrade; i++) {
                        grades.push(i);
                      }
                      return grades.map((grade) => (
                        <div key={grade} className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 text-center">
                          <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                            ថ្នាក់ទី {grade}{newCourse.section}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  <p className="text-base text-blue-600 dark:text-blue-400 mt-3">
                    សរុប: {gradeRange.endGrade - gradeRange.startGrade + 1} ថ្នាក់
                  </p>
                </div>
              </div>
              
              {/* Validation Message */}
              {gradeRange.startGrade > gradeRange.endGrade && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-base text-red-700 dark:text-red-300">
                      ថ្នាក់ចាប់ផ្តើមមិនអាចធំជាងថ្នាក់បញ្ចប់បានទេ។ សូមជ្រើសរើសថ្នាក់ឡើងវិញ។
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowMultipleCourseForm(false)
                    setErrors({})
                    setNewCourse({ schoolYearId: '', grade: '', section: '', courseName: '', teacherId1: undefined, teacherId2: undefined, teacherId3: undefined })
                    setGradeRange({ startGrade: 1, endGrade: 12 })
                  }}
                  className="px-6 py-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  បោះបង់
                </Button>
                <Button 
                  onClick={handleBulkCreateCourses}
                  disabled={!newCourse.schoolYearId || !newCourse.section.trim() || submitting || gradeRange.startGrade > gradeRange.endGrade}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  បង្កើតថ្នាក់ទី {gradeRange.startGrade}-{gradeRange.endGrade}
                </Button>
              </div>
            </div>
          )}

          {/* Edit Course Form */}
          {editingCourse && (
            <div className="mb-3 border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
              <h3 className="text-lg font-semibold mb-3 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                <Edit className="h-5 w-5" />
                កែប្រែថ្នាក់រៀន: ថ្នាក់ទី {editingCourse.grade} {editingCourse.section}
              </h3>
              <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-base text-orange-700 dark:text-orange-300">
                  💡 <strong>ចំណាំ:</strong> ឈ្មោះថ្នាក់នឹងត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិពីថ្នាក់ និងផ្នែកដែលអ្នកជ្រើសរើស។
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
                  <Select 
                    value={editingCourse.schoolYearId.toString()} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, schoolYearId: parseInt(value)})}
                  >
                    <SelectTrigger className={errors.schoolYearId ? 'border-red-500' : ''}>
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
                  {errors.schoolYearId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.schoolYearId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">ថ្នាក់</label>
                  <Select 
                    value={editingCourse.grade} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, grade: value})}
                  >
                    <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                      <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          ថ្នាក់ទី {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.grade && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.grade}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">ផ្នែក</label>
                  <Input
                    value={editingCourse.section || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, section: e.target.value})}
                    placeholder="ឧ. A, B, C"
                    className={errors.section ? 'border-red-500' : ''}
                  />
                  {errors.section && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.section}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី១</label>
                  <Select 
                    value={editingCourse.teacherId1?.toString() || 'none'} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, teacherId1: value === 'none' ? undefined : parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសគ្រូទី១" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {safeTeachers.map((teacher) => (
                        <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{teacher.lastname}{teacher.firstname}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី២</label>
                  <Select 
                    value={editingCourse.teacherId2?.toString() || 'none'} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, teacherId2: value === 'none' ? undefined : parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសគ្រូទី២" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {safeTeachers.map((teacher) => (
                        <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{teacher.lastname}{teacher.firstname}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី៣</label>
                  <Select 
                    value={editingCourse.teacherId3?.toString() || 'none'} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, teacherId3: value === 'none' ? undefined : parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសគ្រូទី៣" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {safeTeachers.map((teacher) => (
                        <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{teacher.lastname}{teacher.firstname}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <Button 
                  variant="outline" 
                  onClick={cancelEditCourse}
                  disabled={submitting}
                >
                  បោះបង់
                </Button>
                <Button 
                  onClick={handleEditCourse} 
                  disabled={submitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  រក្សាទុក
                </Button>
              </div>
            </div>
          )}

          {/* Modern Search and Filter Section */}
          <div className="mb-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="ស្វែងរកថ្នាក់រៀន..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base border-gray-200 focus:border-gray-500 focus:ring-gray-200 dark:border-purple-800 dark:focus:border-purple-400"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-purple-600" />
                  <span className="text-base font-medium text-purple-700 dark:text-purple-300">ច្រោះ:</span>
                </div>
                
                <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
                  <SelectTrigger className="w-48 h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-200 dark:border-purple-800">
                    <SelectValue placeholder="ឆ្នាំសិក្សា" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ទាំងអស់ឆ្នាំ</SelectItem>
                    {schoolYears.map((year) => (
                      <SelectItem key={year.schoolYearId} value={year.schoolYearId.toString()}>
                        {year.schoolYearCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedSchoolYear('all')
                  }}
                  className="h-10 px-4 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  កំណត់ឡើងវិញ
                </Button>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between text-base">
                <span className="text-purple-700 dark:text-purple-300">
                  បានរកឃើញ <strong>{filteredCourses.length}</strong> ថ្នាក់រៀន
                </span>
                {selectedSchoolYear !== 'all' && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                    ឆ្នាំសិក្សា: {schoolYears.find(year => year.schoolYearId.toString() === selectedSchoolYear)?.schoolYearCode}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {/* Course Display Section */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="max-w-md mx-auto">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {searchTerm || selectedSchoolYear !== 'all' 
                    ? 'គ្មានថ្នាក់រៀនដែលត្រូវនឹងលក្ខណៈសម្បត្តិទេ'
                    : 'គ្មានថ្នាក់រៀនទេ'
                  }
                </h3>
                
                <p className="text-base text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  {searchTerm || selectedSchoolYear !== 'all' 
                    ? 'សូមព្យាយាមជ្រើសរើសលក្ខណៈសម្បត្តិផ្សេង ឬលុបការស្វែងរកចេញ'
                    : 'ចុចប៊ូតុង "បន្ថែមថ្នាក់" ដើម្បីចាប់ផ្តើមបង្កើតថ្នាក់រៀនថ្មី'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {searchTerm && (
                    <Button
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                      className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                      លុបការស្វែងរក
                    </Button>
                  )}
                  
                  {selectedSchoolYear !== 'all' && (
                    <Button
                      variant="outline" 
                      onClick={() => setSelectedSchoolYear('all')}
                      className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300"
                    >
                      <Filter className="h-4 w-4" />
                      បង្ហាញទាំងអស់
                    </Button>
                  )}
                  
                  {!searchTerm && selectedSchoolYear === 'all' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => setShowCourseForm(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Plus className="h-4 w-4" />
                        បន្ថែមថ្នាក់ថ្មី
                      </Button>
                      <Button
                        onClick={() => setShowMultipleCourseForm(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Plus className="h-4 w-4" />
                        បង្កើតថ្នាក់រៀនច្រើនក្នុងពេលតែមួយ
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                    <School className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      ថ្នាក់រៀន
                    </h3>
                    <p className="text-base text-purple-600 dark:text-purple-400">
                      សរុប {filteredCourses.length} ថ្នាក់
                    </p>
                  </div>
                </div>
                
                  <div className="flex items-center space-x-3">
                    {/* View Mode Toggle */}
                    <div className="text-right">
                      <p className="text-base text-purple-600 dark:text-purple-400 mb-1">បង្ហាញជា</p>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="h-8 px-3 text-base bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Grid3X3 className="h-3 w-3 mr-1" />
                          ក្រឡា
                        </Button>
                        <Button
                          variant={viewMode === 'table' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('table')}
                          className="h-8 px-3 text-base bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <List className="h-3 w-3 mr-1" />
                          បញ្ជី
                        </Button>
                      </div>
                    </div>
                  </div>
              </div>
                    
              {/* Courses Display - Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCourses.map((course) => (
                    <div key={course.courseId} className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Top Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 shadow-lg">
                          <School className="h-3 w-3 mr-1" />
                          ថ្នាក់ទី {course.grade} {course.section}
                        </Badge>
                      </div>

                      {/* Course Header */}
                      <div className="relative z-10 mb-3 pr-20">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-xl leading-tight">
                            {course.courseName || `ថ្នាក់ទី ${course.grade} ${course.section}`}
                          </h4>
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="relative z-10 space-y-3 mb-3">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 text-base flex items-center gap-2">
                            <UserCheck className="h-3 w-3" />
                            គ្រូទី១:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-base">
                            {(() => {
                              const teacher = safeTeachers.find(t => t.userid === course.teacherId1)
                              if (!teacher) return <span className="text-gray-400">គ្មានគ្រូ</span>
                              return (
                                <div className="text-right">
                                  <div className="font-medium">{teacher.lastname}{teacher.firstname}</div>
                                </div>
                              )
                            })()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 text-base flex items-center gap-2">
                            <UserCheck className="h-3 w-3" />
                            គ្រូទី២:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-base">
                            {(() => {
                              const teacher = safeTeachers.find(t => t.userid === course.teacherId2)
                              if (!teacher) return <span className="text-gray-400">គ្មានគ្រូ</span>
                              return (
                                <div className="text-right">
                                  <div className="font-medium">{teacher.lastname}{teacher.firstname}</div>
                                </div>
                              )
                            })()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 text-base flex items-center gap-2">
                            <UserCheck className="h-3 w-3" />
                            គ្រូទី៣:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-base">
                            {(() => {
                              const teacher = safeTeachers.find(t => t.userid === course.teacherId3)
                              if (!teacher) return <span className="text-gray-400">គ្មានគ្រូ</span>
                              return (
                                <div className="text-right">
                                  <div className="font-medium">{teacher.lastname}{teacher.firstname}</div>
                                </div>
                              )
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Course Footer */}
                      <div className="relative z-10 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            បង្កើត: {new Date(course.createdAt).toLocaleDateString('km-KH')}
                          </span>
                          {course.updatedAt && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              ធ្វើបច្ចុប្បន្នភាព: {new Date(course.updatedAt).toLocaleDateString('km-KH')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 shadow-lg"
                          disabled={submitting}
                          onClick={() => startEditCourse(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.courseId)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-lg"
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Courses Display - List View */}
              {viewMode === 'table' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <School className="h-4 w-4" />
                              <span>ថ្នាក់រៀន</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <UserCheck className="h-4 w-4" />
                              <span>គ្រូបង្រៀន</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>ឆ្នាំសិក្សា</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>កាលបរិច្ឆេទបង្កើត</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <MoreHorizontal className="h-4 w-4" />
                              <span>សកម្មភាព</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCourses.map((course) => (
                          <tr key={course.courseId} className="hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                                  <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-purple-600 dark:text-purple-400">
                                    ថ្នាក់ទី {course.grade}{course.section}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                {course.teacherId1 && (() => {
                                  const teacher = safeTeachers.find(t => t.userid === course.teacherId1)
                                  return teacher ? (
                                    <div className="text-base text-gray-900 dark:text-white">
                                      គ្រូទី១: {teacher.lastname}{teacher.firstname}
                                    </div>
                                  ) : null
                                })()}
                                {course.teacherId2 && (() => {
                                  const teacher = safeTeachers.find(t => t.userid === course.teacherId2)
                                  return teacher ? (
                                    <div className="text-base text-gray-900 dark:text-white">
                                      គ្រូទី២: {teacher.lastname}{teacher.firstname}
                                    </div>
                                  ) : null
                                })()}
                                {course.teacherId3 && (() => {
                                  const teacher = safeTeachers.find(t => t.userid === course.teacherId3)
                                  return teacher ? (
                                    <div className="text-base text-gray-900 dark:text-white">
                                      គ្រូទី៣: {teacher.lastname}{teacher.firstname}
                                    </div>
                                  ) : null
                                })()}
                                {!course.teacherId1 && !course.teacherId2 && !course.teacherId3 && (
                                  <div className="text-base text-gray-400">គ្មានគ្រូ</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                <span>
                                  {schoolYears.find(year => year.schoolYearId.toString() === course.schoolYearId.toString())?.schoolYearCode || '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-purple-500" />
                                <span>{new Date(course.createdAt).toLocaleDateString('km-KH')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                  disabled={submitting}
                                  onClick={() => startEditCourse(course)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  កែប្រែ
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCourse(course.courseId)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  disabled={submitting}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  លុប
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        </Card>
      </div>
      {/* Subjects Section */}
      <div className="relative mb-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-emerald-50/20 to-green-50/20 dark:from-green-950/10 dark:via-emerald-950/10 dark:to-green-950/10 rounded-3xl -z-10" />
        
        <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Enhanced Header */}
          <CardHeader className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white p-6">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">មុខវិជ្ជា</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {subjects.length} មុខវិជ្ជា
                    </Badge>
                    <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowSubjectForm(!showSubjectForm)}
                className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                variant="ghost"
              >
                <div className="flex items-center gap-2">
                  {showSubjectForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  <span>{showSubjectForm ? 'បោះបង់' : 'បន្ថែមមុខវិជ្ជា'}</span>
                </div>
              </Button>
            </div>
          </CardHeader>
                  <CardContent className="p-6">
            {/* Modern Search and Filter Section for Subjects */}
          <div className="mb-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400 dark:text-green-500" />
                  <Input
                    placeholder="ស្វែងរកមុខវិជ្ជា..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base border-green-200 focus:border-green-500 focus:ring-green-200 dark:border-green-800 dark:focus:border-green-400"
                  />
                </div>
              </div>
              
              {/* Results Summary */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-base text-green-700 dark:text-green-300">
                    បានរកឃើញ <strong>{filteredSubjects.length}</strong> មុខវិជ្ជា
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="h-10 px-4 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  កំណត់ឡើងវិញ
                </Button>
              </div>
            </div>
          </div>

          {showSubjectForm && (
            <div className="mb-3 border-2 border-dashed border-green-300 rounded-xl p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30 shadow-inner">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  បន្ថែមមុខវិជ្ជាថ្មី
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-base font-medium mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    ឈ្មោះមុខវិជ្ជា
                  </label>
                  <Input
                    value={newSubject.subjectName}
                    onChange={(e) => {
                      setNewSubject({...newSubject, subjectName: e.target.value})
                      if (errors.subjectName) setErrors(prev => ({ ...prev, subjectName: '' }))
                    }}
                    placeholder="ឧ. គណិតវិទ្យា"
                    className={`h-12 text-lg ${errors.subjectName ? 'border-red-500 ring-red-200' : 'border-green-200 focus:border-green-500 focus:ring-green-200'}`}
                  />
                  {errors.subjectName && (
                    <p className="text-red-500 text-base mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {errors.subjectName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSubjectForm(false)
                    setErrors({})
                    setNewSubject({ subjectName: '' })
                  }}
                  className="px-6 py-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  បោះបង់
                </Button>
                <Button 
                  onClick={handleAddSubject} 
                  disabled={submitting}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  បន្ថែមមុខវិជ្ជា
                </Button>
              </div>
            </div>
          )}

          {/* Edit Subject Form */}
          {editingSubject && (
            <div className="mb-3 border-2 border-dashed border-blue-300 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 shadow-inner">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  កែប្រែមុខវិជ្ជា
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-base font-medium mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    ឈ្មោះមុខវិជ្ជា
                  </label>
                  <Input
                    value={editSubjectName}
                    onChange={(e) => setEditSubjectName(e.target.value)}
                    placeholder="បញ្ចូលឈ្មោះមុខវិជ្ជា"
                    className="h-12 border-blue-200 focus:border-blue-500 dark:border-blue-700 dark:focus:border-blue-400"
                  />
                  {errors.subjectName && (
                    <p className="text-red-500 text-base mt-1">{errors.subjectName}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={cancelEditSubject}
                  className="px-6 py-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  បោះបង់
                </Button>
                <Button
                  onClick={handleEditSubject}
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  កែប្រែមុខវិជ្ជា
                </Button>
              </div>
            </div>
          )}

          {filteredSubjects.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="max-w-md mx-auto">
                <div className="relative mb-3">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  គ្មានមុខវិជ្ជាទេ
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  ចុចប៊ូតុង &quot;បន្ថែមមុខវិជ្ជា&quot; ដើម្បីចាប់ផ្តើមបង្កើតមុខវិជ្ជាថ្មី
                </p>
                
                <Button
                  onClick={() => setShowSubjectForm(true)}
                  className="items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  បន្ថែមមុខវិជ្ជាថ្មី
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subjects Display Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                    <BookOpenCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                      មុខវិជ្ជា
                    </h3>
                    <p className="text-base text-green-600 dark:text-green-400">
                      សរុប {filteredSubjects.length} មុខវិជ្ជា
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">បង្ហាញជា</p>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 px-3 text-sm bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Grid3X3 className="h-3 w-3 mr-1" />
                        ក្រឡា
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="h-8 px-3 text-sm bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <List className="h-3 w-3 mr-1" />
                        បញ្ជី
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subjects Display - Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSubjects.map((subject) => (
                    <div key={subject.subjectId} className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Top Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                          <BookOpen className="h-3 w-3 mr-1" />
                          មុខវិជ្ជា
                        </Badge>
                      </div>

                      {/* Subject Header */}
                      <div className="relative z-10 mb-3 pr-20">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                            <BookOpenCheck className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                            {subject.subjectName}
                          </h3>
                        </div>
                      </div>

                      {/* Subject Details */}
                      <div className="relative z-10 space-y-3 mb-3">
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <span className="text-green-700 dark:text-green-300 text-base font-medium">
                              ឈ្មោះមុខវិជ្ជា
                            </span>
                            <span className="text-green-800 dark:text-green-200 text-base font-semibold">
                              {subject.subjectName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Subject Footer */}
                      <div className="relative z-10 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            បង្កើត: {new Date(subject.createdAt).toLocaleDateString('km-KH')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditSubject(subject)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 shadow-lg"
                          disabled={submitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubject(subject.subjectId)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-lg"
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subjects Display - List View */}
              {viewMode === 'table' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4" />
                              <span>មុខវិជ្ជា</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>កាលបរិច្ឆេទបង្កើត</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <MoreHorizontal className="h-4 w-4" />
                              <span>សកម្មភាព</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredSubjects.map((subject, index) => (
                          <tr key={subject.subjectId} className="hover:bg-green-50 dark:hover:bg-green-950/10 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                                  <BookOpenCheck className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="text-base font-medium text-gray-900 dark:text-white">
                                    {subject.subjectName}
                                  </div>
                                  <div className="text-sm text-green-600 dark:text-green-400">
                                    មុខវិជ្ជា
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-green-500" />
                                <span>{new Date(subject.createdAt).toLocaleDateString('km-KH')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditSubject(subject)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                  disabled={submitting}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  កែប្រែ
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSubject(subject.subjectId)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  disabled={submitting}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  លុប
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              តើអ្នកយល់ព្រមលុបមែនទេ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              អ្នកកំពុងព្យាយាមលុប <span className="font-semibold text-red-600">{deleteItemName}</span>។ 
              សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              បោះបង់
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={submitting}
              className="px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  កំពុងលុប...
                </div>
              ) : (
                'លុប'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Create Confirmation Dialog */}
      <AlertDialog open={bulkCreateConfirmOpen} onOpenChange={setBulkCreateConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              បញ្ជាក់ការបង្កើតថ្នាក់រៀន
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              តើអ្នកប្រាកដជាចង់បង្កើតថ្នាក់ទី {gradeRange.startGrade}-{gradeRange.endGrade} ផ្នែក {newCourse.section} សម្រាប់ឆ្នាំសិក្សានេះមែនទេ?
              <br /><br />
              <span className="font-semibold text-blue-600">ថ្នាក់ដែលនឹងត្រូវបង្កើត: {coursesToCreate.length} ថ្នាក់</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={() => setBulkCreateConfirmOpen(false)}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              បោះបង់
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkCreate}
              disabled={submitting}
              className="px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  កំពុងបង្កើត...
                </div>
              ) : (
                'បង្កើតថ្នាក់រៀន'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Existing Courses Warning Dialog */}
      <AlertDialog open={existingCoursesWarningOpen} onOpenChange={setExistingCoursesWarningOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              ថ្នាក់រៀនមានរួចហើយ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span>ថ្នាក់ខាងក្រោមមានរួចហើយ:</span>
              <br /><br />
              <span className="inline-block bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                {existingCoursesList.map((course, index) => (
                  <span key={index} className="block text-base font-medium text-orange-800 dark:text-orange-200">
                    • {course}
                  </span>
                ))}
              </span>
              <br /><br />
              <span>តើអ្នកចង់បន្តបង្កើតថ្នាក់ដែលនៅសល់ ({coursesToCreate.length} ថ្នាក់) មែនទេ?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={() => setExistingCoursesWarningOpen(false)}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              បោះបង់
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkCreate}
              disabled={submitting}
              className="px-4 py-2 text-base font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  កំពុងបង្កើត...
                </div>
              ) : (
                'បន្តបង្កើត'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Course Creation Confirmation Dialog */}
      <AlertDialog open={singleCreateConfirmOpen} onOpenChange={setSingleCreateConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              បញ្ជាក់ការបង្កើតថ្នាក់រៀន
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              តើអ្នកប្រាកដជាចង់បង្កើតថ្នាក់ទី {singleCourseData?.grade} ផ្នែក {singleCourseData?.section} សម្រាប់ឆ្នាំសិក្សានេះមែនទេ?
              <br /><br />
              <span className="font-semibold text-blue-600">ឈ្មោះថ្នាក់: {singleCourseData?.courseName || `ថ្នាក់ទី ${singleCourseData?.grade} ${singleCourseData?.section}`}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={() => setSingleCreateConfirmOpen(false)}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              បោះបង់
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSingleCreate}
              disabled={submitting}
              className="px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  កំពុងបង្កើត...
                </div>
              ) : (
                'បង្កើតថ្នាក់រៀន'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Course Warning Dialog */}
      <AlertDialog open={duplicateCourseWarningOpen} onOpenChange={setDuplicateCourseWarningOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-red-600 dark:text-red-400">
              ថ្នាក់រៀនមានរួចហើយ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span>ថ្នាក់ទី {duplicateCourseData?.grade} ផ្នែក {duplicateCourseData?.section} មានរួចហើយសម្រាប់ឆ្នាំសិក្សា {duplicateCourseData?.schoolYear}។</span>
              <br /><br />
              <span className="font-semibold text-orange-600">សូមជ្រើសរើសថ្នាក់ ឬផ្នែកផ្សេងទៀត។</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setDuplicateCourseWarningOpen(false)}
              className="px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              យល់ព្រម
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate School Year Warning Dialog */}
      <AlertDialog open={duplicateSchoolYearWarningOpen} onOpenChange={setDuplicateSchoolYearWarningOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-red-600 dark:text-red-400">
              ឆ្នាំសិក្សាមានរួចហើយ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span>ឆ្នាំសិក្សា {duplicateSchoolYearData?.schoolYearCode} មានរួចហើយក្នុងប្រព័ន្ធ។</span>
              <br /><br />
              <span className="font-semibold text-orange-600">សូមជ្រើសរើសឆ្នាំសិក្សាផ្សេងទៀត។</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setDuplicateSchoolYearWarningOpen(false)}
              className="px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              យល់ព្រម
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Subject Warning Dialog */}
      <AlertDialog open={duplicateSubjectWarningOpen} onOpenChange={setDuplicateSubjectWarningOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-red-600 dark:text-red-400">
              មុខវិជ្ជាមានរួចហើយ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span>មុខវិជ្ជា {duplicateSubjectData?.subjectName} មានរួចហើយក្នុងប្រព័ន្ធ។</span>
              <br /><br />
              <span className="font-semibold text-orange-600">សូមជ្រើសរើសឈ្មោះមុខវិជ្ជាផ្សេងទៀត។</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setDuplicateSubjectWarningOpen(false)}
              className="px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              យល់ព្រម
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}