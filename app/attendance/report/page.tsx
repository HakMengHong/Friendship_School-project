"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  CalendarDays,
  GraduationCap,
  FileType,
  School,
  UserCheck
} from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"

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
  schoolYear: {
    schoolYearId: number
    schoolYearCode: string
  }
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
      id: "daily",
      title: "របាយការណ៍ប្រចាំថ្ងៃ",
      description: "របាយការណ៍អវត្តមានសិស្សប្រចាំថ្ងៃ",
      icon: Calendar,
      color: "bg-blue-500"
    },
    {
      id: "monthly", 
      title: "របាយការណ៍ប្រចាំខែ",
      description: "របាយការណ៍អវត្តមានសិស្សប្រចាំខែ",
      icon: BarChart3,
      color: "bg-green-500"
    },
    {
      id: "semester",
      title: "របាយការណ៍ប្រចាំឆមាស",
      description: "របាយការណ៍អវត្តមានសិស្សប្រចាំឆមាស",
      icon: GraduationCap,
      color: "bg-orange-500"
    },
    {
      id: "yearly",
      title: "របាយការណ៍ប្រចាំឆ្នាំ", 
      description: "របាយការណ៍អវត្តមានសិស្សប្រចាំឆ្នាំ",
      icon: TrendingUp,
      color: "bg-purple-500"
    }
  ]

export default function AbsenceReportPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
        <AbsenceReportContent />
      </div>
    </RoleGuard>
  )
}

