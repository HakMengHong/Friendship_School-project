"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BookOpen,
  Users,
  Plus as PlusIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit3
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

// Database types
interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Semester {
  semesterId: number
  semester: string
  semesterCode: string
}

interface Course {
  courseId: number
  courseName: string
  grade: string
  section: string
  schoolYear: SchoolYear
}

interface Subject {
  subjectId: number
  subjectName: string
}

interface User {
  userid: number
  username: string
  firstname: string
  lastname: string
  role: string
  position: string
  avatar: string
  phonenumber1: string | null
  phonenumber2: string | null
  photo: string | null
  status: string
  createdAt: string
  updatedAt: string
  lastLogin: string | null
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

interface Grade {
  gradeId: number
  studentId: number
  subjectId: number
  courseId: number
  semesterId: number
  grade: number
  gradeComment: string | null
  gradeDate: Date
  gradeType: string
  student: Student
  subject: Subject
  course: Course
  semester: Semester
}

interface GradeInput {
  studentId: number
  subjectId: number
  courseId: number
  semesterId: number
  grade: number
  gradeComment?: string
  gradeType?: string
}

export default function AddScorePage() {
  // Filter states
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  // Score input states
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [score, setScore] = useState("")
  const [comment, setComment] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)

  // Data states
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])

  // Loading states
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Fetch students when filters change
  useEffect(() => {
    if (selectedSchoolYear && selectedCourse) {
      fetchStudents()
    } else {
      setStudents([])
    }
  }, [selectedSchoolYear, selectedCourse])

  // Fetch grades when student changes
  useEffect(() => {
    if (selectedStudent && selectedSchoolYear && selectedCourse && selectedSemester) {
      fetchGrades()
    } else {
      setGrades([])
    }
  }, [selectedStudent, selectedSchoolYear, selectedCourse, selectedSemester])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [schoolYearsRes, semestersRes, subjectsRes, teachersRes] = await Promise.all([
        fetch('/api/admin/school-years'),
        fetch('/api/admin/semesters'),
        fetch('/api/admin/subjects'),
        fetch('/api/admin/users')
      ])

      if (!schoolYearsRes.ok || !semestersRes.ok || !subjectsRes.ok || !teachersRes.ok) {
        throw new Error('Failed to fetch initial data')
      }

      const [schoolYearsData, semestersData, subjectsData, teachersData] = await Promise.all([
        schoolYearsRes.json(),
        semestersRes.json(),
        subjectsRes.json(),
        teachersRes.json()
      ])

      setSchoolYears(schoolYearsData)
      setSemesters(semestersData)
      setSubjects(subjectsData)
      const teachers = teachersData.users.filter((teacher: User) => teacher.role === 'teacher')
      setTeachers(teachers)
      
      if (teachers.length === 0) {
        console.warn('No teachers found in the system')
      }

    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true)
      setError(null)

      const params = new URLSearchParams({
        schoolYearId: selectedSchoolYear,
        courseId: selectedCourse
      })

      const response = await fetch(`/api/admin/students/enrolled?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('មានបញ្ហាក្នុងការទាញយកបញ្ជីសិស្ស')
    } finally {
      setLoadingStudents(false)
    }
  }

  const fetchGrades = async () => {
    if (!selectedStudent) return

    try {
      setLoadingGrades(true)
      setError(null)

      const params = new URLSearchParams({
        studentId: selectedStudent.studentId.toString(),
        courseId: selectedCourse,
        semesterId: selectedSemester
      })

      const response = await fetch(`/api/admin/grades?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch grades')
      }

      const data = await response.json()
      setGrades(data)
    } catch (error) {
      console.error('Error fetching grades:', error)
      setError('មានបញ្ហាក្នុងការទាញយកពិន្ទុ')
    } finally {
      setLoadingGrades(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudent || !selectedSubject || !score) {
      toast({
        title: "កំហុស",
        description: "សូមបំពេញគ្រប់ផ្នែកដែលត្រូវការ",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const gradeData: GradeInput = {
        studentId: selectedStudent.studentId,
        subjectId: parseInt(selectedSubject),
        courseId: parseInt(selectedCourse),
        semesterId: parseInt(selectedSemester),
        grade: parseFloat(score),
        gradeComment: comment || undefined,
        gradeType: 'exam'
      }

      if (editingGrade) {
        // Update existing grade
        const response = await fetch('/api/admin/grades', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gradeId: editingGrade.gradeId,
            ...gradeData
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update grade')
        }

        toast({
          title: "ជោគជ័យ",
          description: "ពិន្ទុត្រូវបានកែសម្រួលដោយជោគជ័យ",
        })

        setEditingGrade(null)
      } else {
        // Create new grade
        const response = await fetch('/api/admin/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gradeData)
        })

        if (!response.ok) {
          throw new Error('Failed to create grade')
        }

        toast({
          title: "ជោគជ័យ",
          description: "ពិន្ទុត្រូវបានបញ្ចូលដោយជោគជ័យ",
        })
      }

      // Reset form and refresh data
      setScore("")
      setComment("")
      setSelectedSubject("")
      fetchGrades()

    } catch (error) {
      console.error('Error submitting grade:', error)
      setError('មានបញ្ហាក្នុងការបញ្ចូលពិន្ទុ')
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការបញ្ចូលពិន្ទុ",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (gradeToEdit: Grade) => {
    setEditingGrade(gradeToEdit)
    setSelectedSubject(gradeToEdit.subjectId.toString())
    setScore(gradeToEdit.grade.toString())
    setComment(gradeToEdit.gradeComment || "")
  }

  const handleCancelEdit = () => {
    setEditingGrade(null)
    setScore("")
    setComment("")
    setSelectedSubject("")
  }

  const handleDelete = async (gradeId: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបពិន្ទុនេះមែនទេ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/grades?gradeId=${gradeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete grade')
      }

      toast({
        title: "ជោគជ័យ",
        description: "ពិន្ទុត្រូវបានលុបដោយជោគជ័យ",
      })

      fetchGrades()
    } catch (error) {
      console.error('Error deleting grade:', error)
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការលុបពិន្ទុ",
        variant: "destructive"
      })
    }
  }

  const handleSchoolYearChange = (value: string) => {
    setSelectedSchoolYear(value)
    setSelectedCourse("")
    setSelectedStudent(null)
    setStudents([])
    setGrades([])
  }

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value)
    setSelectedStudent(null)
    setGrades([])
  }

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value)
    setGrades([])
  }

  // Filter courses based on selected school year
  const filteredCourses = courses.filter(course => 
    course.schoolYear.schoolYearId.toString() === selectedSchoolYear
  )

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  // Calculate stats
  const totalGrades = grades.length
  const totalPoints = grades.reduce((sum, grade) => sum + grade.grade, 0)
  const averageScore = totalGrades > 0 ? (totalPoints / totalGrades).toFixed(2) : "0.00"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">កំពុងទាញយកទិន្នន័យ...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-destructive mb-2">មានបញ្ហាក្នុងការទាញយកទិន្នន័យ</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchInitialData}>ព្យាយាមម្តងទៀត</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-2">
          បញ្ចូលពិន្ទុសិស្ស
        </h1>
        <p className="text-lg font-medium text-muted-foreground mt-3 leading-relaxed">
          បញ្ចូលពិន្ទុថ្មីសម្រាប់សិស្ស
        </p>
      </div>

      {/* Enhanced Filter Bar */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">សូមជ្រើសរើស</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
              <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                </SelectTrigger>
                <SelectContent>
                  {schoolYears.map((year) => (
                    <SelectItem key={year.schoolYearId} value={year.schoolYearId.toString()}>
                      {year.schoolYearCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឆមាស</label>
              <Select value={selectedSemester} onValueChange={handleSemesterChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.semesterId} value={semester.semesterId.toString()}>
                      {semester.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ថ្នាក់</label>
              <Select value={selectedCourse} onValueChange={handleCourseChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map((course) => (
                    <SelectItem key={course.courseId} value={course.courseId.toString()}>
                      ថ្នាក់ទី {course.grade} {course.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឈ្មោះគ្រូ</label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសគ្រូ" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                        {teacher.firstname} {teacher.lastname}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      មិនមានគ្រូនៅឡើយទេ
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ស្វែងរកសិស្ស</label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ស្វែងរកឈ្មោះសិស្ស..."
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Student List and Score Input */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Student List */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">បញ្ជីឈ្មោះសិស្ស</CardTitle>
              </div>
              <div className="text-sm text-gray-500">
                {filteredStudents.length} នាក់
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">កំពុងទាញយក...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStudents.map(student => (
                  <div 
                    key={student.studentId}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedStudent?.studentId === student.studentId 
                        ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          student.firstName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ថ្នាក់ទី {student.class}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>សូមបំពេញគ្រប់ផ្នែកដើម្បីមើលបញ្ជីសិស្ស</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Input Form */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-1">
              <PlusIcon className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">
                {editingGrade ? 'កែសម្រួលពិន្ទុ' : 'កន្លែងបញ្ចូលពិន្ទុ'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Student Info Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedStudent.photo ? (
                        <img
                          src={selectedStudent.photo}
                          alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        selectedStudent.firstName.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">ថ្នាក់ទី {selectedStudent.class}</p>
                    </div>
                  </div>
                </div>

                {/* Score Input Fields */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">មុខវិជ្ជា</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="h-14 text-base">
                          <SelectValue placeholder="សូមជ្រើសរើស" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                              {subject.subjectName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center grid-cols-1 gap-4">
                    <label className="text-lg font-medium text-gray-700 dark:text-gray-300">លេខពិន្ទុ:</label>
                    <Input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="សូមបញ្ចូល"
                      className="h-16 text-xl flex text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">មតិផ្សេងៗ</label>
                    <Input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="សូមបញ្ចូលមតិ"
                      className="h-14 text-base"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  {editingGrade ? (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        className="px-6 py-3 text-base"
                        disabled={submitting}
                      >
                        បោះបង់
                      </Button>
                      <Button 
                        type="submit" 
                        className="px-5 py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        ធ្វើបច្ចុប្បន្នភាព
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedSubject("")
                          setScore("")
                          setComment("")
                          setEditingGrade(null)
                        }}
                        className="px-8 py-3 text-base"
                        disabled={submitting}
                      >
                        សម្អាត
                      </Button>
                      <Button 
                        type="submit" 
                        className="px-5 py-3 text-base"
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        បន្ថែមពិន្ទុ
                      </Button>
                    </>
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <PlusIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">ជ្រើសរើសសិស្ស</p>
                <p className="text-sm">សូមជ្រើសរើសសិស្សដើម្បីបញ្ចូលពិន្ទុ</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score List */}
        <Card className="xl:col-span-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <CardTitle className="text-lg">បញ្ជីពិន្ទុសិស្ស {selectedStudent?.firstName} {selectedStudent?.lastName || ''}</CardTitle>
              </div>
              {selectedStudent && (
                <div className="text-sm text-gray-500">
                  សរុប: {grades.length} ពិន្ទុ
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <>
                {loadingGrades ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">កំពុងទាញយកពិន្ទុ...</p>
                  </div>
                ) : grades.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">មុខវិជ្ជា</TableHead>
                            <TableHead className="font-semibold">ចំនួនពិន្ទុ</TableHead>
                            <TableHead className="font-semibold">កាលបរិច្ឆេទ</TableHead>
                            <TableHead className="font-semibold">មតិ</TableHead>
                            <TableHead className="font-semibold">សកម្មភាព</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grades.map((grade) => (
                            <TableRow key={grade.gradeId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <TableCell className="font-medium">{grade.subject.subjectName}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  grade.grade >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                  grade.grade >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                  grade.grade >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {grade.grade}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(grade.gradeDate).toLocaleDateString('km-KH')}</TableCell>
                              <TableCell className="max-w-xs truncate">{grade.gradeComment || '-'}</TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-blue-600 border-blue-300"
                                    onClick={() => handleEdit(grade)}
                                  >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    កែ
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 border-red-300"
                                    onClick={() => handleDelete(grade.gradeId)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    លុប
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Enhanced Stats Summary */}
                    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">ចំនួនពិន្ទុ</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalGrades}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">សរុបពិន្ទុ</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalPoints}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">មធ្យមភាគ</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{averageScore}</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">ថ្នាក់</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{selectedStudent.class}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">មិនមានពិន្ទុ</p>
                    <p className="text-sm">សិស្សនេះមិនទាន់មានពិន្ទុនៅឡើយទេ</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium mb-2">គ្មានពិន្ទុ</p>
                <p className="text-sm">សូមជ្រើសរើសសិស្សដើម្បីមើលពិន្ទុ</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
