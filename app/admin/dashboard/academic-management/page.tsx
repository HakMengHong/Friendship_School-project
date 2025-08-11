'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  EyeOff
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  // Filter and search state
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Loading states
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
        fetch('/api/admin/school-years'),
        fetch('/api/admin/subjects'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/users')
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
        setTeachers(teachersData.users)
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

    try {
      setSubmitting(true)
      setErrors({})

      const response = await fetch('/api/admin/school-years', {
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
        throw new Error('Failed to add school year')
      }
    } catch (error) {
      console.error('Error adding school year:', error)
      toast({
        title: "កំហុសក្នុងការបន្ថែមឆ្នាំសិក្សា",
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
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

    try {
      setSubmitting(true)
      setErrors({})

      const response = await fetch('/api/admin/subjects', {
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
        throw new Error('Failed to add subject')
      }
    } catch (error) {
      console.error('Error adding subject:', error)
      toast({
        title: "កំហុសក្នុងការបន្ថែមមុខវិជ្ជា",
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
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

    try {
      setSubmitting(true)
      setErrors({})

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCourse,
          section: newCourse.section.trim(),
          courseName: newCourse.courseName.trim() || `ថ្នាក់ទី ${newCourse.grade} ${newCourse.section}`
        })
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
        throw new Error('Failed to add course')
      }
    } catch (error) {
      console.error('Error adding course:', error)
      toast({
        title: "កំហុសក្នុងការបន្ថែមថ្នាក់រៀន",
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
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

    try {
      setSubmitting(true)
      setErrors({})

      const response = await fetch(`/api/admin/courses/${editingCourse.courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingCourse,
          section: editingCourse.section?.trim(),
          courseName: editingCourse.courseName?.trim() || `ថ្នាក់ទី ${editingCourse.grade} ${editingCourse.section}`
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
        throw new Error('Failed to update course')
      }
    } catch (error) {
      console.error('Error updating course:', error)
      toast({
        title: "កំហុសក្នុងការធ្វើបច្ចុប្បន្នភាពថ្នាក់រៀន",
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Start editing course
  const startEditCourse = (course: Course) => {
    setEditingCourse(course)
    setErrors({})
  }

  // Cancel editing course
  const cancelEditCourse = () => {
    setEditingCourse(null)
    setErrors({})
  }

  // Delete functions
  const handleDeleteYear = async (id: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបឆ្នាំសិក្សានេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។')) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/school-years/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSchoolYears(prev => prev.filter(year => year.schoolYearId !== id))
        toast({
          title: "បានលុបឆ្នាំសិក្សាដោយជោគជ័យ",
          description: "ឆ្នាំសិក្សាត្រូវបានលុបចេញពីប្រព័ន្ធ",
        })
      } else {
        throw new Error('Failed to delete school year')
      }
    } catch (error) {
      console.error('Error deleting school year:', error)
      toast({
        title: "កំហុសក្នុងការលុបឆ្នាំសិក្សា",
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបមុខវិជ្ជានេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។')) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/subjects/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSubjects(prev => prev.filter(subject => subject.subjectId !== id))
        toast({
          title: "បានលុបមុខវិជ្ជាដោយជោគជ័យ",
          description: "មុខវិជ្ជាត្រូវបានលុបចេញពីប្រព័ន្ធ",
        })
      } else {
        throw new Error('Failed to delete subject')
      }
    } catch (error) {
      console.error('Error deleting subject:', error)
      toast({
        title: "កំហុសក្នុងការលុបមុខវិជ្ជា",
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបថ្នាក់រៀននេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។')) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCourses(prev => prev.filter(course => course.courseId !== id))
        toast({
          title: "បានលុបថ្នាក់រៀនដោយជោគជ័យ",
          description: "ថ្នាក់រៀនត្រូវបានលុបចេញពីប្រព័ន្ធ",
        })
      } else {
        throw new Error('Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      toast({
        title: "កំហុសក្នុងការលុបថ្នាក់រៀន",
        description: "សូមព្យាយាមម្តងទៀត",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
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

    if (!confirm(`តើអ្នកប្រាកដជាចង់បង្កើតថ្នាក់ទី 1-12 ផ្នែក ${newCourse.section} សម្រាប់ឆ្នាំសិក្សានេះមែនទេ?`)) {
      return
    }

    try {
      setSubmitting(true)
      const coursesToCreate = []
      for (let grade = 1; grade <= 12; grade++) {
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

      // Create courses one by one
      const createdCourses: Course[] = []
      for (const courseData of coursesToCreate) {
        const response = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData)
        })

        if (response.ok) {
          const createdCourse = await response.json()
          createdCourses.push(createdCourse)
        }
      }

      if (createdCourses.length > 0) {
        // Add new courses to state
        setCourses(prev => [...createdCourses, ...prev])
        
        // Clear form
        setNewCourse({ schoolYearId: '', grade: '', section: '', courseName: '', teacherId1: undefined, teacherId2: undefined, teacherId3: undefined })
        
        toast({
          title: "បានបង្កើតថ្នាក់រៀនដោយជោគជ័យ",
          description: `បានបង្កើតថ្នាក់រៀន ${createdCourses.length} ថ្នាក់ដោយជោគជ័យ!`,
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
      <div className="max-w-7xl mx-auto space-y-6 p-6">
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
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ការគ្រប់គ្រងវិញ្ញាបនបត្រ
        </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            គ្រប់គ្រងឆ្នាំសិក្សា ថ្នាក់រៀន និងមុខវិជ្ជា
          </p>
        </div>
        <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-sm">
          ប្រព័ន្ធគ្រប់គ្រងសាលា
        </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            ផ្ទុកឡើងវិញ
          </Button>
        </div>
      </div>
      
      {/* Error Display */}
      {errors.fetch && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{errors.fetch}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ស្វែងរកថ្នាក់រៀន ផ្នែក ឬមុខវិជ្ជា..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="ឆ្នាំសិក្សា" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ទាំងអស់</SelectItem>
                  {schoolYears.map((year) => (
                    <SelectItem key={year.schoolYearId} value={year.schoolYearId.toString()}>
                      {year.schoolYearCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-l-none"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Years Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>ឆ្នាំសិក្សា</span>
            <Badge variant="secondary" className="ml-2">
              {schoolYears.length}
            </Badge>
          </CardTitle>
          <Button 
            onClick={() => setShowYearForm(!showYearForm)}
            className="flex items-center gap-2"
            variant={showYearForm ? "outline" : "default"}
          >
            {showYearForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showYearForm ? 'បោះបង់' : 'បន្ថែមឆ្នាំ'}
          </Button>
        </CardHeader>
        <CardContent>
          {showYearForm && (
            <div className="mb-6 border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 dark:bg-blue-950/20">
              <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">
                បន្ថែមឆ្នាំសិក្សាថ្មី
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    ឆ្នាំសិក្សា
                  </label>
                  <Input
                    value={newYear.schoolYearCode}
                    onChange={(e) => {
                      setNewYear({...newYear, schoolYearCode: e.target.value})
                      if (errors.year) setErrors(prev => ({ ...prev, year: '' }))
                    }}
                    placeholder="ឧ. 2024-2025"
                    className={errors.year ? 'border-red-500' : ''}
                  />
                  {errors.year && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.year}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowYearForm(false)
                    setErrors({})
                    setNewYear({ schoolYearCode: '' })
                  }}
                >
                  បោះបង់
                </Button>
                <Button onClick={handleAddYear} disabled={submitting}>
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

          {schoolYears.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>គ្មានឆ្នាំសិក្សាទេ</p>
              <p className="text-sm">ចុចប៊ូតុង "បន្ថែមឆ្នាំ" ដើម្បីចាប់ផ្តើម</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolYears.map((year) => (
                <div key={year.schoolYearId} className="group border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{year.schoolYearCode}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteYear(year.schoolYearId)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  បង្កើត: {new Date(year.createdAt).toLocaleDateString('km-KH')}
                </p>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Courses Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <span>ថ្នាក់រៀន</span>
          </CardTitle>
          <Button 
            onClick={() => setShowCourseForm(!showCourseForm)}
            className="flex items-center gap-2"
          >
            {showCourseForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCourseForm ? 'បោះបង់' : 'បន្ថែមថ្នាក់'}
          </Button>
        </CardHeader>
        <CardContent>
          
          {showCourseForm && (
            <div className="mb-6 border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50 dark:bg-purple-950/20">
              <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300">
                បន្ថែមថ្នាក់រៀនថ្មី
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
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
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.schoolYearId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ថ្នាក់</label>
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
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.grade}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ផ្នែក</label>
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
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.section}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ឈ្មោះថ្នាក់</label>
                  <Input
                    value={newCourse.courseName}
                    onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                    placeholder="ឧ. ថ្នាក់ទី 1A (ស្រេចចិត្ត)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី១</label>
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
                      {teachers.length === 0 && !loading ? (
                        <SelectItem value="no-teachers" disabled>
                          គ្មានគ្រូដែលអាចជ្រើសរើសបានទេ
                        </SelectItem>
                      ) : (
                        teachers.map((teacher) => (
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី២</label>
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
                      {teachers.length === 0 && !loading ? (
                        <SelectItem value="no-teachers" disabled>
                          គ្មានគ្រូដែលអាចជ្រើសរើសបានទេ
                        </SelectItem>
                      ) : (
                        teachers.map((teacher) => (
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី៣</label>
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
                      {teachers.length === 0 && !loading ? (
                        <SelectItem value="no-teachers" disabled>
                          គ្មានគ្រូដែលអាចជ្រើសរើសបានទេ
                        </SelectItem>
                      ) : (
                        teachers.map((teacher) => (
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

          {/* Bulk Course Creation Section */}
          <div className="mb-6 border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 dark:bg-blue-950/20">
            <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              បង្កើតថ្នាក់រៀនច្រើនក្នុងពេលតែមួយ
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
              បង្កើតថ្នាក់ទី 1-12 សម្រាប់ឆ្នាំសិក្សានិងផ្នែកជាក់លាក់
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
                <Select value={newCourse.schoolYearId} onValueChange={(value) => setNewCourse({...newCourse, schoolYearId: value})}>
                  <SelectTrigger>
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
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ផ្នែក</label>
                <Input
                  value={newCourse.section}
                  onChange={(e) => setNewCourse({...newCourse, section: e.target.value})}
                  placeholder="ឧ. A, B, C"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ថ្នាក់ដែលត្រូវបង្កើត</label>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-md border">
                  ថ្នាក់ទី 1-12 (ផ្នែក {newCourse.section || 'A'})
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleBulkCreateCourses}
                disabled={!newCourse.schoolYearId || !newCourse.section.trim() || submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                <Plus className="h-4 w-4 mr-2" />
                )}
                បង្កើតថ្នាក់ទី 1-12
              </Button>
            </div>
          </div>

          {/* Edit Course Form */}
          {editingCourse && (
            <div className="mb-6 border-2 border-dashed border-orange-300 rounded-lg p-6 bg-orange-50 dark:bg-orange-950/20">
              <h3 className="text-lg font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                <Edit className="h-5 w-5" />
                កែប្រែថ្នាក់រៀន: ថ្នាក់ទី {editingCourse.grade} {editingCourse.section}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
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
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.schoolYearId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ថ្នាក់</label>
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
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.grade}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ផ្នែក</label>
                  <Input
                    value={editingCourse.section || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, section: e.target.value})}
                    placeholder="ឧ. A, B, C"
                    className={errors.section ? 'border-red-500' : ''}
                  />
                  {errors.section && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.section}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ឈ្មោះថ្នាក់</label>
                  <Input
                    value={editingCourse.courseName || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, courseName: e.target.value})}
                    placeholder="ឧ. ថ្នាក់ទី 1A (ស្រេចចិត្ត)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី១</label>
                  <Select 
                    value={editingCourse.teacherId1?.toString() || 'none'} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, teacherId1: value === 'none' ? undefined : parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសគ្រូទី១" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {teachers.map((teacher) => (
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី២</label>
                  <Select 
                    value={editingCourse.teacherId2?.toString() || 'none'} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, teacherId2: value === 'none' ? undefined : parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសគ្រូទី២" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {teachers.map((teacher) => (
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">គ្រូទី៣</label>
                  <Select 
                    value={editingCourse.teacherId3?.toString() || 'none'} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, teacherId3: value === 'none' ? undefined : parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសគ្រូទី៣" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">គ្មានគ្រូ</SelectItem>
                      {teachers.map((teacher) => (
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

          {/* School Year Filter */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ជ្រើសរើសឆ្នាំសិក្សាដើម្បីបង្ហាញថ្នាក់
              </label>
              <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="សូមជ្រើសរើសឆ្នាំសិក្សា" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ទាំងអស់</SelectItem>
                  {schoolYears.map((year) => (
                    <SelectItem key={year.schoolYearId} value={year.schoolYearId.toString()}>
                      {year.schoolYearCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Course Display Section */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">គ្មានថ្នាក់រៀនទេ</h3>
              <p className="text-sm mb-4">
                {searchTerm || selectedSchoolYear !== 'all' 
                  ? 'គ្មានថ្នាក់រៀនដែលត្រូវនឹងលក្ខណៈសម្បត្តិដែលបានជ្រើសរើសទេ'
                  : 'ចុចប៊ូតុង "បន្ថែមថ្នាក់" ដើម្បីចាប់ផ្តើមបង្កើតថ្នាក់រៀន'
                }
              </p>
              {searchTerm && (
                                  <Button
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="text-sm"
                >
                  លុបការស្វែងរក
                                  </Button>
              )}
                                </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  ថ្នាក់រៀន ({filteredCourses.length})
                </h3>
                <div className="text-sm text-gray-500">
                  {selectedSchoolYear !== 'all' && (
                    <span>
                      ឆ្នាំសិក្សា: {schoolYears.find(year => year.schoolYearId.toString() === selectedSchoolYear)?.schoolYearCode}
                    </span>
                  )}
                </div>
                    </div>
                    
              {/* Modern Card View for Courses */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCourses.map((course) => (
                  <div key={course.courseId} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600">
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs">
                        ថ្នាក់ទី {course.grade} {course.section}
                      </Badge>
                      </div>

                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-3 pr-16">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                          {course.courseName || `ថ្នាក់ទី ${course.grade} ${course.section}`}
                        </h4>
                  </div>
                    </div>

                    {/* Course Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">គ្រូទី១:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {(() => {
                            const teacher = teachers.find(t => t.userid === course.teacherId1)
                            if (!teacher) return '-'
                            return (
                              <div className="text-right">
                                <div className="font-medium">{teacher.lastname}{teacher.firstname}</div>
                              </div>
                            )
              })()}
                        </span>
            </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">គ្រូទី២:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
              {(() => {
                            const teacher = teachers.find(t => t.userid === course.teacherId2)
                            if (!teacher) return '-'
                return (
                              <div className="text-right">
                                <div className="font-medium">{teacher.lastname}{teacher.firstname}</div>
                              </div>
                            )
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">គ្រូទី៣:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {(() => {
                            const teacher = teachers.find(t => t.userid === course.teacherId3)
                            if (!teacher) return '-'
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
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>បង្កើត: {new Date(course.createdAt).toLocaleDateString('km-KH')}</span>
                        {course.updatedAt && (
                          <span>ធ្វើបច្ចុប្បន្នភាព: {new Date(course.updatedAt).toLocaleDateString('km-KH')}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                        className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        disabled={submitting}
                        onClick={() => startEditCourse(course)}
                                    >
                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteCourse(course.courseId)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
                        disabled={submitting}
                                    >
                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                    </div>
                ))}
                      </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Subjects Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <span>មុខវិជ្ជា</span>
            <Badge variant="secondary" className="ml-2">
              {subjects.length}
            </Badge>
          </CardTitle>
          <Button 
            onClick={() => setShowSubjectForm(!showSubjectForm)}
            className="flex items-center gap-2"
            variant={showSubjectForm ? "outline" : "default"}
          >
            {showSubjectForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showSubjectForm ? 'បោះបង់' : 'បន្ថែមមុខវិជ្ជា'}
          </Button>
        </CardHeader>
        <CardContent>
          {showSubjectForm && (
            <div className="mb-6 border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50 dark:bg-green-950/20">
              <h3 className="text-lg font-semibold mb-4 text-green-700 dark:text-green-300">
                បន្ថែមមុខវិជ្ជាថ្មី
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    ឈ្មោះមុខវិជ្ជា
                  </label>
                  <Input
                    value={newSubject.subjectName}
                    onChange={(e) => {
                      setNewSubject({...newSubject, subjectName: e.target.value})
                      if (errors.subjectName) setErrors(prev => ({ ...prev, subjectName: '' }))
                    }}
                    placeholder="ឧ. គណិតវិទ្យា"
                    className={errors.subjectName ? 'border-red-500' : ''}
                  />
                  {errors.subjectName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.subjectName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSubjectForm(false)
                    setErrors({})
                    setNewSubject({ subjectName: '' })
                  }}
                >
                  បោះបង់
                </Button>
                <Button onClick={handleAddSubject} disabled={submitting}>
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

          {filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>គ្មានមុខវិជ្ជាទេ</p>
              <p className="text-sm">ចុចប៊ូតុង "បន្ថែមមុខវិជ្ជា" ដើម្បីចាប់ផ្តើម</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map((subject) => (
                <div key={subject.subjectId} className="group border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{subject.subjectName}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubject(subject.subjectId)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  បង្កើត: {new Date(subject.createdAt).toLocaleDateString('km-KH')}
                </p>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
