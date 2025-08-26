'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Users,
  UserCheck,
  Grid3X3,
  List,
  MoreHorizontal,
  Clock,
  Edit,
  Save,
  UserPlus,
  GraduationCap,
  Calendar,
  Hash,
  BookOpen
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Course {
  courseId: number
  schoolYearId: number
  teacherId1?: number
  teacherId2?: number
  teacherId3?: number
  grade: string
  section: string
  courseName: string
  createdAt: string
  updatedAt?: string
}

interface Teacher {
  userid: number
  username: string
  firstname: string
  lastname: string
  role: string
  position?: string
}

interface TeacherAssignmentProps {
  courses: Course[]
  teachers: Teacher[]
  submitting: boolean
  onUpdateTeacherAssignment: (courseId: number, teacherId: number, position: 1 | 2 | 3) => void
  onRemoveTeacherAssignment: (courseId: number, position: 1 | 2 | 3) => void
}

export function TeacherAssignment({
  courses,
  teachers,
  submitting,
  onUpdateTeacherAssignment,
  onRemoveTeacherAssignment
}: TeacherAssignmentProps) {
  const getTeacherName = (teacherId: number | undefined) => {
    if (!teacherId) return 'មិនមាន'
    const teacher = teachers.find(t => t.userid === teacherId)
    return teacher ? `${teacher.firstname} ${teacher.lastname}` : 'មិនដឹង'
  }

  const getTeacherById = (teacherId: number) => {
    return teachers.find(t => t.userid === teacherId)
  }

  const getAssignedTeachers = (course: Course) => {
    const assigned = []
    if (course.teacherId1) assigned.push({ id: course.teacherId1, position: 1 })
    if (course.teacherId2) assigned.push({ id: course.teacherId2, position: 2 })
    if (course.teacherId3) assigned.push({ id: course.teacherId3, position: 3 })
    return assigned
  }

  const getAvailableTeachers = (course: Course) => {
    const assignedIds = [course.teacherId1, course.teacherId2, course.teacherId3].filter(Boolean)
    return teachers.filter(teacher => !assignedIds.includes(teacher.userid))
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">ការចាត់តាំងគ្រូ</h2>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {courses.length} ថ្នាក់រៀន
                </Badge>
                <div className="h-1 w-8 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {courses.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-orange-500 rounded-full flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                គ្មានថ្នាក់រៀនទេ
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                សូមបង្កើតថ្នាក់រៀនជាមុនសិន ដើម្បីចាត់តាំងគ្រូ
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Teacher Assignment Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    ការចាត់តាំងគ្រូ
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    ចាត់តាំងគ្រូទៅថ្នាក់រៀន
                  </p>
                </div>
              </div>
            </div>
            
            {/* Courses with Teacher Assignment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map((course) => {
                const assignedTeachers = getAssignedTeachers(course)
                const availableTeachers = getAvailableTeachers(course)
                
                return (
                  <div key={course.courseId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                    {/* Course Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                          {course.courseName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ថ្នាក់ទី {course.grade} ផ្នែក {course.section}
                        </p>
                      </div>
                    </div>

                    {/* Current Teacher Assignments */}
                    <div className="space-y-3 mb-6">
                      <h5 className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        គ្រូដែលបានចាត់តាំង
                      </h5>
                      
                      {assignedTeachers.length === 0 ? (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <p className="text-sm text-orange-600 dark:text-orange-400">
                            គ្មានគ្រូត្រូវបានចាត់តាំងទេ
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {assignedTeachers.map(({ id, position }) => {
                            const teacher = getTeacherById(id)
                            return (
                              <div key={`${course.courseId}-${position}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center space-x-3">
                                  <Badge variant="secondary" className="bg-orange-500 text-white">
                                    គ្រូទី{position}
                                  </Badge>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {teacher ? `${teacher.firstname} ${teacher.lastname}` : 'មិនដឹង'}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemoveTeacherAssignment(course.courseId, position as 1 | 2 | 3)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  disabled={submitting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Add New Teacher Assignment */}
                    {assignedTeachers.length < 3 && availableTeachers.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                        <h5 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          បន្ថែមគ្រូថ្មី
                        </h5>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {/* Teacher Selection */}
                          <div>
                            <label className="block text-xs font-medium mb-1 text-orange-700 dark:text-orange-300">
                              ជ្រើសរើសគ្រូ
                            </label>
                            <Select
                              onValueChange={(teacherId) => {
                                const nextPosition = (assignedTeachers.length + 1) as 1 | 2 | 3
                                onUpdateTeacherAssignment(course.courseId, parseInt(teacherId), nextPosition)
                              }}
                            >
                              <SelectTrigger className="h-10 text-sm border-orange-200 focus:border-orange-500 focus:ring-orange-200">
                                <SelectValue placeholder="ជ្រើសរើសគ្រូ" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTeachers.map((teacher) => (
                                  <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                                    {teacher.firstname} {teacher.lastname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assignment Status */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          គ្រូ {assignedTeachers.length}/3
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          បង្កើត: {new Date(course.createdAt).toLocaleDateString('km-KH')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
