'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
  FileText,
  Download as DownloadIcon,
  Plus as PlusIcon
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

interface Student {
  id: number
  name: string
  grade: string
  status: 'present' | 'absent' | 'late' | 'excused'
  date: string
  reason?: string
}

export default function AbsencePage() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Sample data
  const classData = [
    { name: "ថ្នាក់ទី ៧A", totalStudents: 45, present: 45, late: 2, excused: 3, unexcused: 0 },
    { name: "ថ្នាក់ទី ៨B", totalStudents: 42, present: 41, late: 5, excused: 1, unexcused: 1 },
    { name: "ថ្នាក់ទី ៩C", totalStudents: 38, present: 34, late: 3, excused: 2, unexcused: 2 },
    { name: "ថ្នាក់ទី ១០A", totalStudents: 40, present: 38, late: 4, excused: 1, unexcused: 1 },
    { name: "ថ្នាក់ទី ១១B", totalStudents: 35, present: 32, late: 2, excused: 2, unexcused: 1 },
  ]

  const students: Student[] = [
    { id: 1, name: "សុខ ចន្ទា", grade: "10A", status: "present", date: "2024-01-15" },
    { id: 2, name: "ម៉ៅ សុធារ៉ា", grade: "10A", status: "late", date: "2024-01-15" },
    { id: 3, name: "វង្ស សុផល", grade: "10A", status: "absent", date: "2024-01-15", reason: "ឈឺ" },
    { id: 4, name: "គឹម សុខា", grade: "10B", status: "present", date: "2024-01-15" },
    { id: 5, name: "ឈឹម វណ្ណា", grade: "10B", status: "excused", date: "2024-01-15", reason: "កិច្ចការគ្រួសារ" },
    { id: 6, name: "អ៊ុក សុវណ្ណា", grade: "11A", status: "absent", date: "2024-01-15", reason: "ឈឺ" },
  ]

  // Filter students based on criteria
  const filteredStudents = students.filter(student => {
    const matchesDate = !selectedDate || student.date === selectedDate
    const matchesGrade = !selectedGrade || student.grade === selectedGrade
    const matchesStatus = !selectedStatus || student.status === selectedStatus
    const matchesSearch = !searchTerm || student.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesDate && matchesGrade && matchesStatus && matchesSearch
  })

  // Weekly absence data
  const weeklyAbsenceData = {
    labels: ['ថ្ងៃច័ន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ'],
    datasets: [
      {
        label: 'ចំនួនអវត្តមាន',
        data: [10, 8, 5, 6, 10],
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
      }
    ]
  }

  // Monthly trend data for last 3 months
  const monthlyTrendData = {
    labels: ['មករា', 'កុម្ភៈ', 'មិនា'],
    datasets: [
      {
        label: 'អវត្តមានច្បាប់',
        data: [15, 20, 18],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
      {
        label: 'អវត្តមានឥតច្បាប់',
        data: [10, 8, 5],
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: 'rgba(244, 63, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'យឺតយ៉ាវ',
        data: [30, 35, 28],
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

  const calculatePercentage = (present: number, total: number) => {
    return ((present / total) * 100).toFixed(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">មាន</Badge>
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">អវត្តមាន</Badge>
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">យឺតយ៉ាវ</Badge>
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">ច្បាប់</Badge>
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-2">
          ការគ្រប់គ្រងវត្តមាន
        </h1>
        <p className="text-lg font-medium text-muted-foreground mt-3 leading-relaxed">
          តាមដានវត្តមានសិស្ស និងអវត្តមាន
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានថ្ងៃនេះ</CardTitle>
            <UserCheck className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">២៨ នាក់</div>
            <p className="text-xs text-muted-foreground">៤.៨% នៃសិស្សទាំងអស់</p>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-xs text-red-500">-២.១% ពីម្សិលមិញ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">យឺតយ៉ាវ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">១០ នាក់</div>
            <p className="text-xs text-muted-foreground">១.៧% នៃសិស្សទាំងអស់</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="text-xs text-yellow-500">+១.២% ពីម្សិលមិញ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានច្បាប់</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">៦ នាក់</div>
            <p className="text-xs text-muted-foreground">១.០% នៃសិស្សទាំងអស់</p>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">-០.៥% ពីម្សិលមិញ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានឥតច្បាប់</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">៣ នាក់</div>
            <p className="text-xs text-muted-foreground">០.៥% នៃសិស្សទាំងអស់</p>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-xs text-red-500">-០.២% ពីម្សិលមិញ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Pattern Chart */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានប្រចាំសប្តាហ៍</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <Bar data={weeklyAbsenceData} options={chartOptions} />
          </CardContent>
        </Card>

        {/* 3-Month Trend Chart */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានប្រចាំខែ</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
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
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">បញ្ជីអវត្តមានសិស្ស</CardTitle>
            </div>
            <div className="text-sm text-gray-500">
              សរុប: {filteredStudents.length} នាក់
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">ឈ្មោះសិស្ស</TableHead>
                  <TableHead className="font-semibold">ថ្នាក់</TableHead>
                  <TableHead className="font-semibold">ស្ថានភាព</TableHead>
                  <TableHead className="font-semibold">កាលបរិច្ឆេទ</TableHead>
                  <TableHead className="font-semibold">មូលហេតុ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(student.status)}
                        {getStatusBadge(student.status)}
                      </div>
                    </TableCell>
                    <TableCell>{student.date}</TableCell>
                    <TableCell>
                      {student.reason ? (
                        <span className="text-sm text-gray-600 dark:text-gray-400">{student.reason}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Class Breakdown */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle>អវត្តមានតាមថ្នាក់</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {classData.map((classInfo, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  (classInfo.present / classInfo.totalStudents) > 0.9 
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                    : (classInfo.present / classInfo.totalStudents) > 0.8 
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                      : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    (classInfo.present / classInfo.totalStudents) > 0.9 
                      ? "bg-green-100 text-green-600" 
                      : (classInfo.present / classInfo.totalStudents) > 0.8 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-red-100 text-red-600"
                  }`}>
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{classInfo.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{classInfo.totalStudents} សិស្ស</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <p className={`text-2xl font-bold ${
                    (classInfo.present / classInfo.totalStudents) > 0.9 
                      ? "text-green-600" 
                      : (classInfo.present / classInfo.totalStudents) > 0.8 
                        ? "text-blue-600" 
                        : "text-red-600"
                  }`}>
                    {calculatePercentage(classInfo.present, classInfo.totalStudents)}%
                  </p>
                  <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      យឺត: {classInfo.late}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-blue-500" />
                      ច្បាប់: {classInfo.excused}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      ឥត: {classInfo.unexcused}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
