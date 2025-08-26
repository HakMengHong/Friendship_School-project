'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  Save,
  Edit3,
  X,
  User,
  BookOpen,
  Hash,
  MessageSquare,
  CheckCircle,
  AlertCircle
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

interface GradeInputFormProps {
  selectedStudent: Student | null
  editingGrade: Grade | null
  score: string
  comment: string
  students: Student[]
  searchTerm: string
  submitting: boolean
  onStudentSelect: (student: Student) => void
  onScoreChange: (score: string) => void
  onCommentChange: (comment: string) => void
  onSubmit: () => void
  onCancelEdit: () => void
  getGradeLabel: (grade: string | number) => string
}

export function GradeInputForm({
  selectedStudent,
  editingGrade,
  score,
  comment,
  students,
  searchTerm,
  submitting,
  onStudentSelect,
  onScoreChange,
  onCommentChange,
  onSubmit,
  onCancelEdit,
  getGradeLabel
}: GradeInputFormProps) {
  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toString().includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Grade Input Form */}
      <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">
                  {editingGrade ? 'កែប្រែពិន្ទុ' : 'បន្ថែមពិន្ទុ'}
                </CardTitle>
                <p className="text-green-100 text-sm">
                  {editingGrade ? 'Edit Grade' : 'Add Grade'}
                </p>
              </div>
            </div>
            {editingGrade && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                កំពុងកែប្រែ
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Student Selection */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <User className="h-4 w-4" />
              ជ្រើសរើសសិស្ស (Select Student)
            </Label>
            
            {selectedStudent ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ថ្នាក់ទី {getGradeLabel(selectedStudent.class)} | ID: {selectedStudent.studentId}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onStudentSelect(selectedStudent)}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-950/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ស្វែងរក និងជ្រើសរើសសិស្សដើម្បីបន្ថែមពិន្ទុ
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.studentId}
                      onClick={() => onStudentSelect(student)}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ថ្នាក់ទី {getGradeLabel(student.class)} | ID: {student.studentId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>គ្មានសិស្សត្រូវគ្នានឹងការស្វែងរក</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grade Input */}
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Hash className="h-4 w-4" />
                  ពិន្ទុ (Grade)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={score}
                  onChange={(e) => onScoreChange(e.target.value)}
                  placeholder="ឧ. 85.5"
                  className="mt-1 h-12 text-lg border-green-200 focus:border-green-500 focus:ring-green-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  សូមបញ្ចូលពិន្ទុពី 0 ដល់ 100
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MessageSquare className="h-4 w-4" />
                  កំណត់សម្គាល់ (Comment)
                </Label>
                <Input
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder="ឧ. ការងារល្អ តែត្រូវព្យាយាមបន្ថែម"
                  className="mt-1 h-12 text-lg border-green-200 focus:border-green-500 focus:ring-green-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4">
                <Button
                  onClick={onSubmit}
                  disabled={submitting || !score}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>កំពុងដំណើរការ...</span>
                    </>
                  ) : editingGrade ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>រក្សាទុកការកែប្រែ</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>បន្ថែមពិន្ទុ</span>
                    </>
                  )}
                </Button>

                {editingGrade && (
                  <Button
                    onClick={onCancelEdit}
                    variant="outline"
                    className="flex items-center space-x-2 border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                  >
                    <X className="h-4 w-4" />
                    <span>បោះបង់</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                ការណែនាំ (Instructions)
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• ជ្រើសរើសសិស្សពីបញ្ជីខាងលើ</li>
                <li>• បញ្ចូលពិន្ទុពី 0 ដល់ 100</li>
                <li>• បន្ថែមកំណត់សម្គាល់ (ស្រេចចិត្ត)</li>
                <li>• ចុច "បន្ថែមពិន្ទុ" ដើម្បីរក្សាទុក</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
