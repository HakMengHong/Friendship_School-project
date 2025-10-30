"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  Printer, 
  FileText, 
  Calendar,
  BarChart3,
  TrendingUp,
  BookOpen,
  CheckCircle,
  X,
  GraduationCap,
  CalendarDays,
  Users,
  FileType,
  Award
} from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, User as AuthUser } from "@/lib/auth-service"

// Types
interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Course {
  courseId: number
  courseName: string
  grade: string
  section: string
  teacherId1: number | null
  teacherId2: number | null
  teacherId3: number | null
  schoolYear: {
    schoolYearId: number
    schoolYearCode: string
  }
}

interface GradeDate {
  month: string
  year: string
  displayText: string
}

interface ReportTypeConfig {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// Constants
const MONTH_NAMES = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
                     'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']

const REPORT_TYPES: ReportTypeConfig[] = [
    {
      id: "monthly",
      title: "របាយការណ៍ប្រចាំខែ",
      description: "របាយការណ៍សៀវភៅតាមដានប្រចាំខែ",
      icon: Calendar,
      color: "bg-blue-500"
    },
    {
      id: "semester", 
      title: "របាយការណ៍ប្រចាំឆមាស",
      description: "របាយការណ៍សៀវភៅតាមដានប្រចាំឆមាស",
      icon: BarChart3,
      color: "bg-green-500"
    },
    {
      id: "yearly",
      title: "របាយការណ៍ប្រចាំឆ្នាំ", 
      description: "របាយការណ៍សៀវភៅតាមដានប្រចាំឆ្នាំ",
      icon: TrendingUp,
      color: "bg-purple-500"
    }
  ]

export default function GradebookReportPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
        <GradebookReportContent />
      </div>
    </RoleGuard>
  )
}

