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
  Award, 
  Target, 
  Medal,
  Plus,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  RefreshCw,
  MoreHorizontal,
  TrendingDown,
  BookMarked,
  Zap
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
  const [statistics, setStatistics] = useState<Statistics>({
    totalGrades: 0,
    averageGrade: 0,
    excellentGrades: 0,
    goodGrades: 0,
    averageGrades: 0,
    poorGrades: 0
  })
  const [error, setError] = useState<string | null>(null)

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

  // Calculate statistics from grades data
  const calculateStatistics = (gradesData: Grade[]) => {
    if (gradesData.length === 0) {
      setStatistics({
        totalGrades: 0,
        averageGrade: 0,
        excellentGrades: 0,
        goodGrades: 0,
        averageGrades: 0,
        poorGrades: 0
      })
      return
    }

    const totalGrades = gradesData.length
    const totalScore = gradesData.reduce((sum, grade) => sum + grade.grade, 0)
    const averageGrade = totalScore / totalGrades

    const excellentGrades = gradesData.filter(g => g.grade >= 90).length
    const goodGrades = gradesData.filter(g => g.grade >= 80 && g.grade < 90).length
    const averageGrades = gradesData.filter(g => g.grade >= 70 && g.grade < 80).length
    const poorGrades = gradesData.filter(g => g.grade < 70).length

    setStatistics({
      totalGrades,
      averageGrade: Math.round(averageGrade * 10) / 10,
      excellentGrades,
      goodGrades,
      averageGrades,
      poorGrades
    })
  }

  // Load data on component mount
  useEffect(() => {
    fetchGrades()
  }, [])

  const getStatusBadge = (grade: number) => {
    if (grade >= 90) {
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">ល្អណាស់</Badge>
    } else if (grade >= 80) {
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">ល្អ</Badge>
    } else if (grade >= 70) {
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">មធ្យម</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">ខ្សោយ</Badge>
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600 dark:text-green-400"
    if (grade >= 80) return "text-blue-600 dark:text-blue-400"
    if (grade >= 70) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${grade.student.firstName} ${grade.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grade.user && `${grade.user.firstname} ${grade.user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()))
    
    let matchesFilter = true
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'ល្អណាស់') matchesFilter = grade.grade >= 90
      else if (selectedFilter === 'ល្អ') matchesFilter = grade.grade >= 80 && grade.grade < 90
      else if (selectedFilter === 'មធ្យម') matchesFilter = grade.grade >= 70 && grade.grade < 80
      else if (selectedFilter === 'ខ្សោយ') matchesFilter = grade.grade < 70
    }
    
    return matchesSearch && matchesFilter
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedFilter('all')
  }

  const refreshData = () => {
    fetchGrades()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-4">
        {/* Modern Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:via-blue-500/20 dark:to-indigo-500/20 rounded-3xl -z-10" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6">
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
                  <label className="text-sm font-medium">ស្ថានភាព</label>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ទាំងអស់</SelectItem>
                      <SelectItem value="ល្អណាស់">ល្អណាស់</SelectItem>
                      <SelectItem value="ល្អ">ល្អ</SelectItem>
                      <SelectItem value="មធ្យម">មធ្យម</SelectItem>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{statistics.averageGrade}</p>
                  <p className="text-sm text-blue-500 dark:text-blue-300 font-medium">ពិន្ទុមធ្យម</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">{statistics.excellentGrades}</p>
                  <p className="text-sm text-green-500 dark:text-green-300 font-medium">ល្អណាស់</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{statistics.goodGrades}</p>
                  <p className="text-sm text-blue-500 dark:text-blue-300 font-medium">ល្អ</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                  <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{statistics.totalGrades}</p>
                <p className="text-sm text-orange-500 dark:text-orange-300 font-medium">ពិន្ទុសរុប</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>

        {/* Modern Analytics Dashboard */}
        

      {/* Goals Tracking */}
        <Card className={`backdrop-blur-sm border-0 shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/80`}>
          <CardHeader className="p-6 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 text-white rounded-t-xl">
            <CardTitle className="text-white flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl text-white">ការតាមដានគោលដៅ</span>
          </CardTitle>
        </CardHeader>
          <CardContent className="p-6">
          <div className="space-y-6">
              <div className="group p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex justify-between mb-3">
                  <span className="text-base font-medium text-blue-700 dark:text-blue-300">ពិន្ទុមធ្យមសរុប</span>
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{statistics.averageGrade}/100</span>
              </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 group-hover:shadow-lg" 
                    style={{ width: `${statistics.averageGrade}%` }}
                ></div>
              </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">ពិន្ទុមធ្យម</span>
              </div>
            </div>

              <div className="group p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex justify-between mb-3">
                  <span className="text-base font-medium text-green-700 dark:text-green-300">ពិន្ទុល្អណាស់</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">{statistics.excellentGrades}</span>
              </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 group-hover:shadow-lg" 
                    style={{ width: `${statistics.totalGrades > 0 ? (statistics.excellentGrades / statistics.totalGrades) * 100 : 0}%` }}
                ></div>
              </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">ពិន្ទុ ≥ 90</span>
              </div>
            </div>

              <div className="group p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex justify-between mb-3">
                  <span className="text-base font-medium text-purple-700 dark:text-purple-300">ពិន្ទុល្អ</span>
                  <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">{statistics.goodGrades}</span>
              </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 group-hover:shadow-lg" 
                    style={{ width: `${statistics.totalGrades > 0 ? (statistics.goodGrades / statistics.totalGrades) * 100 : 0}%` }}
                ></div>
              </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">ពិន្ទុ 80-89</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <CardContent className="p-6">
              <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="text-base font-semibold">មុខវិជ្ជា</TableHead>
                      <TableHead className="text-base font-semibold">ពិន្ទុ</TableHead>
                      <TableHead className="text-base font-semibold">គ្រូបង្រៀន</TableHead>
                      <TableHead className="text-base font-semibold">កាលបរិច្ឆេទ</TableHead>
                      <TableHead className="text-base font-semibold">ស្ថានភាព</TableHead>
                      <TableHead className="text-base font-semibold">ថ្នាក់រៀន</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((item) => (
                      <TableRow key={item.gradeId} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200">
                        <TableCell className="text-base font-medium">{item.subject.subjectName}</TableCell>
                    <TableCell>
                      <span className={`text-lg font-bold ${getGradeColor(item.grade)}`}>
                        {item.grade}
                      </span>
                    </TableCell>
                    <TableCell className="text-base text-gray-600 dark:text-gray-400">
                          {item.user ? `${item.user.firstname} ${item.user.lastname}` : 'មិនដឹង'}
                    </TableCell>
                    <TableCell className="text-base text-gray-600 dark:text-gray-400">
                          {new Date(item.gradeDate).toLocaleDateString('km-KH')}
                    </TableCell>
                    <TableCell>
                          {getStatusBadge(item.grade)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {item.course.courseName}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
          </CardContent>
        </Card>

          <Card className={`backdrop-blur-sm border-0 shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/80`}>
            <CardHeader className="p-6 bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 text-white rounded-t-xl">
              <CardTitle className="text-white flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl text-white">ការប្រៀបធៀបពាក់កណ្តាលឆ្នាំ</span>
            </CardTitle>
          </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-4">
                <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:shadow-md transition-all duration-200">
                <div>
                    <p className="font-medium text-blue-700 dark:text-blue-300">ពិន្ទុមធ្យមសរុប</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">ពិន្ទុប្រចាំឆ្នាំ</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{statistics.averageGrade}</p>
                    <p className="text-sm text-blue-500 dark:text-blue-400">ពិន្ទុ</p>
                </div>
              </div>
                <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:shadow-md transition-all duration-200">
                <div>
                    <p className="font-medium text-green-700 dark:text-green-300">ពិន្ទុល្អណាស់</p>
                    <p className="text-sm text-green-600 dark:text-green-400">ពិន្ទុ ≥ 90</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{statistics.excellentGrades}</p>
                    <p className="text-sm text-green-500 dark:text-green-400 font-medium">នាក់</p>
                </div>
              </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">ពិន្ទុសរុប</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{statistics.totalGrades}</p>
                  <p className="text-sm text-purple-500 dark:text-purple-400">ពិន្ទុទាំងអស់</p>
              </div>
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
  )
}