function AbsenceReportContent() {
  const { toast } = useToast()
  
  // UI State
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState("daily")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Data State
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [attendanceDates, setAttendanceDates] = useState<{year: string, month: string, monthName: string}[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [academicYear, setAcademicYear] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [semester, setSemester] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [format, setFormat] = useState("pdf")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // API Functions
  const fetchSchoolYears = useCallback(async () => {
    try {
      console.log('Fetching school years...')
      const response = await fetch('/api/school-years')
      if (!response.ok) {
        console.error('Failed to fetch school years:', response.status)
        return
      }
      
      const data = await response.json()
      console.log('School years data:', data)
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

  const fetchAttendanceDates = useCallback(async () => {
    try {
      console.log('Fetching attendance dates...')
      const response = await fetch('/api/attendance')
      if (!response.ok) {
        console.error('Failed to fetch attendance dates:', response.status)
        return
      }
      
      const data = await response.json()
      console.log('Attendance data:', data)
      if (Array.isArray(data)) {
        // Extract unique dates and group by year/month
        const dateMap = new Map()
        
        data.forEach((attendance: any) => {
          const date = new Date(attendance.attendanceDate)
          const year = date.getFullYear().toString()
          const month = (date.getMonth() + 1).toString().padStart(2, '0')
          const monthName = MONTH_NAMES[date.getMonth()]
          
          const key = `${year}-${month}`
          if (!dateMap.has(key)) {
            dateMap.set(key, {
              year: year,
              month: month,
              monthName: monthName
            })
          }
        })
        
        // Convert to array and sort by year/month (newest first)
        const datesArray = Array.from(dateMap.values()).sort((a, b) => {
          if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year)
          return parseInt(b.month) - parseInt(a.month)
        })
        
        console.log('Processed attendance dates:', datesArray)
        console.log('Available years:', Array.from(new Set(datesArray.map(d => d.year))))
        console.log('Available months for 2025:', datesArray.filter(d => d.year === '2025').map(d => d.monthName))
        setAttendanceDates(datesArray)
      }
    } catch (error) {
      console.error('Error fetching attendance dates:', error)
    }
  }, [])

  // Filter courses by academic year
  const filterCoursesByAcademicYear = useCallback((academicYearCode: string) => {
    const filtered = courses.filter(course => 
      course.schoolYear.schoolYearCode === academicYearCode
    )
    // Sort courses numerically by grade
    const sorted = filtered.sort((a, b) => {
      const gradeA = parseInt(a.grade)
      const gradeB = parseInt(b.grade)
      return gradeA - gradeB
    })
    setFilteredCourses(sorted)
  }, [courses])

  // Debug logging
  useEffect(() => {
    console.log('Debug - attendanceDates:', attendanceDates)
    console.log('Debug - year state:', year)
    console.log('Debug - month state:', month)
  }, [attendanceDates, year, month])

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
        case 'startDate':
          return error.includes('ថ្ងៃចាប់ផ្តើម')
        case 'endDate':
          return error.includes('ថ្ងៃបញ្ចប់')
        default:
          return false
      }
    })
  }, [validationErrors])

  // Form validation
  const validateForm = useCallback(() => {
    const errors = []
    
    if (reportType === 'daily') {
      if (!startDate.trim()) errors.push('សូមបំពេញថ្ងៃចាប់ផ្តើម')
      if (!endDate.trim()) errors.push('សូមបំពេញថ្ងៃបញ្ចប់')
      if (startDate > endDate) errors.push('ថ្ងៃចាប់ផ្តើមមិនអាចធំជាងថ្ងៃបញ្ចប់')
    }
    
    if (reportType === 'monthly') {
      if (!academicYear.trim()) errors.push('សូមបំពេញឆ្នាំសិក្សា')
      if (!month) errors.push('សូមជ្រើសរើសខែ')
      if (!year.trim()) errors.push('សូមបំពេញឆ្នាំ')
      if (!classFilter) errors.push('សូមជ្រើសរើសថ្នាក់')
    }
    
    if (reportType === 'semester') {
      if (!academicYear.trim()) errors.push('សូមបំពេញឆ្នាំសិក្សា')
      if (!semester) errors.push('សូមជ្រើសរើសឆមាស')
      if (!classFilter) errors.push('សូមជ្រើសរើសថ្នាក់')
    }
    
    if (reportType === 'yearly') {
      if (!academicYear.trim()) errors.push('សូមបំពេញឆ្នាំសិក្សា')
      if (!classFilter) errors.push('សូមជ្រើសរើសថ្នាក់')
    }
    
    return errors
  }, [startDate, endDate, academicYear, month, year, semester, classFilter, reportType])

  // Generate report
  const generateReport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      toast({
        title: "មានបញ្ហា",
        description: errors.join(', '),
        variant: "destructive"
      })
      return
    }
    
    // Clear validation errors if form is valid
    setValidationErrors([])
    
    setIsGenerating(true)
    
    try {
      const requestData = {
        reportType,
        startDate,
        endDate,
        academicYear,
        month,
        year,
        semester,
        class: classFilter,
        format
      }

      const response = await fetch('/api/pdf-generate/generate-attendance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-report-${reportType}-${academicYear || startDate}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Check if the PDF is very small (likely contains no data message)
      if (blob.size < 10000) { // Less than 10KB usually means no data
        toast({
          title: "របាយការណ៍បង្កើតហើយ",
          description: "របាយការណ៍ត្រូវបានបង្កើត ប៉ុន្តែគ្មានទិន្នន័យសម្រាប់ខែ/ឆ្នាំដែលជ្រើសរើស។ សូមជ្រើសរើសខែដែលមានទិន្នន័យ។",
          variant: "destructive"
        })
      } else {
        toast({
          title: "ជោគជ័យ",
          description: "របាយការណ៍ត្រូវបានបង្កើតដោយជោគជ័យ",
        })
      }
      
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: "មានបញ្ហា",
        description: "មានបញ្ហាក្នុងការបង្កើតរបាយការណ៍។ សូមព្យាយាមម្តងទៀត។",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setShowReportModal(false)
    }
  }, [reportType, startDate, endDate, academicYear, month, year, classFilter, format, validateForm, toast])

  // Effects
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingData(true)
      try {
        await Promise.all([
          fetchSchoolYears(),
          fetchCourses(),
          fetchAttendanceDates()
        ])
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchAllData()
  }, [fetchSchoolYears, fetchCourses, fetchAttendanceDates])

  useEffect(() => {
    if (academicYear && courses.length > 0) {
      filterCoursesByAcademicYear(academicYear)
    }
  }, [academicYear, courses, filterCoursesByAcademicYear])

  // Reset month when year changes
  useEffect(() => {
    if (year) {
      setMonth("")
    }
  }, [year])

  // Reset form when report type changes
  useEffect(() => {
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
    setAcademicYear("")
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

  return (
    <div>
      {/* Report Types Grid - Modern Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-primary/10">
                    <UserCheck className="h-3 w-3 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-wide text-center text-primary">
                      បង្កើតរបាយការណ៍អវត្តមាន
                    </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReportModal(false)
                    setValidationErrors([])
                  }}
                  className="h-5 w-5 p-0 hover:bg-muted hover:text-foreground text-muted-foreground transition-colors duration-200"
                  aria-label="បិទ"
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <form onSubmit={generateReport} className="space-y-3">
                {/* Report Type Selection */}
                <div className="space-y-4">
                  
                  {isLoadingData && (
                    <div className="flex items-center justify-center space-x-2 py-4 text-base text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>កំពុងផ្ទុកទិន្នន័យ...</span>
                    </div>
                  )}
                  
                  <Tabs value={reportType} onValueChange={setReportType} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg h-10">
                      <TabsTrigger 
                        value="daily" 
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200 text-base font-semibold"
                      >
                        <Calendar className="mr-1 h-4 w-4 text-primary" />
                        ប្រចាំថ្ងៃ
                      </TabsTrigger>
                      <TabsTrigger 
                        value="monthly"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200 text-base font-semibold"
                      >
                        <BarChart3 className="mr-1 h-4 w-4 text-primary" />
                        ប្រចាំខែ
                      </TabsTrigger>
                      <TabsTrigger 
                        value="semester"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200 text-base font-semibold"
                      >
                        <GraduationCap className="mr-1 h-4 w-4 text-primary" />
                        ប្រចាំឆមាស
                      </TabsTrigger>
                      <TabsTrigger 
                        value="yearly"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200 text-base font-semibold"
                      >
                        <TrendingUp className="mr-1 h-4 w-4 text-primary" />
                        ប្រចាំឆ្នាំ
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                      {/* Daily Report Form */}
                      <TabsContent value="daily" className="space-y-4 animate-in fade-in-50 duration-200">
                        <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="startDate" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('startDate') ? 'text-red-500' : 'text-primary'}`}>
                                <Calendar className="h-4 w-4" />
                                <span>ថ្ងៃចាប់ផ្តើម</span>
                                <span className="text-red-500 font-bold">*</span>
                                </Label>
                                <Input
                                  id="startDate"
                                  type="date"
                                value={startDate}
                                onChange={(e) => {
                                  setStartDate(e.target.value)
                                  clearValidationErrors()
                                }}
                                className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                  hasFieldError('startDate') 
                                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                }`}
                                  required
                                />
                              </div>
                            <div className="space-y-2">
                              <Label htmlFor="endDate" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('endDate') ? 'text-red-500' : 'text-primary'}`}>
                                <Calendar className="h-4 w-4" />
                                <span>ថ្ងៃបញ្ចប់</span>
                                <span className="text-red-500 font-bold">*</span>
                                </Label>
                                <Input
                                  id="endDate"
                                  type="date"
                                value={endDate}
                                onChange={(e) => {
                                  setEndDate(e.target.value)
                                  clearValidationErrors()
                                }}
                                className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                  hasFieldError('endDate') 
                                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                }`}
                                  required
                                />
                              </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Monthly Report Form */}
                      <TabsContent value="monthly" className="space-y-4 animate-in fade-in-50 duration-200">
                        <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="academicYear" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('academicYear') ? 'text-red-500' : 'text-primary'}`}>
                                <GraduationCap className="h-4 w-4" />
                                <span>ឆ្នាំសិក្សា</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={academicYear} onValueChange={(value) => {
                                setAcademicYear(value)
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
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
                              <Label htmlFor="year" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('year') ? 'text-red-500' : 'text-primary'}`}>
                                <Calendar className="h-4 w-4" />
                                <span>ឆ្នាំ</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={year} onValueChange={(value) => {
                                setYear(value)
                                setMonth("") // Reset month when year changes
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                  hasFieldError('year') 
                                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                }`}>
                                  <SelectValue placeholder="ជ្រើសរើសឆ្នាំ" />
                                  </SelectTrigger>
                                <SelectContent>
                                  {attendanceDates.length > 0 ? (
                                    Array.from(new Set(attendanceDates.map(d => d.year)))
                                      .sort((a, b) => parseInt(b) - parseInt(a))
                                      .map((yearValue) => (
                                      <SelectItem key={yearValue} value={yearValue}>
                                        {yearValue}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-data" disabled>
                                      គ្មានទិន្នន័យ
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="month" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('month') ? 'text-red-500' : 'text-primary'}`}>
                                <CalendarDays className="h-4 w-4" />
                                <span>ខែ</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={month} onValueChange={(value) => {
                                setMonth(value)
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                  hasFieldError('month') 
                                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                }`}>
                                  <SelectValue placeholder="ជ្រើសរើសខែ" />
                                </SelectTrigger>
                                <SelectContent>
                                  {attendanceDates.length > 0 && year ? (
                                    attendanceDates
                                      .filter(d => d.year === year)
                                      .sort((a, b) => parseInt(b.month) - parseInt(a.month))
                                      .map((dateInfo) => (
                                      <SelectItem key={dateInfo.month} value={dateInfo.month}>
                                        {dateInfo.monthName} ({dateInfo.month})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-data" disabled>
                                      {!year ? 'សូមជ្រើសរើសឆ្នាំមុន' : 'គ្មានទិន្នន័យ'}
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="class" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('class') ? 'text-red-500' : 'text-primary'}`}>
                                <Users className="h-4 w-4" />
                                <span>ថ្នាក់</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={classFilter} onValueChange={(value) => {
                                setClassFilter(value)
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                  hasFieldError('class') 
                                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                }`}>
                                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
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
                      <TabsContent value="semester" className="space-y-4 animate-in fade-in-50 duration-200">
                        <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="academicYearSemester" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('academicYear') ? 'text-red-500' : 'text-primary'}`}>
                                <GraduationCap className="h-4 w-4" />
                                <span>ឆ្នាំសិក្សា</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={academicYear} onValueChange={(value) => {
                                setAcademicYear(value)
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
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
                              <Label htmlFor="semester" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('semester') ? 'text-red-500' : 'text-primary'}`}>
                                <FileText className="h-4 w-4" />
                                <span>ឆមាស</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={semester} onValueChange={(value) => {
                                setSemester(value)
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                  hasFieldError('semester') 
                                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                }`}>
                                  <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">ឆមាសទី ១</SelectItem>
                                  <SelectItem value="2">ឆមាសទី ២</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="classSemester" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('class') ? 'text-red-500' : 'text-primary'}`}>
                                <Users className="h-4 w-4" />
                                <span>ថ្នាក់</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={classFilter} onValueChange={(value) => {
                                setClassFilter(value)
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                  hasFieldError('class') 
                                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                }`}>
                                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
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
                      <TabsContent value="yearly" className="space-y-4 animate-in fade-in-50 duration-200">
                        <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="academicYearYearly" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('academicYear') ? 'text-red-500' : 'text-primary'}`}>
                                <GraduationCap className="h-4 w-4" />
                                <span>ឆ្នាំសិក្សា</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={academicYear} onValueChange={(value) => {
                                setAcademicYear(value)
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
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
                              <Label htmlFor="classYearly" className={`flex items-center space-x-2 text-base font-semibold ${hasFieldError('class') ? 'text-red-500' : 'text-primary'}`}>
                                <Users className="h-4 w-4" />
                                <span>ថ្នាក់</span>
                                <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={classFilter} onValueChange={(value) => {
                                setClassFilter(value)
                                clearValidationErrors()
                              }}>
                                <SelectTrigger className={`h-10 text-base focus:ring-primary/20 transition-all duration-200 hover:scale-[1.02] ${
                                  hasFieldError('class') 
                                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border/50 focus:border-primary hover:border-primary/60 bg-background/50'
                                }`}>
                                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
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
                    </div>
                  </Tabs>
                </div>

                {/* Export Options */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                <div className="space-y-2">
                      <Label htmlFor="format" className="flex items-center space-x-2 text-base font-semibold text-primary">
                        <FileType className="h-4 w-4" />
                        <span>ទម្រង់ឯកសារ</span>
                        <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="h-10 text-base border-border/50 focus:border-primary focus:ring-primary/20 hover:border-primary/60 hover:scale-[1.02] transition-all duration-200 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-3 w-3 text-primary" />
                            <span>PDF</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-3 w-3 text-primary" />
                            <span>Excel</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-border/50 bg-gradient-to-r from-transparent via-muted/20 to-transparent -mx-6 px-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReportModal(false)
                      setValidationErrors([])
                    }}
                    className="h-10 px-6 text-base font-semibold hover:bg-muted hover:text-foreground text-muted-foreground border-border/50 hover:border-border hover:scale-[1.02] transition-all duration-200"
                  >
                    បោះបង់
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isGenerating}
                    className="h-10 px-6 text-base font-bold bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="animate-pulse">កំពុងបង្កើត...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        បង្កើតរបាយការណ៍
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