function GradebookReportContent() {
  const { toast } = useToast()
  
  // UI State
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState("monthly")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Data State
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [gradeDates, setGradeDates] = useState<GradeDate[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  
  // Form State
  const [academicYear, setAcademicYear] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [semester, setSemester] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [format, setFormat] = useState("pdf")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // API Functions
  const fetchSchoolYears = useCallback(async () => {
    try {
      const response = await fetch('/api/school-years')
      if (!response.ok) return
      
      const data = await response.json()
      if (Array.isArray(data)) {
        setSchoolYears(data)
      }
    } catch (error) {
      console.error('Error fetching school years:', error)
    }
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      console.log('Fetching courses...')
      const response = await fetch('/api/courses')
      if (!response.ok) {
        console.error('Failed to fetch courses:', response.status)
        return
      }
      
      const data = await response.json()
      console.log('Courses data:', data)
      if (Array.isArray(data)) {
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }, [])

  const fetchGradeDates = useCallback(async () => {
    try {
      console.log('Fetching grade dates...')
      const response = await fetch('/api/grades')
      if (!response.ok) {
        console.error('Failed to fetch grades:', response.status)
        return
      }
      
      const text = await response.text()
      if (!text) {
        console.log('No grade data received')
        return
      }
      
      const grades = JSON.parse(text)
      console.log('Grades data:', grades)
      if (!Array.isArray(grades)) {
        console.log('Grades data is not an array')
        return
      }
      
      // Extract unique grade dates
      const uniqueDates = new Set<string>()
      grades.forEach((grade: any) => {
        if (grade.gradeDate && typeof grade.gradeDate === 'string') {
          uniqueDates.add(grade.gradeDate)
        }
      })
      
      console.log('Unique dates found:', Array.from(uniqueDates))
      
      // Convert MM/YY format to month/year objects
      const dateArray: GradeDate[] = Array.from(uniqueDates)
        .map(dateStr => {
          const [month, year] = dateStr.split('/')
          if (!month || !year) return null
          
          const monthName = MONTH_NAMES[parseInt(month) - 1] || month
          const fullYear = `20${year}`
          
          return {
            month: month,
            year: fullYear,
            displayText: monthName
          }
        })
        .filter(Boolean) as GradeDate[]
      
      // Sort by year and month (newest first)
      dateArray.sort((a, b) => {
        if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year)
        return parseInt(b.month) - parseInt(a.month)
      })
      
      console.log('Processed grade dates:', dateArray)
      setGradeDates(dateArray)
    } catch (error) {
      console.error('Error fetching grade dates:', error)
    }
  }, [])

  // Filter courses by academic year and teacher role
  const filterCoursesByAcademicYear = useCallback((academicYearCode: string) => {
    console.log('Filtering courses for academic year:', academicYearCode)
    console.log('Available courses:', courses.map(c => ({
      courseName: c.courseName,
      grade: c.grade,
      schoolYear: c.schoolYear.schoolYearCode
    })))
    
    let filtered = courses.filter(course => 
      course.schoolYear.schoolYearCode === academicYearCode
    )
    
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
        filteredByYear: courses.filter(c => c.schoolYear.schoolYearCode === academicYearCode).length,
        filteredByTeacher: filtered.length
      })
    }
    
    const sorted = filtered.sort((a, b) => {
      const gradeA = parseInt(a.grade)
      const gradeB = parseInt(b.grade)
      return gradeA - gradeB
    })
    
    console.log('Filtered courses:', sorted.map(c => ({
      courseName: c.courseName,
      grade: c.grade,
      section: c.section
    })))
    
    setFilteredCourses(sorted)
  }, [courses, currentUser])

  // Check if a specific field has validation error
  const hasFieldError = useCallback((fieldName: string) => {
    return validationErrors.some(error => {
      switch (fieldName) {
        case 'academicYear':
          return error.includes('ឆ្នាំសិក្សា')
        case 'month':
          return error.includes('ខែ')
        case 'year':
          return error.includes('ឆ្នាំ')
        case 'semester':
          return error.includes('ឆមាស')
        case 'class':
          return error.includes('ថ្នាក់')
        default:
          return false
      }
    })
  }, [validationErrors])

  // Form validation
  const validateForm = useCallback(() => {
    const errors = []
    
    console.log('Validating form with values:', {
      academicYear,
      month,
      year,
      semester,
      classFilter,
      reportType
    })
    
    if (!academicYear || !academicYear.trim()) {
      errors.push('សូមបំពេញឆ្នាំសិក្សា')
    }
    
    if (reportType === 'monthly') {
      if (!month) errors.push('សូមជ្រើសរើសខែ')
      if (!year || !year.trim()) errors.push('សូមបំពេញឆ្នាំ')
      if (!classFilter) errors.push('សូមជ្រើសរើសថ្នាក់')
    }
    
    if (reportType === 'semester') {
      if (!semester) errors.push('សូមជ្រើសរើសឆមាស')
      if (!classFilter) errors.push('សូមជ្រើសរើសថ្នាក់')
    }
    
    if (reportType === 'yearly' && !classFilter) {
      errors.push('សូមជ្រើសរើសថ្នាក់')
    }
    
    console.log('Validation errors:', errors)
    return errors
  }, [academicYear, month, year, semester, classFilter, reportType])


  // Memoized unique years for better performance
  const uniqueYears = useMemo(() => 
    Array.from(new Set(gradeDates.map(date => date.year)))
      .sort((a, b) => parseInt(b) - parseInt(a)),
    [gradeDates]
  )

  // Effects
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingData(true)
      try {
        // Load current user
        const user = getCurrentUser()
        setCurrentUser(user)
        console.log('👤 Current user loaded:', { 
          username: user?.username, 
          role: user?.role, 
          id: user?.id
        })
        
        await Promise.all([
          fetchSchoolYears(),
          fetchCourses(),
          fetchGradeDates()
        ])
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchAllData()
  }, [fetchSchoolYears, fetchCourses, fetchGradeDates])

  // Removed auto-selection of academic year - user must select manually

  useEffect(() => {
    if (academicYear && courses.length > 0) {
      filterCoursesByAcademicYear(academicYear)
    }
  }, [academicYear, courses, filterCoursesByAcademicYear])

  // Reset form when report type changes
  useEffect(() => {
    setMonth("")
    setYear("")
    setSemester("")
    setClassFilter("")
    setValidationErrors([])
  }, [reportType])

  // Clear validation errors when user starts interacting with form
  const clearValidationErrors = useCallback(() => {
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }, [validationErrors])

  const generateReport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission started with values:', {
      reportType,
      academicYear,
      month,
      year,
      semester,
      classFilter,
      startDate,
      endDate,
      format
    })
    
    // Removed auto-selection - user must select academic year manually
    
    // Use the current academic year or the default one
    const currentAcademicYear = academicYear || (schoolYears.length > 0 ? schoolYears[0].schoolYearCode : '')
    
    const errors = validateForm()
    console.log('Validation errors:', errors)
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      toast({
        title: "មានបញ្ហា",
        description: errors.join(', '),
        variant: "destructive"
      })
      return
    }
    
    // Double-check required fields before API call
    if (!academicYear || !academicYear.trim()) {
      console.error('Academic year is still missing after validation')
      toast({
        title: "មានបញ្ហា",
        description: "សូមជ្រើសរើសឆ្នាំសិក្សា",
        variant: "destructive"
      })
      return
    }
    
    // Clear validation errors if form is valid
    setValidationErrors([])
    
    setIsGenerating(true)
    
    try {
      // Find the selected course and extract its grade
      const selectedCourse = filteredCourses.find(course => course.courseId.toString() === classFilter)
      const selectedGrade = selectedCourse ? selectedCourse.grade : classFilter
      
      // Prepare request data
      const requestData = {
        reportType,
        academicYear: currentAcademicYear,
        month,
        year,
        semester,
        class: selectedGrade,
        startDate,
        endDate,
        format
      }

      console.log('Sending request data:', requestData)
      console.log('Request data JSON:', JSON.stringify(requestData, null, 2))
      console.log('Report type:', reportType)
      console.log('Month:', month)
      console.log('Year:', year)

      // Call the API
      const response = await fetch('/api/pdf-generate/generate-gradebook-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        console.log('API response not OK:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.log('Error data from API:', errorData)
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        console.log('Final error message:', errorMessage)
        throw new Error(`Failed to generate report: ${errorMessage}`)
      }

      // Get PDF blob directly from response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gradebook-report-${reportType}-${academicYear}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "ជោគជ័យ",
        description: "របាយការណ៍ត្រូវបានបង្កើតដោយជោគជ័យ",
      })
    } catch (error) {
      console.error('Error generating report:', error)
      const errorMessage = error instanceof Error ? error.message : 'មានបញ្ហាក្នុងការបង្កើតរបាយការណ៍'
      toast({
        title: "មានបញ្ហា",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setShowReportModal(false)
    }
  }, [reportType, academicYear, month, year, semester, classFilter, startDate, endDate, format, validateForm, toast])

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">


      {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REPORT_TYPES.map((type) => (
            <div
            key={type.id}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer ${
                reportType === type.id 
                  ? 'border-primary shadow-2xl scale-105' 
                  : 'border-border/50 hover:border-primary/30 hover:shadow-xl'
            }`}
            onClick={() => {
              setReportType(type.id)
              setShowReportModal(true)
            }}
          >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                reportType === type.id 
                  ? 'from-primary/5 via-primary/10 to-primary/5' 
                  : 'from-muted/20 via-muted/10 to-muted/20'
              } group-hover:from-primary/10 group-hover:via-primary/15 group-hover:to-primary/10 transition-all duration-500`} />
              
              {/* Content */}
              <div className="relative p-8">
                {/* Icon with animated background */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-3xl ${type.color} flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 ${
                    reportType === type.id ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'
                  }`}>
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Decorative elements */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${type.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full ${type.color} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                </div>

                {/* Title and Description */}
                <div className="text-center space-y-3">
                  <h3 className={`text-2xl font-bold transition-colors duration-500 ${
                    reportType === type.id 
                    ? type.color.replace('bg-', 'text-') 
                    : type.color.replace('bg-', 'text-') + ' group-hover:' + type.color.replace('bg-', 'text-')
                  }`}>
                    {type.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {type.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-6 flex justify-center">
                  <div className={`inline-flex items-center px-6 py-3 rounded-full text-base font-semibold transition-all duration-500 ${
                    reportType === type.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:shadow-lg'
                  }`}>
                    <span>បង្កើតរបាយការណ៍</span>
                    <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                {/* Selected indicator */}
                {reportType === type.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
        ))}
      </div>

        {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 animate-in zoom-in-95 duration-300">
            <CardHeader className="space-y-1 pb-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="p-2 text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      បង្កើតរបាយការណ៍សៀវភៅតាមដាន
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">ជ្រើសរើសប្រភេទនិងព័ត៌មានរបាយការណ៍</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                    onClick={() => {
                      setShowReportModal(false)
                      setValidationErrors([])
                    }}
                    className="h-8 w-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 text-muted-foreground transition-all duration-200 hover:scale-110"
                    aria-label="បិទ"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            {/* Report Type Tabs in Header */}
            <div className="px-6 mt-1 pt-2 pl-2 pr-2">
              <Tabs value={reportType} onValueChange={setReportType} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-muted/60 via-muted/50 to-muted/60 p-1.5 rounded-xl h-12 shadow-sm border border-border/50">
                  <TabsTrigger 
                    value="monthly" 
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm font-semibold hover:bg-muted/80 data-[state=active]:scale-[1.02]"
                  >
                    <Calendar className="mr-1.5 h-4 w-4" />
                    ប្រចាំខែ
                  </TabsTrigger>
                  <TabsTrigger 
                    value="semester"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm font-semibold hover:bg-muted/80 data-[state=active]:scale-[1.02]"
                  >
                    <BarChart3 className="mr-1.5 h-4 w-4" />
                    ប្រចាំឆមាស
                  </TabsTrigger>
                  <TabsTrigger 
                    value="yearly"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm font-semibold hover:bg-muted/80 data-[state=active]:scale-[1.02]"
                  >
                    <TrendingUp className="mr-1.5 h-4 w-4" />
                    ប្រចាំឆ្នាំ
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardContent className="p-2 overflow-y-auto flex-1">
              <form id="gradebookReportForm" onSubmit={generateReport} className="flex flex-col h-full">
                <div className="space-y-3 flex-1">
                {/* Report Type Selection */}
                  <div className="space-y-4">
                    
                    {isLoadingData && (
                      <div className="flex items-center justify-center space-x-2 py-6 text-base text-muted-foreground">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="font-medium">កំពុងផ្ទុកទិន្នន័យ...</span>
                      </div>
                    )}
                    
                  <Tabs value={reportType} onValueChange={setReportType} className="w-full">
                      <div className="mt-2">
                        {/* Monthly Report Form */}
                        <TabsContent value="monthly" className="space-y-3 animate-in fade-in-50 duration-200">
                          <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-cyan-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-sm transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-blue-200/50 dark:border-blue-800/30">
                              <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">ព័ត៌មានរបាយការណ៍ប្រចាំខែ</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="space-y-2.5">
                                <Label htmlFor="academicYear" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('academicYear') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                  <GraduationCap className="h-3.5 w-3.5" />
                                  <span>ឆ្នាំសិក្សា</span>
                                  <span className="text-red-500">*</span>
                              </Label>
                                <Select value={academicYear} onValueChange={(value) => {
                                  setAcademicYear(value)
                                  clearValidationErrors()
                                }}>
                                  <SelectTrigger className={`h-10 text-sm font-medium focus:ring-2 focus:ring-offset-1 transition-all duration-200 ${
                                    hasFieldError('academicYear') 
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20' 
                                      : 'border-border focus:border-primary focus:ring-primary/20 hover:border-primary/60 bg-background shadow-sm'
                                  }`}>
                                    <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {schoolYears.map((schoolYear) => (
                                      <SelectItem key={schoolYear.schoolYearId} value={schoolYear.schoolYearCode}>
                                        {schoolYear.schoolYearCode}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                            </div>
                              <div className="space-y-2">
                                <Label htmlFor="year" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('year') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>ឆ្នាំ</span>
                                  <span className="text-red-500">*</span>
                              </Label>
                                <Select value={year} onValueChange={(value) => {
                                  setYear(value)
                                  setMonth("")
                                  clearValidationErrors()
                                }} disabled={!academicYear}>
                                  <SelectTrigger className={`h-10 text-sm focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                    hasFieldError('year') 
                                      ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                      : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                  }`}>
                                    <SelectValue placeholder={academicYear ? "ជ្រើសរើសឆ្នាំ" : "សូមជ្រើសរើសឆ្នាំសិក្សាមុន"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {uniqueYears.map((yearValue) => (
                                      <SelectItem key={yearValue} value={yearValue}>
                                        {yearValue}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                            </div>
                              <div className="space-y-2">
                                <Label htmlFor="month" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('month') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  <span>ខែ</span>
                                  <span className="text-red-500">*</span>
                              </Label>
                                <Select value={month} onValueChange={(value) => {
                                  setMonth(value)
                                  clearValidationErrors()
                                }} disabled={!year}>
                                  <SelectTrigger className={`h-10 text-sm focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                    hasFieldError('month') 
                                      ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                      : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                  }`}>
                                  <SelectValue placeholder={year ? "ជ្រើសរើសខែ" : "សូមជ្រើសរើសឆ្នាំមុន"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTH_NAMES.map((monthName, index) => (
                                      <SelectItem key={index} value={(index + 1).toString().padStart(2, '0')}>
                                        {monthName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                              <div className="space-y-2">
                                <Label htmlFor="class" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('class') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                  <Users className="h-3.5 w-3.5" />
                                  <span>ថ្នាក់</span>
                                  <span className="text-red-500">*</span>
                              </Label>
                                <Select value={classFilter} onValueChange={(value) => {
                                  setClassFilter(value)
                                  clearValidationErrors()
                                }} disabled={!year}>
                                  <SelectTrigger className={`h-10 text-sm focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                    hasFieldError('class') 
                                      ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                      : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                  }`}>
                                    <SelectValue placeholder={year ? "ជ្រើសរើសថ្នាក់" : "សូមជ្រើសរើសឆ្នាំមុន"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredCourses.map((course) => (
                                      <SelectItem key={course.courseId} value={course.courseId.toString()}>
                                        ថ្នាក់ទី {course.grade}{course.section}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                        {/* Semester Report Form */}
                        <TabsContent value="semester" className="animate-in fade-in-50 duration-200">
                          <div className="bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/50 dark:from-green-950/20 dark:via-emerald-950/10 dark:to-teal-950/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/30 shadow-sm transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-green-200/50 dark:border-green-800/30">
                              <div className="p-1.5 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                                <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <h3 className="text-sm font-semibold text-green-900 dark:text-green-300">ព័ត៌មានរបាយការណ៍ប្រចាំឆមាស</h3>
                            </div>
                            <div className="space-y-3">
                              {/* First row: Academic Year and Semester */}
                              <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                  <Label htmlFor="academicYearSemester" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('academicYear') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    <span>ឆ្នាំសិក្សា</span>
                                    <span className="text-red-500">*</span>
                              </Label>
                                  <Select value={academicYear} onValueChange={(value) => {
                                    setAcademicYear(value)
                                    clearValidationErrors()
                                  }}>
                                    <SelectTrigger className={`h-10 text-sm focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                      hasFieldError('academicYear') 
                                        ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                        : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                    }`}>
                                      <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {schoolYears.map((schoolYear) => (
                                        <SelectItem key={schoolYear.schoolYearId} value={schoolYear.schoolYearCode}>
                                          {schoolYear.schoolYearCode}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                            </div>
                                <div className="space-y-2">
                                  <Label htmlFor="semester" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('semester') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    <span>ឆមាស</span>
                                    <span className="text-red-500">*</span>
                              </Label>
                                  <Select value={semester} onValueChange={(value) => {
                                    setSemester(value)
                                    clearValidationErrors()
                                  }} disabled={!academicYear}>
                                  <SelectTrigger className={`h-10 text-sm focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                    hasFieldError('semester') 
                                      ? 'border-red-500 focus:border-red-500' 
                                      : 'border-border/50 focus:border-primary'
                                  }`}>
                                  <SelectValue placeholder={academicYear ? "ជ្រើសរើសឆមាស" : "សូមជ្រើសរើសឆ្នាំសិក្សាមុន"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">ឆមាសទី ១</SelectItem>
                                  <SelectItem value="2">ឆមាសទី ២</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            </div>
                              {/* Second row: Class */}
                                <div className="space-y-2.5">
                                  <Label htmlFor="classSemester" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('class') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                    <Users className="h-3.5 w-3.5" />
                                    <span>ថ្នាក់</span>
                                    <span className="text-red-500">*</span>
                              </Label>
                                <Select value={classFilter} onValueChange={(value) => {
                                  setClassFilter(value)
                                  clearValidationErrors()
                                }} disabled={!semester}>
                                  <SelectTrigger className={`h-10 text-sm focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                    hasFieldError('class') 
                                      ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                      : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                  }`}>
                                    <SelectValue placeholder={semester ? "ជ្រើសរើសថ្នាក់" : "សូមជ្រើសរើសឆមាសមុន"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredCourses.map((course) => (
                                      <SelectItem key={course.courseId} value={course.courseId.toString()}>
                                        ថ្នាក់ទី {course.grade}{course.section}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Yearly Report Form */}
                      <TabsContent value="yearly" className="animate-in fade-in-50 duration-200">
                          <div className="bg-gradient-to-br from-purple-50/50 via-violet-50/30 to-indigo-50/50 dark:from-purple-950/20 dark:via-violet-950/10 dark:to-indigo-950/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-sm transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-purple-200/50 dark:border-purple-800/30">
                              <div className="p-1.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">ព័ត៌មានរបាយការណ៍ប្រចាំឆ្នាំ</h3>
                            </div>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                  <Label htmlFor="academicYearYearly" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('academicYear') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    <span>ឆ្នាំសិក្សា</span>
                                    <span className="text-red-500">*</span>
                              </Label>
                                  <Select value={academicYear} onValueChange={(value) => {
                                    setAcademicYear(value)
                                    clearValidationErrors()
                                  }}>
                                    <SelectTrigger className={`h-10 text-sm focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                      hasFieldError('academicYear') 
                                        ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                        : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                    }`}>
                                      <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {schoolYears.map((schoolYear) => (
                                        <SelectItem key={schoolYear.schoolYearId} value={schoolYear.schoolYearCode}>
                                          {schoolYear.schoolYearCode}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                            </div>
                                <div className="space-y-2.5">
                                  <Label htmlFor="classYearly" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('class') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                    <Users className="h-3.5 w-3.5" />
                                    <span>ថ្នាក់</span>
                                    <span className="text-red-500">*</span>
                              </Label>
                                  <Select value={classFilter} onValueChange={(value) => {
                                    setClassFilter(value)
                                    clearValidationErrors()
                                  }} disabled={!academicYear}>
                                    <SelectTrigger className={`h-10 text-sm font-medium focus:ring-2 focus:ring-offset-1 transition-all duration-200 ${
                                      hasFieldError('class') 
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20' 
                                        : 'border-border focus:border-primary focus:ring-primary/20 hover:border-primary/60 bg-background shadow-sm'
                                    }`}>
                                      <SelectValue placeholder={academicYear ? "ជ្រើសរើសថ្នាក់" : "សូមជ្រើសរើសឆ្នាំសិក្សាមុន"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filteredCourses.map((course) => (
                                        <SelectItem key={course.courseId} value={course.courseId.toString()}>
                                          ថ្នាក់ទី {course.grade}{course.section}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* Export Options */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-50/50 via-gray-50/30 to-zinc-50/50 dark:from-slate-950/20 dark:via-gray-950/10 dark:to-zinc-950/20 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/30 shadow-sm transition-all duration-300">
                    <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-800/30">
                      <div className="p-1.5 rounded-lg bg-slate-500/10 dark:bg-slate-500/20">
                        <FileType className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300">ទម្រង់ឯកសារ</h3>
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="format" className="flex items-center space-x-2 text-sm font-bold text-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span>ជ្រើសរើសទម្រង់</span>
                        <span className="text-red-500">*</span>
                    </Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger className="h-10 text-sm font-medium border-border focus:border-primary focus:ring-2 focus:ring-offset-1 focus:ring-primary/20 hover:border-primary/60 transition-all duration-200 bg-background shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">
                          <div className="flex items-center space-x-2.5">
                              <FileText className="h-4 w-4 text-red-600" />
                            <span className="font-medium">PDF ឯកសារ</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                </div>
                </div>

              </form>
            </CardContent>
            {/* Fixed Footer Buttons */}
            <div className="border-t border-border px-6 py-4 bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setShowReportModal(false)
                  setValidationErrors([])
                }}
                className="h-11 px-8 text-base font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 text-muted-foreground border-border transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <X className="mr-2 h-4 w-4" />
                បោះបង់
              </Button>
              <Button
                type="submit"
                form="gradebookReportForm"
                size="lg"
                disabled={isGenerating}
                className="h-11 px-8 text-base font-bold rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="animate-pulse">កំពុងបង្កើត...</span>
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    បង្កើតរបាយការណ៍
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}
