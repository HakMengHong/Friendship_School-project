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
  Users,
  Loader2,
  Eye,
  Trash2,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  UserCheck,
  UserX,
  AlertTriangle,
  School
} from "lucide-react"

interface Student {
  studentId: number
  firstName: string
  lastName: string
  gender: string
  dob: string
  class: string
  phone?: string
  status: string
  schoolYear: string
  photo?: string
  registrationDate?: string
}

interface Course {
  courseId: number
  grade: string
  section: string
  courseName: string
  schoolYear: {
    schoolYearId: number
    schoolYearCode: string
  }
  teacherId1?: number
  teacherId2?: number
  teacherId3?: number
}

interface Enrollment {
  enrollmentId: number
  studentId: number
  courseId: number
  enrollmentDate: string
  drop: boolean
  dropDate?: string
  student: Student
  course: Course
}

interface ViewStudentClassTableProps {
  enrollments: Enrollment[]
  loading?: boolean
  dataLoading?: boolean
  autoShowStudents?: boolean
  onRemoveStudent: (enrollment: Enrollment) => void
  getCourseName: (courseId: number) => string
  getTeacherName: (teacherId?: number) => string
}

export function ViewStudentClassTable({
  enrollments,
  loading = false,
  dataLoading = false,
  autoShowStudents = false,
  onRemoveStudent,
  getCourseName,
  getTeacherName
}: ViewStudentClassTableProps) {
  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('km-KH')
  }

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? '👨' : '👩'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'សកម្ម'
      case 'inactive':
        return 'អសកម្ម'
      default:
        return 'មិនដឹង'
    }
  }

  if (dataLoading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                បញ្ជីសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student List Table
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">
                កំពុងផ្ទុកព័ត៌មានសិស្ស...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (enrollments.length === 0) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                បញ្ជីសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student List Table
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
              {autoShowStudents 
                ? 'មិនមានសិស្សដែលត្រូវគ្នានឹងការច្រោះរបស់អ្នក'
                : 'សូមជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់ដើម្បីមើលសិស្ស'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                បញ្ជីសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student List Table - {enrollments.length} សិស្ស
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {enrollments.length} សិស្ស
            </Badge>
            {loading && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200 border-yellow-300/30">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                កំពុងដំណើរការ
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Student Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="font-semibold">សិស្ស</TableHead>
                <TableHead className="font-semibold">ព័ត៌មានទំនាក់ទំនង</TableHead>
                <TableHead className="font-semibold">ថ្នាក់</TableHead>
                <TableHead className="font-semibold">ឆ្នាំសិក្សា</TableHead>
                <TableHead className="font-semibold">ស្ថានភាព</TableHead>
                <TableHead className="font-semibold">កាលបរិច្ឆេទចុះឈ្មោះ</TableHead>
                <TableHead className="font-semibold">សកម្មភាព</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => {
                const student = enrollment.student
                const course = enrollment.course
                
                return (
                  <TableRow 
                    key={enrollment.enrollmentId} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
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
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
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
                    
                    <TableCell>
                      <div className="space-y-1">
                        {student.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{student.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(student.dob)}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{getCourseName(course.courseId)}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {course.grade}{course.section}
                        </p>
                        {/* Teacher Information */}
                        {course.teacherId1 && (
                          <div className="flex items-center space-x-1">
                            <School className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {getTeacherName(course.teacherId1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{student.schoolYear}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {getStatusLabel(student.status)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(enrollment.enrollmentDate)}
                          </span>
                        </div>
                        {enrollment.drop && enrollment.dropDate && (
                          <div className="flex items-center space-x-1">
                            <UserX className="h-3 w-3 text-red-400" />
                            <span className="text-xs text-red-500">
                              ដកចេញ: {formatDate(enrollment.dropDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => onRemoveStudent(enrollment)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          ដកចេញ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary Information */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-semibold text-blue-700">
                  សង្ខេបព័ត៌មាន
                </h4>
                <p className="text-xs text-blue-600">
                  សិស្សដែលបានបង្ហាញ: {enrollments.length} នាក់
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-700">
                ស្ថានភាព
              </p>
              <p className="text-xs text-blue-600">
                សិស្សសកម្ម: {enrollments.filter(e => !e.drop).length} នាក់
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ការពន្យល់ស្ថានភាព (Status Legend)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                សកម្ម
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-gray-400" />
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                អសកម្ម
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                ថ្នាក់
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Class</span>
            </div>
            <div className="flex items-center space-x-2">
              <School className="h-4 w-4 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                គ្រូ
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Teacher</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
