"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Download, 
  FileText, 
  Users,
  UserCheck,
  CheckCircle,
  X,
  GraduationCap,
  FileType,
  School,
  BarChart3,
  Award
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { RoleGuard } from "@/components/ui/role-guard"

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

interface Student {
  studentId: number
  firstName: string
  lastName: string
  grade: string
  section: string
  courseId: number
}

export default function StudentListReportPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
      <StudentListReportContent />
      </div>
    </RoleGuard>
  )
}

function StudentListReportContent() {
  const { toast } = useToast()
  
  // UI State
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState("class-list")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Data State
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  
  // Form State
  const [reportData, setReportData] = useState({
    academicYear: "",
    class: "",
    format: "pdf",
    includeDetails: true,
    includeAllClasses: false,
    showStudentList: false,
    selectedStudents: [] as number[]
  })
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

  const fetchStudents = useCallback(async () => {
    try {
      console.log('Fetching students...')
      const response = await fetch('/api/students/enrolled')
      if (!response.ok) {
        console.error('Failed to fetch students:', response.status)
        return
      }
      
      const data = await response.json()
      console.log('Students data:', data)
      if (Array.isArray(data)) {
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
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

  // Filter students by class
  const filterStudentsByClass = useCallback((courseId: string) => {
    if (!courseId) {
      setFilteredStudents([])
      return
    }
    
    const courseIdNum = parseInt(courseId)
    const filtered = students.filter(student => 
      student.courseId === courseIdNum
    )
    // Sort students by name
    const sorted = filtered.sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase()
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
    setFilteredStudents(sorted)
  }, [students])

  // Effects
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingData(true)
      try {
        await Promise.all([
          fetchSchoolYears(),
          fetchCourses(),
          fetchStudents()
        ])
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchAllData()
  }, [fetchSchoolYears, fetchCourses, fetchStudents])

  useEffect(() => {
    if (reportData.academicYear && courses.length > 0) {
      filterCoursesByAcademicYear(reportData.academicYear)
    }
  }, [reportData.academicYear, courses, filterCoursesByAcademicYear])

  useEffect(() => {
    if (reportData.class && students.length > 0) {
      filterStudentsByClass(reportData.class)
    }
  }, [reportData.class, students, filterStudentsByClass])


  // Clear selected students when class changes
  useEffect(() => {
    setReportData(prev => ({ ...prev, selectedStudents: [] }))
  }, [reportData.class])

  // Check if a specific field has validation error
  const hasFieldError = useCallback((fieldName: string) => {
    return validationErrors.some(error => {
      switch (fieldName) {
        case 'academicYear':
          return error.includes('ឆ្នាំសិក្សា')
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
    
    if (!reportData.academicYear.trim()) {
      errors.push('សូមបំពេញឆ្នាំសិក្សា')
    }
    
    if (!reportData.class) {
      errors.push('សូមជ្រើសរើសថ្នាក់')
    }
    
    return errors
  }, [reportData.academicYear, reportData.class])

  // Clear validation errors when user starts interacting with form
  const clearValidationErrors = useCallback(() => {
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }, [validationErrors])

  const generateReport = async (e: React.FormEvent) => {
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
      const response = await fetch('/api/pdf-generate/generate-student-list-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: selectedReportType,
          academicYear: reportData.academicYear,
          class: reportData.class,
          format: reportData.format,
          showStudentList: reportData.showStudentList,
          selectedStudents: reportData.selectedStudents
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      // Get PDF blob directly from response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `student-list-report-${selectedReportType}-${reportData.academicYear}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "ជោគជ័យ",
        description: "របាយការណ៍បញ្ជីឈ្មោះសិស្សត្រូវបានបង្កើតដោយជោគជ័យ",
      })
      
    } catch (error) {
      console.error("❌ Error generating student list report:", error)
      toast({
        title: "មានបញ្ហា",
        description: "មានបញ្ហាក្នុងការបង្កើតរបាយការណ៍។ សូមព្យាយាមម្តងទៀត។",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setShowReportModal(false)
    }
  }

  const REPORT_TYPES = [
    {
      id: "class-list",
      title: "បញ្ជីឈ្មោះតាមថ្នាក់",
      description: "របាយការណ៍បញ្ជីឈ្មោះសិស្សតាមថ្នាក់",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      id: "student-details",
      title: "ព័ត៌មានលម្អិតសិស្សតាមថ្នាក់", 
      description: "របាយការណ៍ព័ត៌មានលម្អិតសិស្សតាមថ្នាក់",
      icon: CheckCircle,
      color: "bg-purple-500"
    }
  ]

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">
        {/* Report Types Grid - Modern Card Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {REPORT_TYPES.map((type) => (
          <div
            key={type.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer ${
              selectedReportType === type.id 
                ? 'border-primary shadow-2xl scale-105' 
                : 'border-border/50 hover:border-primary/30 hover:shadow-xl'
            }`}
            onClick={() => {
              setSelectedReportType(type.id)
              setShowReportModal(true)
            }}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              selectedReportType === type.id 
                ? 'from-primary/5 via-primary/10 to-primary/5' 
                : 'from-muted/20 via-muted/10 to-muted/20'
            } group-hover:from-primary/10 group-hover:via-primary/15 group-hover:to-primary/10 transition-all duration-500`} />
            
            {/* Content */}
            <div className="relative p-8">
              {/* Icon with animated background */}
              <div className="relative mb-6">
                <div className={`w-16 h-16 mx-auto rounded-3xl ${type.color} flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 ${
                  selectedReportType === type.id ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'
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
                  selectedReportType === type.id 
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
                  selectedReportType === type.id
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
              {selectedReportType === type.id && (
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
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="p-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      បង្កើតរបាយការណ៍បញ្ជីឈ្មោះសិស្ស
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">ជ្រើសរើសប្រភេទរបាយការណ៍ និងបំពេញព័ត៌មាន</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReportModal(false)
                    setValidationErrors([])
                  }}
                  className="h-9 w-9 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 transition-all duration-200"
                  aria-label="បិទ"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            {/* Fixed Tabs in Header */}
            <div className="px-6 mt-1 pt-2 pl-2 pr-2">
              <Tabs value={selectedReportType} onValueChange={setSelectedReportType} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-muted/50 via-muted/40 to-muted/50 p-1.5 rounded-xl h-auto gap-2 border border-border/40 shadow-inner">
                  <TabsTrigger 
                    value="class-list"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm font-semibold hover:bg-muted/80 data-[state=active]:scale-[1.02] py-2.5"
                  >
                    <Users className="mr-1.5 h-4 w-4" />
                    បញ្ជីឈ្មោះសិស្សតាមថ្នាក់
                  </TabsTrigger>
                  <TabsTrigger 
                    value="student-details"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm font-semibold hover:bg-muted/80 data-[state=active]:scale-[1.02] py-2.5"
                  >
                    <CheckCircle className="mr-1.5 h-4 w-4" />
                    ព័ត៌មានលម្អិតសិស្សតាមថ្នាក់
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardContent className="p-2 overflow-y-auto flex-1">
              <form id="studentListReportForm" onSubmit={generateReport} className="flex flex-col h-full">
                <div className="space-y-3 flex-1">
                {/* Report Type Selection */}
                <div className="space-y-4">
                  
                  {isLoadingData && (
                    <div className="flex items-center justify-center space-x-2 py-4 text-base text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>កំពុងផ្ទុកទិន្នន័យ...</span>
                    </div>
                  )}
                  
                  <Tabs value={selectedReportType} onValueChange={setSelectedReportType} className="w-full">
                    <div className="mt-2">
                      {/* Class List Report Form */}
                      <TabsContent value="class-list" className="space-y-3 animate-in fade-in-50 duration-200">
                        <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-cyan-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-sm transition-all duration-300 hover:shadow-md">
                          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-blue-200/50 dark:border-blue-800/30">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                              <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">ព័ត៌មានរបាយការណ៍បញ្ជីឈ្មោះសិស្ស</h3>
                          </div>
                          <div className="grid gap-5 grid-cols-2">
                            <div className="space-y-2.5">
                              <Label htmlFor="academicYear" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('academicYear') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span>ឆ្នាំសិក្សា</span>
                                <span className="text-red-500">*</span>
                              </Label>
                              <Select 
                                value={reportData.academicYear}
                                onValueChange={(value) => {
                                  setReportData({...reportData, academicYear: value, class: ""})
                                  clearValidationErrors()
                                }}
                              >
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
                            <div className="space-y-2.5">
                              <Label htmlFor="class" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('class') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                <Users className="h-3.5 w-3.5" />
                                <span>ថ្នាក់</span>
                                <span className="text-red-500">*</span>
                            </Label>
                              <Select 
                              value={reportData.class}
                                onValueChange={(value) => {
                                  setReportData({...reportData, class: value})
                                  clearValidationErrors()
                                }}
                                disabled={!reportData.academicYear}
                              >
                                <SelectTrigger className={`h-10 text-sm font-medium focus:ring-2 focus:ring-offset-1 transition-all duration-200 ${
                                  hasFieldError('class') 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border focus:border-primary focus:ring-primary/20 hover:border-primary/60 bg-background shadow-sm'
                                }`}>
                                  <SelectValue placeholder={reportData.academicYear ? "ជ្រើសរើសថ្នាក់" : "សូមជ្រើសរើសឆ្នាំសិក្សាមុន"} />
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

                      {/* Student Details Report Form */}
                      <TabsContent value="student-details" className="space-y-3 animate-in fade-in-50 duration-200">
                        <div className="bg-gradient-to-br from-purple-50/50 via-violet-50/30 to-indigo-50/50 dark:from-purple-950/20 dark:via-violet-950/10 dark:to-indigo-950/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-sm transition-all duration-300 hover:shadow-md">
                          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-purple-200/50 dark:border-purple-800/30">
                            <div className="p-1.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                              <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">ព័ត៌មានលម្អិតសិស្សតាមថ្នាក់</h3>
                          </div>
                          <div className="grid gap-5 grid-cols-2">
                            <div className="space-y-2.5">
                              <Label htmlFor="academicYear" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('academicYear') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span>ឆ្នាំសិក្សា</span>
                                <span className="text-red-500">*</span>
                              </Label>
                              <Select 
                                value={reportData.academicYear}
                                onValueChange={(value) => {
                                  setReportData({...reportData, academicYear: value, class: ""})
                                  clearValidationErrors()
                                }}
                              >
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
                            <div className="space-y-2.5">
                              <Label htmlFor="class" className={`flex items-center space-x-2 text-sm font-bold ${hasFieldError('class') ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                <Users className="h-3.5 w-3.5" />
                                <span>ថ្នាក់</span>
                                <span className="text-red-500">*</span>
                            </Label>
                              <Select 
                              value={reportData.class}
                                onValueChange={(value) => {
                                  setReportData({...reportData, class: value})
                                  clearValidationErrors()
                                }}
                                disabled={!reportData.academicYear}
                              >
                                <SelectTrigger className={`h-10 text-sm font-medium focus:ring-2 focus:ring-offset-1 transition-all duration-200 ${
                                  hasFieldError('class') 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20' 
                                    : 'border-border focus:border-primary focus:ring-primary/20 hover:border-primary/60 bg-background shadow-sm'
                                }`}>
                                  <SelectValue placeholder={reportData.academicYear ? "ជ្រើសរើសថ្នាក់" : "សូមជ្រើសរើសឆ្នាំសិក្សាមុន"} />
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
                    <Select value={reportData.format} onValueChange={(value) => setReportData({...reportData, format: value})}>
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
                form="studentListReportForm"
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
