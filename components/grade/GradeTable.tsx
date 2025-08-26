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
  BookOpen,
  Users,
  Plus as PlusIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit3,
  GraduationCap,
  CalendarDays,
  Hash,
  TrendingUp,
  User,
  MessageSquare,
  Star
} from "lucide-react"

interface Student {
  studentId: number
  firstName: string
  lastName: string
  photo: string | null
  class: string
  gender: string
  enrollments: Array<{
    enrollmentId: number
    course: any
  }>
}

interface Grade {
  gradeId: number
  studentId: number
  subjectId: number
  courseId: number
  semesterId: number
  grade: number
  gradeComment: string | null
  gradeDate: string
  userId: number | null
  user?: {
    userId: number
    firstname: string
    lastname: string
    role: string
  }
  student: Student
  subject: any
  course: any
  semester: any
}

interface GradeTableProps {
  grades: Grade[]
  loadingGrades: boolean
  onEditGrade: (grade: Grade) => void
  onDeleteGrade: (gradeId: number) => void
  getGradeLabel: (grade: string | number) => string
}

export function GradeTable({
  grades,
  loadingGrades,
  onEditGrade,
  onDeleteGrade,
  getGradeLabel
}: GradeTableProps) {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (grade >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    if (grade >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    if (grade >= 60) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  }

  const getGradeStatus = (grade: number) => {
    if (grade >= 90) return 'ល្អណាស់'
    if (grade >= 80) return 'ល្អ'
    if (grade >= 70) return 'មធ្យម'
    if (grade >= 60) return 'គ្រប់គ្រាន់'
    return 'មិនគ្រប់គ្រាន់'
  }

  return (
    <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">តារាងពិន្ទុ</CardTitle>
              <p className="text-purple-100 text-sm">Grade Table</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {grades.length} ពិន្ទុ
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loadingGrades ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="text-gray-600 dark:text-gray-400">កំពុងផ្ទុកពិន្ទុ...</span>
            </div>
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              គ្មានពិន្ទុ
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              សូមជ្រើសរើសជម្រើសច្រោះដើម្បីមើលពិន្ទុ
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
                      <BookOpen className="h-4 w-4" />
                      <span>មុខវិជ្ជា</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>ពិន្ទុ</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4" />
                      <span>ស្ថានភាព</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>កំណត់សម្គាល់</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>កាលបរិច្ឆេទ</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>អ្នកបញ្ចូល</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300 text-center">
                    សកម្មភាព
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.gradeId} className="hover:bg-purple-50 dark:hover:bg-purple-950/10">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {grade.student.firstName} {grade.student.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ថ្នាក់ទី {getGradeLabel(grade.student.class)} | ID: {grade.student.studentId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{grade.subject.subjectName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={`px-3 py-1 font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade.toFixed(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`border-2 ${getGradeColor(grade.grade)}`}
                      >
                        {getGradeStatus(grade.grade)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {grade.gradeComment ? (
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {grade.gradeComment}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            គ្មានកំណត់សម្គាល់
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">{grade.gradeDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {grade.user ? (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">
                            {grade.user.firstname} {grade.user.lastname}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          មិនមាន
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          onClick={() => onEditGrade(grade)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => onDeleteGrade(grade.gradeId)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary Statistics */}
        {grades.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                ស្ថិតិពិន្ទុ (Grade Statistics)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ចំនួនសរុប</p>
                <p className="font-bold text-purple-700 dark:text-purple-300">{grades.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ពិន្ទុមធ្យម</p>
                <p className="font-bold text-purple-700 dark:text-purple-300">
                  {(grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ពិន្ទុខ្ពស់បំផុត</p>
                <p className="font-bold text-green-600">
                  {Math.max(...grades.map(g => g.grade)).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ពិន្ទុទាបបំផុត</p>
                <p className="font-bold text-red-600">
                  {Math.min(...grades.map(g => g.grade)).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
