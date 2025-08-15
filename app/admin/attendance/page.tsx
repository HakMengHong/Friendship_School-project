'use client'

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Users,
  Loader2
} from "lucide-react"
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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

interface Student {
  studentId: number
  firstName: string
  lastName: string
  class: string
}

interface Attendance {
  attendanceId: number
  studentId: number
  courseId: number
  attendanceDate: string
  session: 'AM' | 'PM' | 'FULL'
  status: string
  reason: string | null
  recordedBy: string | null
  createdAt: string
  updatedAt: string
  student: Student
  course: Course
}

export default function AbsencePage() {
  // State variables for filtering
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Data states
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAttendances, setLoadingAttendances] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Fetch attendances when filters change
  useEffect(() => {
    if (selectedDate) {
      fetchAttendances()
    }
  }, [selectedDate, selectedCourse, selectedStatus])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [schoolYearsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/school-years'),
        fetch('/api/admin/courses')
      ])

      if (!schoolYearsRes.ok || !coursesRes.ok) {
        const errorMessage = `Failed to fetch initial data: ${schoolYearsRes.status} ${schoolYearsRes.statusText}`
        throw new Error(errorMessage)
      }

      const [schoolYearsData, coursesData] = await Promise.all([
        schoolYearsRes.json(),
        coursesRes.json()
      ])

      setSchoolYears(schoolYearsData)
      setCourses(coursesData)
      
      // Set first school year as default if available
      if (schoolYearsData.length > 0) {
        setSelectedSchoolYear(schoolYearsData[0].schoolYearId.toString())
      }
      
      console.log(`✅ Successfully loaded ${schoolYearsData.length} school years and ${coursesData.length} courses`)
      setError(null) // Clear any previous errors
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch initial data')
      // Set empty arrays to prevent undefined errors
      setSchoolYears([])
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendances = async () => {
    if (!selectedDate) return
    
    try {
      setLoadingAttendances(true)
      const params = new URLSearchParams({
        date: selectedDate
      })
      
      if (selectedCourse) {
        params.append('courseId', selectedCourse)
      }

      if (selectedStatus) {
        params.append('status', selectedStatus)
      }

      const response = await fetch(`/api/admin/attendance?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAttendances(data)
      
      // Show success message if data is fetched
      if (data.length > 0) {
        console.log(`✅ Successfully fetched ${data.length} attendance records`)
      } else {
        console.log('ℹ️ No attendance records found for the selected criteria')
      }
      setError(null) // Clear any previous errors
    } catch (error) {
      console.error('Error fetching attendances:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch attendances')
      // Set empty array to show "no data" state
      setAttendances([])
    } finally {
      setLoadingAttendances(false)
    }
  }

  // Filter courses based on selected school year
  const filteredCourses = useMemo(() => 
    selectedSchoolYear 
      ? courses.filter(course => course.schoolYear.schoolYearId.toString() === selectedSchoolYear)
      : courses
  , [courses, selectedSchoolYear])

  // Filter attendances based on criteria
  const filteredAttendances = useMemo(() => {
    return attendances.filter(attendance => {
      const matchesStatus = !selectedStatus || attendance.status === selectedStatus
      const matchesSearch = !searchTerm || 
        `${attendance.student.firstName} ${attendance.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
  }, [attendances, selectedStatus, searchTerm])

  // Calculate statistics from real data
  const statistics = useMemo(() => {
    const totalAbsent = attendances.filter(a => a.status === 'absent').length
    const totalLate = attendances.filter(a => a.status === 'late').length
    const totalExcused = attendances.filter(a => a.status === 'excused').length
    
    return {
      totalAbsent,
      totalLate,
      totalExcused
    }
  }, [attendances])

  // Weekly absence data - simplified for now
  const weeklyAbsenceData = {
    labels: ['ថ្ងៃច័ន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ'],
    datasets: [
      {
        label: 'ចំនួនអវត្តមាន',
        data: [statistics.totalAbsent, statistics.totalAbsent, statistics.totalAbsent, statistics.totalAbsent, statistics.totalAbsent],
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
      }
    ]
  }

  // Monthly trend data - simplified for now
  const monthlyTrendData = {
    labels: ['មករា', 'កុម្ភៈ', 'មិនា'],
    datasets: [
      {
        label: 'អវត្តមាន(មានច្បាប់)',
        data: [statistics.totalExcused, statistics.totalExcused, statistics.totalExcused],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
      {
        label: 'អវត្តមាន(ឥតច្បាប់)',
        data: [statistics.totalAbsent, statistics.totalAbsent, statistics.totalAbsent],
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: 'rgba(244, 63, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'យឺត',
        data: [statistics.totalLate, statistics.totalLate, statistics.totalLate],
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} ដង`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return `${value} ដង`
          }
        }
      }
    }
  }



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">វត្តមាន</Badge>
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">អវត្តមាន(ឥតច្បាប់)</Badge>
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">យឺត</Badge>
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">អវត្តមាន(មានច្បាប់)</Badge>
      default:
        return <Badge>មិនដឹង</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'excused':
        return <UserCheck className="h-4 w-4 text-blue-600" />
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6 p-6">
             {/* Error Display */}
       {error && (
         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
           <div className="flex items-center gap-2">
             <AlertCircle className="h-5 w-5 text-red-500" />
             <span className="text-red-700 font-medium">កំហុស:</span>
             <span className="text-red-600">{error}</span>
             <button
               onClick={() => setError(null)}
               className="ml-auto text-red-500 hover:text-red-700"
             >
               ✕
             </button>
           </div>
         </div>
       )}



             {/* Admin Control Panel */}
       <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
         <CardHeader>
           <div className="flex items-center justify-between">
             <CardTitle className="text-lg flex items-center gap-2">
               <BarChart3 className="h-5 w-5 text-blue-500" />
               ផ្ទាំងគ្រប់គ្រងវត្តមាន
             </CardTitle>
             <div className="flex items-center gap-2">
               <button
                 onClick={() => {
                   setSelectedDate(new Date().toISOString().split('T')[0])
                   setSelectedCourse('')
                   setSelectedStatus('')
                   setSearchTerm('')
                 }}
                 className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
               >
                 កំណត់ឡើងវិញ
               </button>
               <button
                 onClick={fetchAttendances}
                 className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
               >
                 ធ្វើបច្ចុប្បន្នភាព
               </button>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           {loading ? (
             <div className="text-center py-8">
               <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
               <p className="text-sm text-muted-foreground">កំពុងទាញយក...</p>
             </div>
           ) : schoolYears.length === 0 || courses.length === 0 ? (
             <div className="text-center py-8">
               <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
               <p className="text-red-600 font-medium">មិនអាចទាញយកទិន្នន័យបានទេ</p>
               <p className="text-sm text-muted-foreground mt-2">
                 សូមពិនិត្យការតភ្ជាប់ទៅមូលដ្ឋានទិន្នន័យ ឬព្យាយាមម្តងទៀត
               </p>
               <button
                 onClick={fetchInitialData}
                 className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
               >
                 ព្យាយាមម្តងទៀត
               </button>
             </div>
           ) : (
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
             <div>
               <label className="text-sm font-medium mb-2 block">ឆ្នាំសិក្សា</label>
               <select 
                 value={selectedSchoolYear} 
                 onChange={(e) => setSelectedSchoolYear(e.target.value)}
                 className="w-full p-2 border border-gray-300 rounded-md"
               >
                 <option value="">ជ្រើសរើសឆ្នាំសិក្សា</option>
                 {schoolYears.map((year) => (
                   <option key={year.schoolYearId} value={year.schoolYearId.toString()}>
                     {year.schoolYearCode}
                   </option>
                 ))}
               </select>
             </div>
             <div>
               <label className="text-sm font-medium mb-2 block">ថ្នាក់</label>
               <select 
                 value={selectedCourse} 
                 onChange={(e) => setSelectedCourse(e.target.value)}
                 className="w-full p-2 border border-gray-300 rounded-md"
               >
                 <option value="">ជ្រើសរើសថ្នាក់</option>
                 {filteredCourses.map((course) => (
                   <option key={course.courseId} value={course.courseId.toString()}>
                     {course.courseName}
                   </option>
                 ))}
               </select>
             </div>
             <div>
               <label className="text-sm font-medium mb-2 block">កាលបរិច្ឆេទ</label>
               <input 
                 type="date" 
                 value={selectedDate} 
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="w-full p-2 border border-gray-300 rounded-md"
               />
             </div>
             <div>
               <label className="text-sm font-medium mb-2 block">ស្ថានភាព</label>
               <select 
                 value={selectedStatus} 
                 onChange={(e) => setSelectedStatus(e.target.value)}
                 className="w-full p-2 border border-gray-300 rounded-md"
               >
                 <option value="">ជ្រើសរើសស្ថានភាព</option>
                 <option value="absent">អវត្តមាន(ឥតច្បាប់)</option>
                 <option value="late">យឺត</option>
                 <option value="excused">អវត្តមាន(មានច្បាប់)</option>
               </select>
             </div>
             <div>
               <label className="text-sm font-medium mb-2 block">ស្វែងរក</label>
               <input 
                 type="text" 
                 placeholder="ស្វែងរកសិស្ស..."
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full p-2 border border-gray-300 rounded-md"
               />
                            </div>
             </div>
           )}
         </CardContent>
       </Card>

               {/* Admin Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">អវត្តមាន(ឥតច្បាប់)</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.totalAbsent} នាក់</div>
              <p className="text-xs text-muted-foreground">ត្រូវដោះស្រាយភ្លាមៗ</p>
              <div className="mt-2 text-xs text-red-600">
                {statistics.totalAbsent > 0 ? `⚠️ ត្រូវការការអភិវឌ្ឍន៍` : '✅ គ្រប់គ្រងបានល្អ'}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">យឺត</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.totalLate} នាក់</div>
              <p className="text-xs text-muted-foreground">ត្រូវការការអភិវឌ្ឍន៍</p>
              <div className="mt-2 text-xs text-yellow-600">
                {statistics.totalLate > 0 ? `⏰ ត្រូវការការអភិវឌ្ឍន៍` : '✅ គ្រប់គ្រងបានល្អ'}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">អវត្តមាន(មានច្បាប់)</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.totalExcused} នាក់</div>
              <p className="text-xs text-muted-foreground">អវត្តមានច្បាប់</p>
              <div className="mt-2 text-xs text-green-600">
                ✅ គ្រប់គ្រងបានល្អ
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">សរុបកត់ត្រា</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{attendances.length} នាក់</div>
              <p className="text-xs text-muted-foreground">កត់ត្រាវត្តមាន</p>
              <div className="mt-2 text-xs text-blue-600">
                📊 ទិន្នន័យពេញលេញ
              </div>
            </CardContent>
          </Card>
        </div>

             {/* Admin Analytics Dashboard */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         {/* Attendance Pattern Analysis */}
         <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium flex items-center gap-2">
               <BarChart3 className="h-4 w-4 text-purple-500" />
               ការវិភាគគំរូវត្តមាន
             </CardTitle>
             <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
               ប្រចាំសប្តាហ៍
             </div>
           </CardHeader>
           <CardContent>
             <Bar data={weeklyAbsenceData} options={chartOptions} />
             <div className="mt-3 text-xs text-muted-foreground text-center">
               ការវិភាគគំរូវត្តមានប្រចាំសប្ងៃដើម្បីដឹងថ្ងៃណាមានអវត្តមានច្រើន
             </div>
           </CardContent>
         </Card>

         {/* Monthly Trend Analysis */}
         <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium flex items-center gap-2">
               <Calendar className="h-4 w-4 text-blue-500" />
               ការវិភាគអវត្តមានប្រចាំខែ
             </CardTitle>
             <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
               ប្រចាំខែ
             </div>
           </CardHeader>
           <CardContent>
             <Bar 
               data={monthlyTrendData} 
               options={{
                 ...chartOptions,
                 scales: {
                   ...chartOptions.scales,
                   x: {
                     stacked: true,
                   },
                   y: {
                     ...chartOptions.scales.y,
                     stacked: true
                   }
                 }
               }} 
             />
             <div className="mt-3 text-xs text-muted-foreground text-center">
               ការវិភាគអវត្តមានប្រចាំខែដើម្បីដឹងថាខែណាមានបញ្ហាច្រើន
             </div>
           </CardContent>
         </Card>
       </div>

             {/* Admin Student Management Panel */}
       <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
         <CardHeader>
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-2">
               <Users className="h-5 w-5 text-green-600" />
               <CardTitle className="text-lg">ផ្ទាំងគ្រប់គ្រងសិស្ស</CardTitle>
             </div>
             <div className="flex items-center gap-4">
               <div className="text-sm text-gray-500">
                 សរុប: {filteredAttendances.length} នាក់
               </div>
               <div className="flex items-center gap-2">
                 <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                   អវត្តមាន: {statistics.totalAbsent}
                 </div>
                 <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                   យឺត: {statistics.totalLate}
                 </div>
                 <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                   ច្បាប់: {statistics.totalExcused}
                 </div>
               </div>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           {loadingAttendances ? (
             <div className="text-center py-8">
               <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
               <p className="text-sm text-muted-foreground">កំពុងទាញយក...</p>
             </div>
           ) : filteredAttendances.length > 0 ? (
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="font-semibold">ឈ្មោះសិស្ស</TableHead>
                     <TableHead className="font-semibold">ថ្នាក់</TableHead>
                     <TableHead className="font-semibold">ស្ថានភាព</TableHead>
                     <TableHead className="font-semibold">វេន</TableHead>
                     <TableHead className="font-semibold">កាលបរិច្ឆេទ</TableHead>
                     <TableHead className="font-semibold">មូលហេតុ</TableHead>
                     <TableHead className="font-semibold">ការអនុវត្ត</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredAttendances.map((attendance) => (
                     <TableRow key={attendance.attendanceId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                       <TableCell className="font-medium">
                         <div>
                           <div className="font-semibold">{attendance.student.firstName} {attendance.student.lastName}</div>
                           <div className="text-xs text-gray-500">ID: {attendance.student.studentId}</div>
                         </div>
                       </TableCell>
                       <TableCell>
                         <div>
                           <div className="font-medium">{attendance.course.courseName}</div>
                           <div className="text-xs text-gray-500">{attendance.course.grade} {attendance.course.section}</div>
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center space-x-2">
                           {getStatusIcon(attendance.status)}
                           {getStatusBadge(attendance.status)}
                         </div>
                       </TableCell>
                       <TableCell>
                         <Badge variant="outline" className="text-xs">
                           {attendance.session === 'AM' ? 'ព្រឹក' : attendance.session === 'PM' ? 'រសៀល' : 'ពេញមួយថ្ងៃ'}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <div>
                           <div>{attendance.attendanceDate}</div>
                           <div className="text-xs text-gray-500">
                             {attendance.recordedBy ? `ដោយ: ${attendance.recordedBy}` : 'មិនមានអ្នកកត់ត្រា'}
                           </div>
                         </div>
                       </TableCell>
                       <TableCell>
                         {attendance.reason ? (
                           <span className="text-sm text-gray-600 dark:text-gray-400">{attendance.reason}</span>
                         ) : (
                           <span className="text-sm text-gray-400">-</span>
                         )}
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                           <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                             កែប្រែ
                           </button>
                           <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                             លុប
                           </button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           ) : (
             <div className="text-center py-8">
               <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-500 dark:text-gray-400">
                 {searchTerm ? "រកមិនឃើញសិស្ស" : "មិនមានកត់ត្រាវត្តមាននៅថ្ងៃនេះទេ"}
               </p>
               <p className="text-sm text-muted-foreground mt-2">
                 សូមជ្រើសរើសកាលបរិច្ឆេទ ឬថ្នាក់ដើម្បីមើលកត់ត្រាវត្តមាន
               </p>
             </div>
           )}
                  </CardContent>
       </Card>

       {/* Admin Insights & Summary */}
       <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500">
         <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2">
             <BarChart3 className="h-5 w-5 text-indigo-500" />
             ការវិភាគ និងអនុសាសន៍សម្រាប់អ្នកគ្រប់គ្រង
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-3">
               <h4 className="font-semibold text-indigo-700">📊 ស្ថានភាពបច្ចុប្បន្ន</h4>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span>អវត្តមានឥតច្បាប់:</span>
                   <span className={`font-semibold ${statistics.totalAbsent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                     {statistics.totalAbsent > 0 ? '⚠️ ត្រូវដោះស្រាយ' : '✅ គ្រប់គ្រងបានល្អ'}
                   </span>
                 </div>
                 <div className="flex justify-between">
                   <span>យឺតយ៉ាវ:</span>
                   <span className={`font-semibold ${statistics.totalLate > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                     {statistics.totalLate > 0 ? '⏰ ត្រូវការការអភិវឌ្ឍន៍' : '✅ គ្រប់គ្រងបានល្អ'}
                   </span>
                 </div>
                 <div className="flex justify-between">
                   <span>អវត្តមានច្បាប់:</span>
                   <span className="font-semibold text-green-600">✅ គ្រប់គ្រងបានល្អ</span>
                 </div>
               </div>
             </div>

             <div className="space-y-3">
               <h4 className="font-semibold text-indigo-700">🎯 សកម្មភាពដែលត្រូវធ្វើ</h4>
               <div className="space-y-2 text-sm">
                 {statistics.totalAbsent > 0 && (
                   <div className="p-2 bg-red-50 border-l-4 border-red-400 rounded">
                     <p className="text-red-700">• ត្រូវដោះស្រាយអវត្តមានឥតច្បាប់ {statistics.totalAbsent} នាក់</p>
                   </div>
                 )}
                 {statistics.totalLate > 0 && (
                   <div className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                     <p className="text-yellow-700">• ត្រូវការការអភិវឌ្ឍន៍សិស្សយឺត {statistics.totalLate} នាក់</p>
                   </div>
                 )}
                 {statistics.totalAbsent === 0 && statistics.totalLate === 0 && (
                   <div className="p-2 bg-green-50 border-l-4 border-green-400 rounded">
                     <p className="text-green-700">• គ្រប់គ្រងបានល្អ! មិនមានបញ្ហាដែលត្រូវដោះស្រាយ</p>
                   </div>
                 )}
               </div>
             </div>

             <div className="space-y-3">
               <h4 className="font-semibold text-indigo-700">💡 អនុសាសន៍</h4>
               <div className="space-y-2 text-sm">
                 <div className="p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                   <p className="text-blue-700">• តាមដានអវត្តមានឥតច្បាប់ជាប្រចាំ</p>
                 </div>
                 <div className="p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                   <p className="text-blue-700">• បង្កើតផែនការការអភិវឌ្ឍន៍សិស្សយឺត</p>
                 </div>
                 <div className="p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                   <p className="text-blue-700">• ការវាយតម្លៃគុណភាពការអប់រំ</p>
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     </div>
   )
 }
