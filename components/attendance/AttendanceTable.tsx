'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar,
  UserCheck,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  GraduationCap,
  MessageSquare,
  Clock3
} from "lucide-react"

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

interface AttendanceTableProps {
  attendances: Attendance[]
  loadingAttendances: boolean
  getGradeLabel: (grade: string | number) => string
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => string
}

export function AttendanceTable({
  attendances,
  loadingAttendances,
  getGradeLabel,
  getStatusColor,
  getStatusIcon
}: AttendanceTableProps) {
  const getSessionLabel = (session: string) => {
    switch (session) {
      case 'AM':
        return 'ព្រឹក'
      case 'PM':
        return 'ល្ងាច'
      case 'FULL':
        return 'ពេញមួយថ្ងៃ'
      default:
        return session
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'មានវត្តមាន'
      case 'ABSENT':
        return 'អវត្តមាន'
      case 'LATE':
        return 'មកយឺត'
      case 'EXCUSED':
        return 'មានអធិការដើម្បី'
      default:
        return status
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle':
        return <CheckCircle className="h-4 w-4" />
      case 'XCircle':
        return <XCircle className="h-4 w-4" />
      case 'Clock':
        return <Clock className="h-4 w-4" />
      case 'AlertCircle':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <UserCheck className="h-4 w-4" />
    }
  }

  return (
    <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">តារាងវត្តមាន</CardTitle>
              <p className="text-purple-100 text-sm">Attendance Records</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {attendances.length} កំណត់ត្រា
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loadingAttendances ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="text-gray-600 dark:text-gray-400">កំពុងផ្ទុកវត្តមាន...</span>
            </div>
          </div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              គ្មានកំណត់ត្រវត្តមាន
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              សូមជ្រើសរើសជម្រើសច្រោះដើម្បីមើលវត្តមាន
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>សិស្ស</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>ថ្នាក់</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>ថ្ងៃខែ</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <Clock3 className="h-4 w-4" />
                      <span>វគ្គ</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4" />
                      <span>ស្ថានភាព</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>មូលហេតុ</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>អ្នកកត់ត្រា</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((attendance) => (
                  <TableRow key={attendance.attendanceId} className="hover:bg-purple-50 dark:hover:bg-purple-950/10">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {attendance.student.firstName} {attendance.student.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ថ្នាក់ទី {getGradeLabel(attendance.student.class)} | ID: {attendance.student.studentId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">
                          {getGradeLabel(attendance.course.grade)} - {attendance.course.section}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          {new Date(attendance.attendanceDate).toLocaleDateString('km-KH')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300">
                        {getSessionLabel(attendance.session)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={`px-3 py-1 font-bold ${getStatusColor(attendance.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getIconComponent(getStatusIcon(attendance.status))}
                            <span>{getStatusLabel(attendance.status)}</span>
                          </div>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {attendance.reason ? (
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {attendance.reason}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            គ្មានមូលហេតុ
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {attendance.recordedBy ? (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">
                            {attendance.recordedBy}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          មិនមាន
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Attendance Summary */}
        {attendances.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                សង្ខេបវត្តមាន (Attendance Summary)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ចំនួនសរុប</p>
                <p className="font-bold text-purple-700 dark:text-purple-300">{attendances.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">មានវត្តមាន</p>
                <p className="font-bold text-green-600">
                  {attendances.filter(a => a.status === 'PRESENT').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">អវត្តមាន</p>
                <p className="font-bold text-red-600">
                  {attendances.filter(a => a.status === 'ABSENT').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">មកយឺត</p>
                <p className="font-bold text-yellow-600">
                  {attendances.filter(a => a.status === 'LATE').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
