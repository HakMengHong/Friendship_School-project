'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen,
  TrendingUp,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"

import { GradeFilterPanel } from './GradeFilterPanel'
import { GradeInputForm } from './GradeInputForm'
import { GradeTable } from './GradeTable'

interface GradeManagementDashboardProps {
  // Filter states
  selectedSchoolYear: string
  selectedSemester: string
  selectedCourse: string
  selectedSubject: string
  selectedMonth: string
  selectedGradeYear: string
  searchTerm: string
  
  // Data states
  schoolYears: any[]
  semesters: any[]
  courses: any[]
  subjects: any[]
  students: any[]
  grades: any[]
  
  // Form states
  selectedStudent: any
  editingGrade: any
  score: string
  comment: string
  
  // Loading states
  loading: boolean
  loadingStudents: boolean
  loadingGrades: boolean
  submitting: boolean
  
  // Options
  months: Array<{ value: string; label: string }>
  gradeYears: Array<{ value: string; label: string }>
  
  // Functions
  onSchoolYearChange: (schoolYearId: string) => void
  onSemesterChange: (semesterId: string) => void
  onCourseChange: (courseId: string) => void
  onSubjectChange: (subjectId: string) => void
  onMonthChange: (month: string) => void
  onGradeYearChange: (year: string) => void
  onSearchChange: (search: string) => void
  onStudentSelect: (student: any) => void
  onScoreChange: (score: string) => void
  onCommentChange: (comment: string) => void
  onSubmit: () => void
  onCancelEdit: () => void
  onEditGrade: (grade: any) => void
  onDeleteGrade: (gradeId: number) => void
  getGradeLabel: (grade: string | number) => string
}

export function GradeManagementDashboard({
  // Filter states
  selectedSchoolYear,
  selectedSemester,
  selectedCourse,
  selectedSubject,
  selectedMonth,
  selectedGradeYear,
  searchTerm,
  
  // Data states
  schoolYears,
  semesters,
  courses,
  subjects,
  students,
  grades,
  
  // Form states
  selectedStudent,
  editingGrade,
  score,
  comment,
  
  // Loading states
  loading,
  loadingStudents,
  loadingGrades,
  submitting,
  
  // Options
  months,
  gradeYears,
  
  // Functions
  onSchoolYearChange,
  onSemesterChange,
  onCourseChange,
  onSubjectChange,
  onMonthChange,
  onGradeYearChange,
  onSearchChange,
  onStudentSelect,
  onScoreChange,
  onCommentChange,
  onSubmit,
  onCancelEdit,
  onEditGrade,
  onDeleteGrade,
  getGradeLabel
}: GradeManagementDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ការគ្រប់គ្រងពិន្ទុ</CardTitle>
                <p className="text-indigo-100 text-sm">Grade Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {grades.length} ពិន្ទុ
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Panel */}
      <GradeFilterPanel
        selectedSchoolYear={selectedSchoolYear}
        selectedSemester={selectedSemester}
        selectedCourse={selectedCourse}
        selectedSubject={selectedSubject}
        selectedMonth={selectedMonth}
        selectedGradeYear={selectedGradeYear}
        searchTerm={searchTerm}
        schoolYears={schoolYears}
        semesters={semesters}
        courses={courses}
        subjects={subjects}
        months={months}
        gradeYears={gradeYears}
        loading={loading}
        onSchoolYearChange={onSchoolYearChange}
        onSemesterChange={onSemesterChange}
        onCourseChange={onCourseChange}
        onSubjectChange={onSubjectChange}
        onMonthChange={onMonthChange}
        onGradeYearChange={onGradeYearChange}
        onSearchChange={onSearchChange}
        getGradeLabel={getGradeLabel}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Input Form */}
        <div>
          <GradeInputForm
            selectedStudent={selectedStudent}
            editingGrade={editingGrade}
            score={score}
            comment={comment}
            students={students}
            searchTerm={searchTerm}
            submitting={submitting}
            onStudentSelect={onStudentSelect}
            onScoreChange={onScoreChange}
            onCommentChange={onCommentChange}
            onSubmit={onSubmit}
            onCancelEdit={onCancelEdit}
            getGradeLabel={getGradeLabel}
          />
        </div>

        {/* Grade Table */}
        <div>
          <GradeTable
            grades={grades}
            loadingGrades={loadingGrades}
            onEditGrade={onEditGrade}
            onDeleteGrade={onDeleteGrade}
            getGradeLabel={getGradeLabel}
          />
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">សិស្សសរុប</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {students.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Grades */}
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ពិន្ទុសរុប</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {grades.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Grade */}
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ពិន្ទុមធ្យម</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {grades.length > 0 
                    ? (grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="border-2 border-orange-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">អត្រាជោគជ័យ</p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  {grades.length > 0 
                    ? `${Math.round((grades.filter(g => g.grade >= 60).length / grades.length) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-500 rounded-lg">
              <Info className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                ព័ត៌មានស្ថានភាព (Status Information)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">ពិន្ទុល្អ (90-100):</span>
                  <span className="font-medium text-green-700 dark:text-green-300">
                    {grades.filter(g => g.grade >= 90).length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">ពិន្ទុល្អ (80-89):</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {grades.filter(g => g.grade >= 80 && g.grade < 90).length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-gray-600 dark:text-gray-400">ពិន្ទុមធ្យម (70-79):</span>
                  <span className="font-medium text-yellow-700 dark:text-yellow-300">
                    {grades.filter(g => g.grade >= 70 && g.grade < 80).length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-gray-600 dark:text-gray-400">ពិន្ទុគ្រប់គ្រាន់ (60-69):</span>
                  <span className="font-medium text-orange-700 dark:text-orange-300">
                    {grades.filter(g => g.grade >= 60 && g.grade < 70).length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-600 dark:text-gray-400">ពិន្ទុមិនគ្រប់គ្រាន់ (&lt;60):</span>
                  <span className="font-medium text-red-700 dark:text-red-300">
                    {grades.filter(g => g.grade < 60).length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600 dark:text-gray-400">អត្រាបញ្ចប់:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {students.length > 0 
                      ? `${Math.round((grades.length / students.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
