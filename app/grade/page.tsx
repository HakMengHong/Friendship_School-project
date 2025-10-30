'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown,
  Award, 
  Medal,
  Filter,
  Search,
  Eye,
  Edit,
  Star,
  CheckCircle,
  AlertCircle,
  Calendar,
  GraduationCap,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect } from "react"

// Interfaces for database data
interface Grade {
  gradeId: number
  courseId: number
  studentId: number
  subjectId: number
  semesterId: number
  gradeDate: string
  grade: number
  gradeComment?: string
  userId?: number
  lastEdit?: string
  student: {
    firstName: string
    lastName: string
  }
  subject: {
    subjectName: string
  }
  course: {
    courseName: string
    grade: string
  }
  semester: {
    semester: string
    semesterCode: string
  }
  user?: {
    userId: number
    firstname: string
    lastname: string
    role: string
  }
}

interface Statistics {
  totalGrades: number
  averageGrade: number
  excellentGrades: number
  goodGrades: number
  averageGrades: number
  fairGrades: number
  poorGrades: number
}

export default function GradePage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <GradeContent />
    </RoleGuard>
  )
}

function GradeContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [grades, setGrades] = useState<Grade[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [statistics, setStatistics] = useState<Statistics>({
    totalGrades: 0,
    averageGrade: 0,
    excellentGrades: 0,
    goodGrades: 0,
    averageGrades: 0,
    fairGrades: 0,
    poorGrades: 0
  })
  const [error, setError] = useState<string | null>(null)

  // Robust parser for gradeDate that can handle MM/YY first, then ISO/native Date
  const parseGradeDate = (dateValue: any) => {
    if (!dateValue) return null
    // Prefer explicit MM/YY or MM/YYYY strings
    if (typeof dateValue === 'string') {
      const mmSlashYy = /^\d{1,2}\/\d{2,4}$/
      if (mmSlashYy.test(dateValue)) {
        const [m, y] = dateValue.split('/')
        const month = String(m).padStart(2, '0')
        const yearFull = y.length === 2 ? `20${y}` : y
        const year2 = yearFull.slice(-2)
        return { month, yearFull, year2 }
      }
    }
    // Else try Date parsing (ISO or Date object)
    try {
      const d = new Date(dateValue)
      if (!isNaN(d.getTime())) {
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const yearFull = String(d.getFullYear())
        const year2 = yearFull.slice(-2)
        return { month, yearFull, year2 }
      }
    } catch {}
    // Fallback: attempt generic split if contains '/'
    if (typeof dateValue === 'string' && dateValue.includes('/')) {
      const parts = dateValue.split('/')
      if (parts.length >= 2) {
        const month = parts[0]?.padStart(2, '0')
        const y = parts[1] || ''
        const yearFull = y.length === 2 ? `20${y}` : y
        const year2 = yearFull.slice(-2)
        return { month, yearFull, year2 }
      }
    }
    return null
  }

  // Fetch grades from database
  const fetchGrades = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/grades?limit=50')
      if (!response.ok) {
        throw new Error('Failed to fetch grades')
      }
      
      const data = await response.json()
      setGrades(data)
      calculateStatistics(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching grades:', error)
      setError('កំហុសក្នុងការទាញយកទិន្នន័យ')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to calculate average based on grade level
  const calculateAverageByGradeLevel = (sumGrade: number, countGrade: number, gradeLevel: string): number => {
    const level = parseInt(gradeLevel)
    
    if (isNaN(level)) {
      // If grade level is not a number, use simple average
      return countGrade > 0 ? sumGrade / countGrade : 0
    }
    
    // Grade 1-6: sumGrade / countGrade
    if (level >= 1 && level <= 6) {
      return countGrade > 0 ? sumGrade / countGrade : 0
    }
    // Grade 7-8: sumGrade / 14
    else if (level >= 7 && level <= 8) {
      return sumGrade / 14
    }
    // Grade 9: sumGrade / 8.4
    else if (level === 9) {
      return sumGrade / 8.4
    }
    // Default fallback for other grades (10-12)
    else {
      return countGrade > 0 ? sumGrade / countGrade : 0
    }
  }

  // Calculate statistics from grades data
  const calculateStatistics = (gradesData: Grade[]) => {
    if (gradesData.length === 0) {
      setStatistics({
        totalGrades: 0,
        averageGrade: 0,
        excellentGrades: 0,
        goodGrades: 0,
        averageGrades: 0,
        fairGrades: 0,
        poorGrades: 0
      })
      return
    }

    // Group grades by student to calculate individual averages
    const studentGrades = gradesData.reduce((acc, grade) => {
      const key = `${grade.studentId}-${grade.courseId}`
      if (!acc[key]) {
        acc[key] = {
          studentId: grade.studentId,
          gradeLevel: grade.course.grade,
          grades: []
        }
      }
      acc[key].grades.push(grade.grade)
      return acc
    }, {} as Record<string, { studentId: number; gradeLevel: string; grades: number[] }>)

    // Calculate average for each student based on their grade level
    const studentAverages = Object.values(studentGrades).map(student => {
      const sumGrade = student.grades.reduce((sum, g) => sum + g, 0)
      const countGrade = student.grades.length
      return calculateAverageByGradeLevel(sumGrade, countGrade, student.gradeLevel)
    })

    // Calculate overall statistics
    const totalGrades = gradesData.length
    const overallAverage = studentAverages.length > 0 
      ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length 
      : 0

    // Count by letter grades: A >= 90, B >= 80, C >= 70, D >= 60, E >= 50
    const excellentGrades = studentAverages.filter(avg => avg >= 90).length
    const goodGrades = studentAverages.filter(avg => avg >= 80 && avg < 90).length
    const averageGrades = studentAverages.filter(avg => avg >= 70 && avg < 80).length
    const fairGrades = studentAverages.filter(avg => avg >= 60 && avg < 70).length
    const poorGrades = studentAverages.filter(avg => avg >= 50 && avg < 60).length

    setStatistics({
      totalGrades,
      averageGrade: Math.round(overallAverage * 10) / 10,
      excellentGrades,
      goodGrades,
      averageGrades,
      fairGrades,
      poorGrades
    })
  }

  // Load data on component mount
  useEffect(() => {
    fetchGrades()
  }, [])

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600 dark:text-green-400"
    if (grade >= 80) return "text-blue-600 dark:text-blue-400"
    if (grade >= 70) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  // Helper function to get letter grade based on grade level
  const getLetterGrade = (score: number, gradeLevel: string): string => {
    const level = parseInt(gradeLevel)
    
    if (isNaN(level)) {
      // Fallback for unknown grade levels
      if (score >= 90) return 'A'
      if (score >= 80) return 'B'
      if (score >= 70) return 'C'
      if (score >= 60) return 'D'
      if (score >= 50) return 'E'
      return 'F'
    }
    
    if (level >= 1 && level <= 6) {
      // Grades 1-6: 10-point scale
      if (score >= 9) return 'A'
      if (score >= 8) return 'B'
      if (score >= 7) return 'C'
      if (score >= 6) return 'D'
      if (score >= 5) return 'E'
      return 'F'
    }
    
    if (level >= 7 && level <= 9) {
      // Grades 7-9: Based on calculated average (out of 50)
      if (score >= 45) return 'A'
      if (score >= 40) return 'B'
      if (score >= 35) return 'C'
      if (score >= 30) return 'D'
      if (score >= 25) return 'E'
      return 'F'
    }
    
    // Fallback for other grades (10-12)
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    if (score >= 50) return 'E'
    return 'F'
  }

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${grade.student.firstName} ${grade.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grade.user && `${grade.user.firstname} ${grade.user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()))
    
    let matchesFilter = true
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'A') matchesFilter = grade.grade >= 90
      else if (selectedFilter === 'B') matchesFilter = grade.grade >= 80 && grade.grade < 90
      else if (selectedFilter === 'C') matchesFilter = grade.grade >= 70 && grade.grade < 80
      else if (selectedFilter === 'D') matchesFilter = grade.grade >= 60 && grade.grade < 70
      else if (selectedFilter === 'E') matchesFilter = grade.grade >= 50 && grade.grade < 60
    }
    
    return matchesSearch && matchesFilter
  })

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedFilter('all')
    setCurrentPage(1)
  }

  const refreshData = () => {
    fetchGrades()
  }

  // Calculate top students by class based on sum of grades
  const calculateTopStudentsByClass = () => {
    // Filter grades by selected month/year
    const monthFilteredGrades = grades.filter(grade => {
      if (selectedMonth === 'all' && selectedYear === 'all') return true

      const parsed = parseGradeDate(grade.gradeDate as any)
      if (!parsed) return false

      const monthMatch = selectedMonth === 'all' || parsed.month === selectedMonth
      const yearMatch = selectedYear === 'all' || parsed.yearFull === selectedYear || parsed.year2 === selectedYear.slice(-2)

      return monthMatch && yearMatch
    })

    // Group grades by student and class
    const studentGradesMap = monthFilteredGrades.reduce((acc, grade) => {
      const key = `${grade.studentId}-${grade.courseId}`
      if (!acc[key]) {
        acc[key] = {
          studentId: grade.studentId,
          studentName: `${grade.student.lastName} ${grade.student.firstName}`,
          gradeLevel: grade.course.grade,
          courseName: grade.course.courseName,
          grades: []
        }
      }
      acc[key].grades.push(grade.grade)
      return acc
    }, {} as Record<string, { studentId: number; studentName: string; gradeLevel: string; courseName: string; grades: number[] }>)

    // Calculate sum for each student
    const studentSums = Object.values(studentGradesMap).map(student => {
      const sumGrade = student.grades.reduce((sum, g) => sum + g, 0)
      const countGrade = student.grades.length
      
      return {
        studentId: student.studentId,
        studentName: student.studentName,
        gradeLevel: student.gradeLevel,
        courseName: student.courseName,
        sumGrade: sumGrade,
        totalGrades: countGrade
      }
    })

    // Group by class and get top student in each class
    const classSums = studentSums.reduce((acc, student) => {
      const classKey = `${student.gradeLevel}-${student.courseName}`
      if (!acc[classKey] || acc[classKey].sumGrade < student.sumGrade) {
        acc[classKey] = student
      }
      return acc
    }, {} as Record<string, { studentId: number; studentName: string; gradeLevel: string; courseName: string; sumGrade: number; totalGrades: number }>)

    // Return all classes' top student sorted by sum grade (descending)
    return Object.values(classSums)
      .sort((a, b) => b.sumGrade - a.sumGrade)
  }

  const topStudents = calculateTopStudentsByClass()

  // Calculate monthly comparison by class
  const calculateMonthlyComparison = () => {
    const now = new Date()
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
    const currentYear = String(now.getFullYear()).slice(-2)
    
    // Get previous month
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1)
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0')
    const prevYear = String(prevDate.getFullYear()).slice(-2)

    // Group grades by class and month
    const classMonthGrades: Record<string, { currentSum: number; prevSum: number; className: string; gradeLevel: string }> = {}

    grades.forEach(grade => {
      const gradeDate = grade.gradeDate
      if (!gradeDate || typeof gradeDate !== 'string') return
      
      const dateParts = gradeDate.split('/')
      if (dateParts.length !== 2) return
      
      const [month, year] = dateParts
      const classKey = `${grade.course.grade}-${grade.course.courseName}`
      
      if (!classMonthGrades[classKey]) {
        classMonthGrades[classKey] = {
          currentSum: 0,
          prevSum: 0,
          className: grade.course.courseName,
          gradeLevel: grade.course.grade
        }
      }
      
      // Current month grades
      if (month === currentMonth && year === currentYear) {
        classMonthGrades[classKey].currentSum += grade.grade
      }
      
      // Previous month grades
      if (month === prevMonth && year === prevYear) {
        classMonthGrades[classKey].prevSum += grade.grade
      }
    })

    // Calculate comparison and filter classes with data
    return Object.entries(classMonthGrades)
      .filter(([_, data]) => data.currentSum > 0 || data.prevSum > 0)
      .map(([classKey, data]) => {
        const difference = data.currentSum - data.prevSum
        const percentChange = data.prevSum > 0 
          ? ((difference / data.prevSum) * 100).toFixed(1)
          : data.currentSum > 0 ? '100.0' : '0.0'
        
        return {
          classKey,
          className: data.className,
          gradeLevel: data.gradeLevel,
          currentSum: data.currentSum,
          prevSum: data.prevSum,
          difference,
          percentChange: parseFloat(percentChange),
          isImproving: difference > 0,
          isDecreasing: difference < 0
        }
      })
      .sort((a, b) => b.currentSum - a.currentSum)
  }

  const monthlyComparison = calculateMonthlyComparison()

  // Calculate total comparison across all classes
  const calculateTotalComparison = () => {
    const now = new Date()
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
    const currentYear = String(now.getFullYear()).slice(-2)
    
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1)
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0')
    const prevYear = String(prevDate.getFullYear()).slice(-2)

    let currentTotal = 0
    let prevTotal = 0

    grades.forEach(grade => {
      const gradeDate = grade.gradeDate
      if (!gradeDate || typeof gradeDate !== 'string') return
      
      const dateParts = gradeDate.split('/')
      if (dateParts.length !== 2) return
      
      const [month, year] = dateParts
      
      if (month === currentMonth && year === currentYear) {
        currentTotal += grade.grade
      }
      
      if (month === prevMonth && year === prevYear) {
        prevTotal += grade.grade
      }
    })

    const difference = currentTotal - prevTotal
    const percentChange = prevTotal > 0 
      ? ((difference / prevTotal) * 100).toFixed(1)
      : currentTotal > 0 ? '100.0' : '0.0'

    return {
      currentSum: currentTotal,
      prevSum: prevTotal,
      difference,
      percentChange: parseFloat(percentChange),
      isImproving: difference > 0,
      isDecreasing: difference < 0
    }
  }

  const totalComparison = calculateTotalComparison()

  // Pagination logic
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentGrades = filteredGrades.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1"
      >
        ‹
      </Button>
    )

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(1)}
          className="px-3 py-1"
        >
          1
        </Button>
      )
      if (startPage > 2) {
        pages.push(<span key="dots1" className="px-2">...</span>)
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="px-3 py-1"
        >
          {i}
        </Button>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="px-2">...</span>)
      }
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1"
        >
          {totalPages}
        </Button>
      )
    }

    // Next button
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1"
      >
        ›
      </Button>
    )

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        {pages}
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">
        <div className="container mx-auto space-y-4">
        {/* Modern Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:via-blue-500/20 dark:to-indigo-500/20 rounded-3xl -z-10" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <Filter className="h-4 w-4" />
                តម្រង
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                ធ្វើបច្ចុប្បន្នភាព
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Filter Panel */}
        {showFilters && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                តម្រងទិន្នន័យ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ស្វែងរក</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ស្វែងរកមុខវិជ្ជា ឬគ្រូបង្រៀន..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">និទ្ទេស</label>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសនិទ្ទេស" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ទាំងអស់</SelectItem>
                      <SelectItem value="A">A - ល្អប្រសើរ</SelectItem>
                      <SelectItem value="B">B - ល្អណាស់</SelectItem>
                      <SelectItem value="C">C - ល្អ</SelectItem>
                      <SelectItem value="D">D - ល្អបង្គួរ</SelectItem>
                      <SelectItem value="E">E - មធ្យម</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">សកម្មភាព</label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearFilters} size="sm">
                      កំណត់ឡើងវិញ
                    </Button>
                    <Button onClick={() => setShowFilters(false)} size="sm">
                      ប្រើប្រាស់
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium dark:text-red-400">កំហុស:</p>
                <p className="text-red-600 dark:text-red-300">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Card 1: Average Grade */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400">{statistics.averageGrade}</p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">មធ្យមភាគពិន្ទុ</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Average Score</p>
            </div>
            <div className="mt-4 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full group-hover:animate-pulse" style={{ width: `${Math.min((statistics.averageGrade / 100) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Excellent Grades (A) */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-200 dark:border-green-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-bold">និទ្ទេស A</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-green-600 dark:text-green-400">{statistics.excellentGrades}</p>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">សិស្សល្អប្រសើរ</p>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">Excellent Students</p>
            </div>
            <div className="mt-4 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full group-hover:animate-pulse" style={{ width: `${statistics.totalGrades > 0 ? (statistics.excellentGrades / statistics.totalGrades) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Very Good Grades (B) */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-bold">និទ្ទេស B</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400">{statistics.goodGrades}</p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">សិស្សល្អណាស់</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Very Good Students</p>
            </div>
            <div className="mt-4 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full group-hover:animate-pulse" style={{ width: `${statistics.totalGrades > 0 ? (statistics.goodGrades / statistics.totalGrades) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 4: Good Grades (C) */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 font-bold">និទ្ទេស C</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-yellow-600 dark:text-yellow-400">{statistics.averageGrades}</p>
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">សិស្សល្អ</p>
              <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Good Students</p>
            </div>
            <div className="mt-4 h-2 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full group-hover:animate-pulse" style={{ width: `${statistics.totalGrades > 0 ? (statistics.averageGrades / statistics.totalGrades) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 5: Total Grades */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 font-bold">សរុប</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-purple-600 dark:text-purple-400">{statistics.totalGrades}</p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">ពិន្ទុទាំងអស់</p>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Total Grades</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:animate-pulse w-full"></div>
              </div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Distribution & Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Chart */}
        <Card className="lg:col-span-2 backdrop-blur-sm border-0 shadow-xl bg-white/80 dark:bg-slate-800/80">
          <CardHeader className="p-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white rounded-t-xl">
            <CardTitle className="text-white flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl text-white">ការចែកចាយពិន្ទុ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-green-700 dark:text-green-300">និទ្ទេស A</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">ល្អប្រសើរ</Badge>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{statistics.excellentGrades} នាក់</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${statistics.totalGrades > 0 ? (statistics.excellentGrades / statistics.totalGrades) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-blue-700 dark:text-blue-300">និទ្ទេស B</span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">ល្អណាស់</Badge>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{statistics.goodGrades} នាក់</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${statistics.totalGrades > 0 ? (statistics.goodGrades / statistics.totalGrades) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-yellow-700 dark:text-yellow-300">និទ្ទេស C</span>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">ល្អ</Badge>
                  </div>
                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{statistics.averageGrades} នាក់</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${statistics.totalGrades > 0 ? (statistics.averageGrades / statistics.totalGrades) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-orange-700 dark:text-orange-300">និទ្ទេស D</span>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">ល្អបង្គួរ</Badge>
                  </div>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{statistics.fairGrades} នាក់</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${statistics.totalGrades > 0 ? (statistics.fairGrades / statistics.totalGrades) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-red-700 dark:text-red-300">និទ្ទេស E</span>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">មធ្យម</Badge>
                  </div>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">{statistics.poorGrades} នាក់</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${statistics.totalGrades > 0 ? (statistics.poorGrades / statistics.totalGrades) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t mt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">សរុបពិន្ទុទាំងអស់</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{statistics.totalGrades}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card className="backdrop-blur-sm border-0 shadow-xl bg-white/80 dark:bg-slate-800/80">
          <CardHeader className="p-6 bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 text-white rounded-t-xl">
            <CardTitle className="text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Medal className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl text-white">សិស្សឆ្នើមប្រចំាថ្នាក់</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {(() => {
                    if (selectedMonth === 'all' && selectedYear === 'all') return 'ទាំងអស់'
                    const months: Record<string, string> = { '01': 'មករា','02': 'កុម្ភៈ','03': 'មីនា','04': 'មេសា','05': 'ឧសភា','06': 'មិថុនា','07': 'កក្កដា','08': 'សីហា','09': 'កញ្ញា','10': 'តុលា','11': 'វិច្ឆិកា','12': 'ធ្នូ' }
                    const monthPart = selectedMonth === 'all' ? '' : `ខែ${months[selectedMonth] || selectedMonth}`
                    const yearPart = selectedYear === 'all' ? '' : `${monthPart ? ' ' : ''}ឆ្នាំ ${selectedYear}`
                    return `${monthPart}${yearPart}` || 'ទាំងអស់'
                  })()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Month/Year Filter */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">ខែ</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ទាំងអស់</SelectItem>
                    <SelectItem value="01">មករា</SelectItem>
                    <SelectItem value="02">កុម្ភៈ</SelectItem>
                    <SelectItem value="03">មីនា</SelectItem>
                    <SelectItem value="04">មេសា</SelectItem>
                    <SelectItem value="05">ឧសភា</SelectItem>
                    <SelectItem value="06">មិថុនា</SelectItem>
                    <SelectItem value="07">កក្កដា</SelectItem>
                    <SelectItem value="08">សីហា</SelectItem>
                    <SelectItem value="09">កញ្ញា</SelectItem>
                    <SelectItem value="10">តុលា</SelectItem>
                    <SelectItem value="11">វិច្ឆិកា</SelectItem>
                    <SelectItem value="12">ធ្នូ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">ឆ្នាំ</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ទាំងអស់</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Top Students List */}
            <div className="space-y-3">
              {topStudents.length > 0 ? (
                topStudents.map((student, index) => {
                  const months: Record<string, string> = { '01': 'មករា','02': 'កុម្ភៈ','03': 'មីនា','04': 'មេសា','05': 'ឧសភា','06': 'មិថុនា','07': 'កក្កដា','08': 'សីហា','09': 'កញ្ញា','10': 'តុលា','11': 'វិច្ឆិកា','12': 'ធ្នូ' }
                  const monthLabel = selectedMonth !== 'all' ? ` ខែ${months[selectedMonth] || selectedMonth}` : ''
                  return (
                  <div 
                    key={`${student.studentId}-${index}`}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-800/20 rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{student.studentName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ថ្នាក់ទី {student.gradeLevel} • {student.totalGrades} មុខវិជ្ជា{monthLabel}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{student.sumGrade.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">សរុបពិន្ទុ</p>
                    </div>
                  </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">មិនមានទិន្នន័យ</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades and Semester Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-2 backdrop-blur-sm border-0 shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/80`}>
            <CardHeader className="p-6 bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-600 text-white rounded-t-xl">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl text-white">ពិន្ទុថ្មីៗ</span>
                </div>
              <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Eye className="h-4 w-4 mr-1" />
                  មើលទាំងអស់
                </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Edit className="h-4 w-4 mr-1" />
                  កែប្រែ
                </Button>
              </div>
              </CardTitle>
          </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="text-base font-semibold">មុខវិជ្ជា</TableHead>
                      <TableHead className="text-base font-semibold">ពិន្ទុ</TableHead>
                      <TableHead className="text-base font-semibold">និទ្ទេស</TableHead>
                      <TableHead className="text-base font-semibold">គ្រូបង្រៀន</TableHead>
                      <TableHead className="text-base font-semibold">កាលបរិច្ឆេទ</TableHead>
                      <TableHead className="text-base font-semibold">ថ្នាក់រៀន</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGrades.length > 0 ? (
                  currentGrades.map((item) => (
                    <TableRow key={item.gradeId} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200">
                      <TableCell className="text-base font-medium">{item.subject.subjectName}</TableCell>
                      <TableCell>
                        <span className={`text-lg font-bold ${getGradeColor(item.grade)}`}>
                          {item.grade}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-base font-bold ${
                          getLetterGrade(item.grade, item.course.grade) === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          getLetterGrade(item.grade, item.course.grade) === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          getLetterGrade(item.grade, item.course.grade) === 'C' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          getLetterGrade(item.grade, item.course.grade) === 'D' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {getLetterGrade(item.grade, item.course.grade)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-base text-gray-600 dark:text-gray-400">
                        {item.user ? `${item.user.firstname} ${item.user.lastname}` : 'មិនដឹង'}
                      </TableCell>
                      <TableCell className="text-base text-gray-600 dark:text-gray-400">
                        {new Date(item.gradeDate).toLocaleDateString('km-KH')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.course.courseName}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      មិនមានទិន្នន័យ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
              </div>
              
              {/* Pagination Controls */}
              {renderPagination()}
              
              {/* Pagination Info */}
              {filteredGrades.length > 0 && (
                <div className="text-center text-sm text-muted-foreground mt-4">
                  បង្ហាញពិន្ទុពី {startIndex + 1} ដល់ {Math.min(endIndex, filteredGrades.length)} នៃ {filteredGrades.length} សរុប
                </div>
              )}
          </CardContent>
        </Card>

          <Card className={`backdrop-blur-sm border-0 shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/80`}>
            <CardHeader className="p-6 bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 text-white rounded-t-xl">
              <CardTitle className="text-white flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl text-white">ការប្រៀបធៀបប្រចាំខែ</span>
            </CardTitle>
          </CardHeader>
            <CardContent className="pt-6">
            <div className="space-y-3">
              {monthlyComparison.length > 0 ? (
                monthlyComparison.slice(0, 5).map((classData) => (
                  <div 
                    key={classData.classKey}
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 rounded-xl hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {classData.gradeLevel} {classData.className}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-600 dark:text-slate-400">ខែមុន: {classData.prevSum}</span>
                        <span className="text-xs text-slate-400">→</span>
                        <span className="text-xs font-medium text-slate-900 dark:text-white">ខែនេះ: {classData.currentSum}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {classData.isImproving ? (
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            +{classData.difference}
                          </span>
                        </div>
                      ) : classData.isDecreasing ? (
                        <div className="flex items-center gap-1">
                          <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">
                            {classData.difference}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Minus className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-400">
                            0
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {classData.percentChange > 0 ? '+' : ''}{classData.percentChange}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">មិនមានទិន្នន័យប្រៀបធៀប</p>
                </div>
              )}

              {/* Total Comparison Row */}
              {(totalComparison.currentSum > 0 || totalComparison.prevSum > 0) && (
                <>
                  <div className="border-t-2 border-purple-200 dark:border-purple-700 my-3"></div>
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-xl border-2 border-purple-300 dark:border-purple-600 shadow-md">
                    <div className="flex-1">
                      <p className="font-bold text-purple-900 dark:text-purple-100 text-base">
                        សរុបថ្នាក់ទាំងអស់
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">ខែមុន: {totalComparison.prevSum}</span>
                        <span className="text-xs text-purple-500">→</span>
                        <span className="text-xs font-bold text-purple-900 dark:text-purple-100">ខែនេះ: {totalComparison.currentSum}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {totalComparison.isImproving ? (
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="text-base font-bold text-green-600 dark:text-green-400">
                            +{totalComparison.difference}
                          </span>
                        </div>
                      ) : totalComparison.isDecreasing ? (
                        <div className="flex items-center gap-1">
                          <ArrowDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <span className="text-base font-bold text-red-600 dark:text-red-400">
                            {totalComparison.difference}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Minus className="h-5 w-5 text-slate-400" />
                          <span className="text-base font-bold text-slate-400">
                            0
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                        {totalComparison.percentChange > 0 ? '+' : ''}{totalComparison.percentChange}%
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Empty State */}
      {filteredGrades.length === 0 && (
          <Card className={`backdrop-blur-sm border-0 shadow-xl bg-white/80 dark:bg-slate-800/80`}>
          <CardContent className="p-12 text-center">
            <div className="mx-auto max-w-md">
                <BarChart2 className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">រកមិនឃើញពិន្ទុ</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">សូមព្យាយាមស្វែងរកជាមួយពាក្យផ្សេង</p>
                <Button onClick={clearFilters} variant="outline">
                  កំណត់ឡើងវិញ
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

        {/* Modern Footer */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 rounded-2xl -z-10" />
          <div className="text-center py-8 px-6">
            <div className="text-sm text-muted-foreground mb-4">
              ប្រព័ន្ធគ្រប់គ្រងពិន្ទុសិស្ស • ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: {lastUpdated.toLocaleString('km-KH')}
            </div>
            <div className="flex justify-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshData} 
                disabled={loading}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                ធ្វើបច្ចុប្បន្នភាព
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                តម្រងទិន្នន័យ
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
