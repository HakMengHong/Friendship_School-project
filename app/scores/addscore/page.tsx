"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, Users, Plus } from "lucide-react"

interface Student {
  id: number
  name: string
  photo: string
  grade: string
  academicYear: string
  semester: string
  teacher: string
}

interface Score {
  id: number
  studentId: number
  subject: string
  score: number
  date: string
  comment: string
}

export default function AddScorePage() {
  // Filter states
  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")
  const [monthYear, setMonthYear] = useState("")
  const [grade, setGrade] = useState("")
  const [teacher, setTeacher] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Score input states
  const [subject, setSubject] = useState("")
  const [score, setScore] = useState("")
  const [comment, setComment] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editingScore, setEditingScore] = useState<Score | null>(null)

  // Sample data with more comprehensive student information
  const allStudents: Student[] = [
    { id: 1, name: "សុខ ចន្ទា", photo: "", grade: "10A", academicYear: "2023-2024", semester: "1", teacher: "1" },
    { id: 2, name: "ម៉ៅ សុធារ៉ា", photo: "", grade: "10A", academicYear: "2023-2024", semester: "1", teacher: "1" },
    { id: 3, name: "វង្ស សុផល", photo: "", grade: "10A", academicYear: "2023-2024", semester: "1", teacher: "1" },
    { id: 4, name: "គឹម សុខា", photo: "", grade: "10B", academicYear: "2023-2024", semester: "1", teacher: "2" },
    { id: 5, name: "ឈឹម វណ្ណា", photo: "", grade: "10B", academicYear: "2023-2024", semester: "1", teacher: "2" },
    { id: 6, name: "អ៊ុក សុវណ្ណា", photo: "", grade: "11A", academicYear: "2023-2024", semester: "1", teacher: "1" },
  ]

  // Filter students based on selected criteria
  const filteredStudents = allStudents.filter(student => {
    // Show students only when ALL required filters are selected
    const hasAllRequiredFilters = academicYear && semester && monthYear && grade && teacher
    
    // If not all required filters are selected, don't show any students
    if (!hasAllRequiredFilters) {
      return false
    }
    
    const matchesAcademicYear = student.academicYear === academicYear
    const matchesSemester = student.semester === semester
    const matchesGrade = student.grade === grade
    const matchesTeacher = student.teacher === teacher
    const matchesSearch = !searchTerm || student.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesAcademicYear && matchesSemester && matchesGrade && matchesTeacher && matchesSearch
  })

  const [scores, setScores] = useState<Score[]>([
    { id: 1, studentId: 1, subject: "គណិតវិទ្យា", score: 92, date: "2023-11-15", comment: "ល្អណាស់" },
    { id: 2, studentId: 2, subject: "ភាសាអង់គ្លេស", score: 88, date: "2023-11-10", comment: "ល្អ" },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !subject || !score) return
    
    if (editingScore) {
      // Update existing score
      const updatedScores = scores.map(s => 
        s.id === editingScore.id 
          ? { ...s, subject, score: parseInt(score), comment }
          : s
      )
      setScores(updatedScores)
      setEditingScore(null)
    } else {
      // Add new score
      const newScore: Score = {
        id: scores.length + 1,
        studentId: selectedStudent.id,
        subject,
        score: parseInt(score),
        date: new Date().toISOString().split('T')[0],
        comment
      }
      setScores([...scores, newScore])
    }
    
    // Reset form
    setSubject("")
    setScore("")
    setComment("")
  }

  const handleEdit = (scoreToEdit: Score) => {
    setEditingScore(scoreToEdit)
    setSubject(scoreToEdit.subject)
    setScore(scoreToEdit.score.toString())
    setComment(scoreToEdit.comment)
  }

  const handleCancelEdit = () => {
    setEditingScore(null)
    setSubject("")
    setScore("")
    setComment("")
  }

  const handleDelete = (id: number) => {
    setScores(scores.filter(score => score.id !== id))
  }

  // Calculate stats
  const totalScores = scores.length
  const totalPoints = scores.reduce((sum, item) => sum + item.score, 0)
  const averageScore = totalScores > 0 ? (totalPoints / totalScores).toFixed(2) : 0

  return (
    <div className="space-y-4 p-0">
      {/* Enhanced Filter Bar */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-1">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">សូមជ្រើសរើស</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* First Row - Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                  <SelectItem value="2021-2022">2021-2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឆមាស</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ឆមាស 1</SelectItem>
                  <SelectItem value="2">ឆមាស 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ខែ/ឆ្នាំពិន្ទុ</label>
              <Select value={monthYear} onValueChange={setMonthYear}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសខែ/ឆ្នាំ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-11">វិច្ឆិកា 2023</SelectItem>
                  <SelectItem value="2023-12">ធ្នូ 2023</SelectItem>
                  <SelectItem value="2024-01">មករា 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ថ្នាក់</label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10A">10A</SelectItem>
                  <SelectItem value="10B">10B</SelectItem>
                  <SelectItem value="11A">11A</SelectItem>
                  <SelectItem value="11B">11B</SelectItem>
                  <SelectItem value="12A">12A</SelectItem>
                  <SelectItem value="12B">12B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ឈ្មោះគ្រូ</label>
              <Select value={teacher} onValueChange={setTeacher}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ជ្រើសរើសគ្រូ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">សុខ ម៉េង</SelectItem>
                  <SelectItem value="2">ម៉ៅ ស្រីនី</SelectItem>
                  <SelectItem value="3">វង្ស សុខា</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <div 
                    key={student.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedStudent?.id === student.id 
                        ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ថ្នាក់ {student.grade}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>សូមបំពេញគ្រប់ផ្នែកដើម្បីមើលបញ្ជីសិស្ស</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Input Form */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-1">
              <Plus className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">
                {editingScore ? 'កែសម្រួលពិន្ទុ' : 'កន្លែងបញ្ចូលពិន្ទុ'}
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
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">ថ្នាក់ {selectedStudent.grade}</p>
                    </div>
                  </div>
                </div>

                {/* Score Input Fields */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">មុខវិជ្ជា</label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="h-14 text-base">
                          <SelectValue placeholder="សូមជ្រើសរើស" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="គណិតវិទ្យា">គណិតវិទ្យា</SelectItem>
                          <SelectItem value="ភាសាអង់គ្លេស">ភាសាអង់គ្លេស</SelectItem>
                          <SelectItem value="ភាសាខ្មែរ">ភាសាខ្មែរ</SelectItem>
                          <SelectItem value="វិទ្យាសាស្ត្រ">វិទ្យាសាស្ត្រ</SelectItem>
                          <SelectItem value="ប្រវត្តិវិទ្យា">ប្រវត្តិវិទ្យា</SelectItem>
                          <SelectItem value="ភូមិវិទ្យា">ភូមិវិទ្យា</SelectItem>
                          <SelectItem value="គីមីវិទ្យា">គីមីវិទ្យា</SelectItem>
                          <SelectItem value="រូបវិទ្យា">រូបវិទ្យា</SelectItem>
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
                  {editingScore ? (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        className="px-6 py-3 text-base"
                      >
                        បោះបង់
                      </Button>
                      <Button type="submit" className="px-5 py-3 text-base bg-blue-600 hover:bg-blue-700">
                        ធ្វើបច្ចុប្បន្នភាព
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setSubject("")
                          setScore("")
                          setComment("")
                          setEditingScore(null)
                        }}
                        className="px-8 py-3 text-base"
                      >
                        សម្អាត
                      </Button>
                      <Button type="submit" className="px-8 py-3 text-base bg-blue-600 hover:bg-blue-700">
                        បញ្ជូលពិន្ទុ
                      </Button>
                    </>
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Plus className="h-16 w-16 mx-auto mb-4 text-gray-300" />
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
                <CardTitle className="text-lg">បញ្ជីពិន្ទុសិស្ស {selectedStudent?.name || ''}</CardTitle>
              </div>
              {selectedStudent && (
                <div className="text-sm text-gray-500">
                  សរុប: {scores.filter(s => s.studentId === selectedStudent.id).length} ពិន្ទុ
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
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
                      {scores.filter(s => s.studentId === selectedStudent.id).map((score) => (
                        <TableRow key={score.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="font-medium">{score.subject}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              score.score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              score.score >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              score.score >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {score.score}
                            </span>
                          </TableCell>
                          <TableCell>{score.date}</TableCell>
                          <TableCell className="max-w-xs truncate">{score.comment}</TableCell>
                                                      <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-blue-600 border-blue-300"
                                  onClick={() => handleEdit(score)}
                                >
                                  កែ
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 border-red-300"
                                  onClick={() => handleDelete(score.id)}
                                >
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
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalScores}</p>
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
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">និន្នាការ</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">+5.3%</p>
                  </div>
                </div>
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
