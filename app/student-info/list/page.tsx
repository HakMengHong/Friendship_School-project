"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  School
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

  // Clear class field when switching to all-students report type
  useEffect(() => {
    if (selectedReportType === 'all-students') {
      setReportData(prev => ({ ...prev, class: "", selectedStudents: [] }))
    }
  }, [selectedReportType])

  // Clear selected students when class changes
  useEffect(() => {
    setReportData(prev => ({ ...prev, selectedStudents: [] }))
  }, [reportData.class])

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault()
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
      id: "all-students", 
      title: "បញ្ជីឈ្មោះសិស្សទាំងអស់",
      description: "របាយការណ៍បញ្ជីឈ្មោះសិស្សទាំងអស់",
      icon: UserCheck,
      color: "bg-green-500"
    },
    {
      id: "student-details",
      title: "ព័ត៌មានលម្អិតសិស្ស", 
      description: "របាយការណ៍ព័ត៌មានលម្អិតសិស្ស",
      icon: CheckCircle,
      color: "bg-purple-500"
    }
  ]

  return (
    <div>
      {/* Report Types Grid - Modern Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    ? 'text-primary' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
                  {type.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {type.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex justify-center">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-all duration-500 ${
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-primary/10">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold tracking-wide text-center text-primary">
                      បង្កើតរបាយការណ៍បញ្ជីឈ្មោះសិស្ស
                    </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
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
                  <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                <div className="space-y-2">
                      <Label htmlFor="reportType" className="flex items-center space-x-2 text-sm font-semibold text-primary">
                        <School className="h-4 w-4" />
                        <span>ប្រភេទរបាយការណ៍</span>
                        <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                        <SelectTrigger className="h-10 text-sm border-border/50 focus:border-primary focus:ring-primary/20 hover:border-primary/60 hover:scale-[1.02] transition-all duration-200 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class-list">
                        <div className="flex items-center space-x-2">
                              <Users className="h-3 w-3 text-primary" />
                          <span>បញ្ជីឈ្មោះតាមថ្នាក់</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="all-students">
                        <div className="flex items-center space-x-2">
                              <UserCheck className="h-3 w-3 text-primary" />
                          <span>បញ្ជីឈ្មោះសិស្សទាំងអស់</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="student-details">
                        <div className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-primary" />
                          <span>ព័ត៌មានលម្អិតសិស្ស</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                    </div>
                  </div>
                </div>

                {/* Report Configuration */}
                <div className="space-y-4">
                  {isLoadingData && (
                    <div className="flex items-center justify-center space-x-2 py-4 text-sm text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>កំពុងផ្ទុកទិន្នន័យ...</span>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                    <div className={`grid gap-4 ${selectedReportType === 'all-students' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="space-y-2">
                        <Label htmlFor="academicYear" className="flex items-center space-x-2 text-sm font-semibold text-primary">
                          <GraduationCap className="h-4 w-4" />
                          <span>ឆ្នាំសិក្សា</span>
                          <span className="text-red-500 font-bold">*</span>
                        </Label>
                        <Select 
                          value={reportData.academicYear}
                          onValueChange={(value) => {
                            setReportData({...reportData, academicYear: value, class: ""})
                          }}
                        >
                          <SelectTrigger className="h-10 text-sm border-border/50 focus:border-primary focus:ring-primary/20 hover:border-primary/60 hover:scale-[1.02] transition-all duration-200 bg-background/50">
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
                      {selectedReportType !== 'all-students' && (
                        <div className="space-y-2">
                          <Label htmlFor="class" className="flex items-center space-x-2 text-sm font-semibold text-primary">
                            <Users className="h-4 w-4" />
                            <span>ថ្នាក់</span>
                        </Label>
                          <Select 
                          value={reportData.class}
                            onValueChange={(value) => setReportData({...reportData, class: value})}
                            disabled={!reportData.academicYear}
                          >
                            <SelectTrigger className="h-10 text-sm border-border/50 focus:border-primary focus:ring-primary/20 hover:border-primary/60 hover:scale-[1.02] transition-all duration-200 bg-background/50">
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
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Selection for Student Details */}
                {selectedReportType === 'student-details' && reportData.class && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center space-x-2 text-sm font-semibold text-primary">
                            <Users className="h-4 w-4" />
                            <span>ជ្រើសរើសសិស្ស</span>
                            <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            ជ្រើសរើសសិស្សដែលចង់បញ្ចូលក្នុងរបាយការណ៍
                          </p>
                        </div>
                        
                        {/* Selected Students Display */}
                        {reportData.selectedStudents.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-primary">
                              សិស្សដែលបានជ្រើសរើស ({reportData.selectedStudents.length} នាក់):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {reportData.selectedStudents.map(studentId => {
                                const student = filteredStudents.find(s => s.studentId === studentId)
                                return student ? (
                                  <Badge 
                                    key={studentId}
                                    variant="secondary"
                                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                                  >
                                    {student.lastName} {student.firstName}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReportData(prev => ({
                                          ...prev,
                                          selectedStudents: prev.selectedStudents.filter(id => id !== studentId)
                                        }))
                                      }}
                                      className="ml-2 hover:text-red-500 transition-colors duration-200"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </div>
                        )}

                        {/* Student Selection Dropdown */}
                <div className="space-y-2">
                          <Select
                            value=""
                            onValueChange={(studentId) => {
                              const id = parseInt(studentId)
                              if (!reportData.selectedStudents.includes(id)) {
                                setReportData(prev => ({
                                  ...prev,
                                  selectedStudents: [...prev.selectedStudents, id]
                                }))
                              }
                            }}
                          >
                            <SelectTrigger className="h-10 text-sm border-border/50 focus:border-primary focus:ring-primary/20 hover:border-primary/60 hover:scale-[1.02] transition-all duration-200 bg-background/50">
                              <SelectValue placeholder="ជ្រើសរើសសិស្ស" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredStudents
                                .filter(student => !reportData.selectedStudents.includes(student.studentId))
                                .map((student) => (
                                <SelectItem key={student.studentId} value={student.studentId.toString()}>
                                  {student.lastName} {student.firstName} - ថ្នាក់ទី {student.grade}{student.section}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Select All / Clear All Buttons */}
                        {filteredStudents.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const allStudentIds = filteredStudents.map(s => s.studentId)
                                setReportData(prev => ({
                                  ...prev,
                                  selectedStudents: allStudentIds
                                }))
                              }}
                              className="h-8 px-3 text-xs"
                            >
                              ជ្រើសរើសទាំងអស់
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReportData(prev => ({
                                  ...prev,
                                  selectedStudents: []
                                }))
                              }}
                              className="h-8 px-3 text-xs"
                            >
                              លុបទាំងអស់
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Options for Student Details */}
                {selectedReportType === 'student-details' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="showStudentList"
                            checked={reportData.showStudentList}
                            onCheckedChange={(checked) => 
                              setReportData({...reportData, showStudentList: checked as boolean})
                            }
                            className="h-4 w-4 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label 
                            htmlFor="showStudentList" 
                            className="flex items-center space-x-2 text-sm font-semibold text-primary cursor-pointer"
                          >
                            <Users className="h-4 w-4" />
                            <span>បង្ហាញបញ្ជីឈ្មោះសិស្ស</span>
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground ml-7">
                          បញ្ចូលបញ្ជីឈ្មោះសិស្សក្នុងរបាយការណ៍ព័ត៌មានលម្អិត
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Export Options */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 rounded-xl p-6 border border-border/60 transition-all duration-300">
                  <div className="space-y-2">
                      <Label htmlFor="format" className="flex items-center space-x-2 text-sm font-semibold text-primary">
                        <FileType className="h-4 w-4" />
                        <span>ទម្រង់ឯកសារ</span>
                        <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Select value={reportData.format} onValueChange={(value) => setReportData({...reportData, format: value})}>
                        <SelectTrigger className="h-10 text-sm border-border/50 focus:border-primary focus:ring-primary/20 hover:border-primary/60 hover:scale-[1.02] transition-all duration-200 bg-background/50">
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
                              <Users className="h-3 w-3 text-primary" />
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
                    onClick={() => setShowReportModal(false)}
                    className="h-10 px-6 text-sm font-semibold hover:bg-muted hover:text-foreground text-muted-foreground border-border/50 hover:border-border hover:scale-[1.02] transition-all duration-200"
                  >
                    បោះបង់
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isGenerating}
                    className="h-10 px-6 text-sm font-bold bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="animate-pulse">កំពុងបង្កើត...</span>
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
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
