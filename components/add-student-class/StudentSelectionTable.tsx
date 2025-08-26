'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  GraduationCap,
  CheckCircle,
  XCircle,
  Phone,
  Calendar,
  BookOpen,
  UserPlus
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
  classId?: number
  createdAt?: string
  updatedAt?: string
  photo?: string
  registrationDate?: string
  scholarships?: any[]
  attendances?: any[]
  family?: any[]
  guardians?: any[]
}

interface StudentSelectionTableProps {
  students: Student[]
  selectedStudents: number[]
  loading?: boolean
  dataLoading?: boolean
  onStudentSelection: (studentId: number) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  isStudentEnrolled: (studentId: number) => boolean
  getSelectedCourseName: () => string
}

export function StudentSelectionTable({
  students,
  selectedStudents,
  loading = false,
  dataLoading = false,
  onStudentSelection,
  onSelectAll,
  onDeselectAll,
  isStudentEnrolled,
  getSelectedCourseName
}: StudentSelectionTableProps) {
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

  const isAllSelected = students.length > 0 && selectedStudents.length === students.length
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < students.length

  if (dataLoading) {
    return (
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                ជ្រើសរើសសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student Selection Table
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-indigo-600" />
              <p className="text-gray-600 dark:text-gray-400">
                កំពុងផ្ទុកព័ត៌មានសិស្ស...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (students.length === 0) {
    return (
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                ជ្រើសរើសសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student Selection Table
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
              មិនមានសិស្សដែលត្រូវគ្នានឹងការច្រោះរបស់អ្នក
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                ជ្រើសរើសសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student Selection Table - {students.length} សិស្ស
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {selectedStudents.length} ជ្រើសរើស
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
        {/* Selection Controls */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate
                }}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectAll()
                  } else {
                    onDeselectAll()
                  }
                }}
              />
              <span className="text-sm font-medium text-indigo-700">
                ជ្រើសរើសទាំងអស់
              </span>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
              {selectedStudents.length} / {students.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4 text-indigo-600" />
            <span className="text-sm text-indigo-600">
              ជ្រើសរើសសិស្សដើម្បីបន្ថែមទៅក្នុងថ្នាក់
            </span>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead className="font-semibold">សិស្ស</TableHead>
                <TableHead className="font-semibold">ព័ត៌មានទំនាក់ទំនង</TableHead>
                <TableHead className="font-semibold">ថ្នាក់</TableHead>
                <TableHead className="font-semibold">ស្ថានភាព</TableHead>
                <TableHead className="font-semibold">កាលបរិច្ឆេទ</TableHead>
                <TableHead className="font-semibold">ចុះឈ្មោះ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const isSelected = selectedStudents.includes(student.studentId)
                const isEnrolled = isStudentEnrolled(student.studentId)
                
                return (
                  <TableRow 
                    key={student.studentId} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onStudentSelection(student.studentId)}
                        disabled={isEnrolled}
                      />
                    </TableCell>
                    
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
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-indigo-600" />
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
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium">{student.class}</span>
                      </div>
                      {student.schoolYear && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {student.schoolYear}
                        </p>
                      )}
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
                            {formatDate(student.registrationDate || student.createdAt)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {isEnrolled ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            ចុះឈ្មោះរួចហើយ
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                            មិនទាន់ចុះឈ្មោះ
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Selection Summary */}
        {selectedStudents.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="text-sm font-semibold text-green-700">
                    សិស្សដែលបានជ្រើសរើស
                  </h4>
                  <p className="text-xs text-green-600">
                    {selectedStudents.length} សិស្ស ត្រៀមចុះឈ្មោះទៅក្នុងថ្នាក់
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-700">
                  ថ្នាក់គោលដៅ
                </p>
                <p className="text-xs text-green-600">
                  {getSelectedCourseName() || 'មិនទាន់ជ្រើសរើស'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ការពន្យល់ស្ថានភាព (Status Legend)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                ចុះឈ្មោះរួចហើយ
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Enrolled</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                មិនទាន់ចុះឈ្មោះ
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Not Enrolled</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-indigo-600" />
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                ជ្រើសរើស
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                ថ្នាក់គោលដៅ
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Target Class</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
