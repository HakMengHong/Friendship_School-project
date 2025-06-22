"use client"

import { useState } from "react"
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

export default function AddScorePage() {
  // Filter states
  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")
  const [monthYear, setMonthYear] = useState("")
  const [grade, setGrade] = useState("")
  const [teacher, setTeacher] = useState("")

  // Score input states
  const [subject, setSubject] = useState("")
  const [score, setScore] = useState("")
  const [comment, setComment] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Sample data
  const students = [
    { id: 1, name: "សុខ ចន្ទា", photo: "", grade: "10A" },
    { id: 2, name: "ម៉ៅ សុធារ៉ា", photo: "", grade: "10A" },
    { id: 3, name: "វង្ស សុផល", photo: "", grade: "10A" },
  ]

  const [scores, setScores] = useState([
    { id: 1, studentId: 1, subject: "គណិតវិទ្យា", score: 92, date: "2023-11-15", comment: "ល្អណាស់" },
    { id: 2, studentId: 2, subject: "ភាសាអង់គ្លេស", score: 88, date: "2023-11-10", comment: "ល្អ" },
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedStudent || !subject || !score) return
    
    const newScore = {
      id: scores.length + 1,
      studentId: selectedStudent.id,
      subject,
      score: parseInt(score),
      date: new Date().toISOString().split('T')[0],
      comment
    }
    
    setScores([...scores, newScore])
    // Reset form
    setSubject("")
    setScore("")
    setComment("")
  }

  const handleDelete = (id) => {
    setScores(scores.filter(score => score.id !== id))
  }

  // Calculate stats
  const totalScores = scores.length
  const totalPoints = scores.reduce((sum, item) => sum + item.score, 0)
  const averageScore = totalScores > 0 ? (totalPoints / totalScores).toFixed(2) : 0

  return (
    <>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ឆ្នាំសិក្សា</label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើស" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2022-2023">2022-2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ឆមាស</label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើស" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">ឆមាស 1</SelectItem>
                <SelectItem value="2">ឆមាស 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ខែ/ឆ្នាំពិន្ទុ</label>
            <Select value={monthYear} onValueChange={setMonthYear}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើស" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023-11">វិច្ឆិកា 2023</SelectItem>
                <SelectItem value="2023-12">ធ្នូ 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ថ្នាក់</label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើស" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10A">10A</SelectItem>
                <SelectItem value="10B">10B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ឈ្មោះគ្រូ</label>
            <Select value={teacher} onValueChange={setTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើស" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">សុខ ម៉េង</SelectItem>
                <SelectItem value="2">ម៉ៅ ស្រីនី</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student List and Score Input */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-8">
        {/* Student List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>បញ្ជីឈ្មោះសិស្ស</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map(student => (
                <div 
                  key={student.id}
                  className={`p-3 border rounded-lg cursor-pointer ${selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-gray-500">{student.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">ថ្នាក់ {student.grade}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Score Input Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>កន្លែងបញ្ចូលពិន្ទុ</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ខែឆ្នាំ</label>
                    <Input value={new Date().toLocaleDateString('km-KH')} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ថ្នាក់ទី</label>
                    <Input value={selectedStudent.grade} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">រូបថត</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {selectedStudent.photo ? (
                          <img
                            src={selectedStudent.photo}
                            alt={selectedStudent.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-lg font-semibold">
                            {selectedStudent.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{selectedStudent.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ឈ្មោះសិស្ស</label>
                    <Input value={selectedStudent.name} readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">មុខវិជ្ជា</label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="ជ្រើសរើសមុខវិជ្ជា" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="គណិតវិទ្យា">គណិតវិទ្យា</SelectItem>
                        <SelectItem value="ភាសាអង់គ្លេស">ភាសាអង់គ្លេស</SelectItem>
                        <SelectItem value="ភាសាខ្មែរ">ភាសាខ្មែរ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">លេខពិន្ទុ</label>
                    <Input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      min="0"
                      max="100"
                      placeholder="សូមបញ្ចូលលេខ 0-100"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">មតិផ្សេងៗ (ដាក់ក្នុងសៀវភៅតាមដាន)</label>
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="សូមបញ្ចូលមតិ"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">បញ្ជូល</Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 text-gray-500">
                សូមជ្រើសរើសសិស្សដើម្បីបញ្ចូលពិន្ទុ
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>បញ្ជីពិន្ទុសិស្ស {selectedStudent?.name || ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>មុខវិជ្ជា</TableHead>
                  <TableHead>ចំនួនពិន្ទុ</TableHead>
                  <TableHead>កាលបរិច្ឆេទ</TableHead>
                  <TableHead>មតិ</TableHead>
                  <TableHead>សកម្មភាព</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.filter(s => s.studentId === selectedStudent?.id).map((score) => (
                  <TableRow key={score.id}>
                    <TableCell>{score.subject}</TableCell>
                    <TableCell>{score.score}</TableCell>
                    <TableCell>{score.date}</TableCell>
                    <TableCell>{score.comment}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">កែ</Button>
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

            {/* Stats Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600">ចំនួនពិន្ទុ</p>
                <p className="text-xl font-bold">{totalScores}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">សរុបពិន្ទុ</p>
                <p className="text-xl font-bold">{totalPoints}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">មធ្យមភាគ</p>
                <p className="text-xl font-bold">{averageScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">និន្នាការ</p>
                <p className="text-xl font-bold text-green-600">+5.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
