'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Users,
  Loader2,
  Calendar,
  BookOpen
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
  photo: string | null
  class: string
  gender: string
  enrollments: Array<{
    enrollmentId: number
    course: Course
  }>
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

interface AttendanceDailyTableProps {
  students: Student[]
  attendances: Attendance[]
  loading?: boolean
  loadingStudents?: boolean
  loadingAttendances?: boolean
  onStudentClick: (student: Student, session: 'AM' | 'PM' | 'FULL') => void
  onDeleteAttendance: (attendanceId: number) => void
  getAttendanceStatus: (studentId: number, session: 'AM' | 'PM' | 'FULL') => string
  getStatusBadge: (status: string) => { label: string; color: string }
}

export function AttendanceDailyTable({
  students,
  attendances,
  loading = false,
  loadingStudents = false,
  loadingAttendances = false,
  onStudentClick,
  onDeleteAttendance,
  getAttendanceStatus,
  getStatusBadge
}: AttendanceDailyTableProps) {
  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? '👨' : '👩'
  }

  if (loading || loadingStudents) {
    return (
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងវត្តមាន
              </CardTitle>
              <p className="text-white/80 text-sm">
                Attendance Table
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-green-600" />
              <p className="text-gray-600 dark:text-gray-400">
                កំពុងផ្ទុកព័ត៌មានវត្តមាន...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (students.length === 0) {
    return (
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងវត្តមាន
              </CardTitle>
              <p className="text-white/80 text-sm">
                Attendance Table
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              គ្មានសិស្ស
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              សូមជ្រើសរើសថ្នាក់ដើម្បីមើលវត្តមាន
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងវត្តមាន
              </CardTitle>
              <p className="text-white/80 text-sm">
                Attendance Table - {students.length} សិស្ស
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {students.length} សិស្ស
            </Badge>
            {loadingAttendances && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200 border-yellow-300/30">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                កំពុងផ្ទុក
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="font-semibold">សិស្ស</TableHead>
                <TableHead className="font-semibold text-center">ពេលព្រឹក (AM)</TableHead>
                <TableHead className="font-semibold text-center">ពេលរសៀល (PM)</TableHead>
                <TableHead className="font-semibold text-center">ពេញមួយថ្ងៃ (FULL)</TableHead>
                <TableHead className="font-semibold text-center">សកម្មភាព</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const amStatus = getAttendanceStatus(student.studentId, 'AM')
                const pmStatus = getAttendanceStatus(student.studentId, 'PM')
                const fullStatus = getAttendanceStatus(student.studentId, 'FULL')
                
                const amBadge = getStatusBadge(amStatus)
                const pmBadge = getStatusBadge(pmStatus)
                const fullBadge = getStatusBadge(fullStatus)

                return (
                  <TableRow key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {student.photo ? (
                            <img
                              src={student.photo}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getGenderIcon(student.gender)}</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {student.firstName} {student.lastName}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {student.studentId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Badge className={amBadge.color}>
                          {amBadge.label}
                        </Badge>
                        <Button
                          onClick={() => onStudentClick(student, 'AM')}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-green-200 hover:border-green-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Badge className={pmBadge.color}>
                          {pmBadge.label}
                        </Badge>
                        <Button
                          onClick={() => onStudentClick(student, 'PM')}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-green-200 hover:border-green-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Badge className={fullBadge.color}>
                          {fullBadge.label}
                        </Badge>
                        <Button
                          onClick={() => onStudentClick(student, 'FULL')}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-green-200 hover:border-green-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Show delete button for existing attendance records */}
                        {attendances
                          .filter(a => a.studentId === student.studentId)
                          .map((attendance) => (
                            <Button
                              key={`${attendance.studentId}-${attendance.session}`}
                              onClick={() => onDeleteAttendance(attendance.attendanceId)}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ការពន្យល់ស្ថានភាព (Status Legend)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                វត្តមាន
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                អវត្តមាន
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                យឺត
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Late</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                មានច្បាប់
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Excused</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
