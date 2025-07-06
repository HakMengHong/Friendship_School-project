"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  User, 
  UserCheck, 
  UserX, 
  Clock, 
  Edit, 
  Trash2, 
  Calendar,
  BookOpen,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  Users,
  Activity
} from "lucide-react"
import { useState, useEffect } from "react"

interface TimeSlot {
  status: string
  time: string
  absenceType: string
  reason: string
}

interface Student {
  id: number
  name: string
  morning: TimeSlot
  afternoon: TimeSlot
  [key: string]: any
}

interface FormData {
  schoolYear: string
  grade: string
  teacherName: string
  date: string
}

interface EditingAbsence {
  time: string
  absenceType: string
  reason: string
}

interface AbsenceRecord {
  id: number
  name: string
  timePeriod: string
  status: string
  time: string
  absenceType: string
  reason: string
}

export default function DailyAbsencePage() {
  const [formData, setFormData] = useState<FormData>({
    schoolYear: "",
    grade: "",
    teacherName: "",
    date: new Date().toISOString().split('T')[0],
  })

  // Mock student data organized by class
  const allStudentsByClass: Record<string, Student[]> = {
    "៧ក": [
      { 
        id: 1, 
        name: "សុខ ចន្ទា", 
        morning: { status: "present", time: "៧:៣០", absenceType: "", reason: "" },
        afternoon: { status: "present", time: "១:៣០", absenceType: "", reason: "" }
      },
      { 
        id: 2, 
        name: "ម៉ម សុភា", 
        morning: { status: "present", time: "៧:៤៥", absenceType: "", reason: "" },
        afternoon: { status: "absent", time: "-", absenceType: "អវត្តមានឥតច្បាប់", reason: "ឈឺ" }
      },
      { 
        id: 3, 
        name: "ចាន់ ដារា", 
        morning: { status: "absent", time: "-", absenceType: "អវត្តមានឥតច្បាប់", reason: "" },
        afternoon: { status: "present", time: "១:១៥", absenceType: "", reason: "" }
      }
    ],
    "៧ខ": [
      { 
        id: 4, 
        name: "ហេង វិចិត្រ", 
        morning: { status: "late", time: "៨:១៥", absenceType: "យឺត", reason: "ចរាចរណ៍យឺត" },
        afternoon: { status: "late", time: "១:៣០", absenceType: "យឺត", reason: "" }
      },
      { 
        id: 5, 
        name: "ពេជ្រ ម៉ានី", 
        morning: { status: "present", time: "៧:២០", absenceType: "", reason: "" },
        afternoon: { status: "present", time: "១:២០", absenceType: "", reason: "" }
      },
      { 
        id: 6, 
        name: "សុខ សុវណ្ណ", 
        morning: { status: "present", time: "៧:២៥", absenceType: "", reason: "" },
        afternoon: { status: "absent", time: "-", absenceType: "អវត្តមានច្បាប់", reason: "ឈឺ" }
      }
    ],
    "៦ក": [
      { 
        id: 7, 
        name: "វណ្ណា សុខហួរ", 
        morning: { status: "present", time: "៧:១៥", absenceType: "", reason: "" },
        afternoon: { status: "present", time: "១:១០", absenceType: "", reason: "" }
      },
      { 
        id: 8, 
        name: "ដារា សុភា", 
        morning: { status: "late", time: "៨:០៥", absenceType: "យឺត", reason: "" },
        afternoon: { status: "present", time: "១:២៥", absenceType: "", reason: "" }
      }
    ]
  }

  const [students, setStudents] = useState<Student[]>([])
  const [isFormValid, setIsFormValid] = useState(false)

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAbsenceForm, setShowAbsenceForm] = useState(false)
  const [editingAbsence, setEditingAbsence] = useState<EditingAbsence | null>(null)
  const [currentTimePeriod, setCurrentTimePeriod] = useState("morning")
  const [searchTerm, setSearchTerm] = useState("")

  const absenceTypes = ["អវត្តមានច្បាប់", "អវត្តមានឥតច្បាប់", "យឺត"]

  // Calculate statistics
  const morningPresent = students.filter(s => s.morning.status === "present").length
  const morningAbsent = students.filter(s => s.morning.status === "absent").length
  const morningLate = students.filter(s => s.morning.status === "late").length
  
  const afternoonPresent = students.filter(s => s.afternoon.status === "present").length
  const afternoonAbsent = students.filter(s => s.afternoon.status === "absent").length
  const afternoonLate = students.filter(s => s.afternoon.status === "late").length

  const totalPresent = morningPresent + afternoonPresent
  const totalAbsent = morningAbsent + afternoonAbsent
  const totalLate = morningLate + afternoonLate

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check if form is valid and load students for selected class
  useEffect(() => {
    const isValid = Boolean(formData.schoolYear && formData.grade && formData.teacherName)
    setIsFormValid(isValid)
    
    if (isValid && formData.grade) {
      const classStudents = allStudentsByClass[formData.grade] || []
      setStudents(classStudents)
    } else {
      setStudents([])
    }
  }, [formData.schoolYear, formData.grade, formData.teacherName])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStudentClick = (student: Student, timePeriod: string) => {
    setSelectedStudent(student)
    setCurrentTimePeriod(timePeriod)
    setShowAbsenceForm(true)
    setEditingAbsence(null)
  }

  const handleAbsenceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const absenceType = (form.elements.namedItem('absenceType') as HTMLSelectElement).value
    const reason = (form.elements.namedItem('reason') as HTMLTextAreaElement).value
    const time = (form.elements.namedItem('time') as HTMLInputElement).value
    const timePeriod = (form.elements.namedItem('timePeriod') as HTMLSelectElement).value

    if (!selectedStudent) return

    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        const updatedStudent = { ...student }
        if (timePeriod === 'morning') {
          updatedStudent.morning = {
            status: absenceType === "យឺត" ? "late" : (absenceType ? "absent" : "present"),
            time: time,
            absenceType: absenceType,
            reason: reason
          }
        } else if (timePeriod === 'afternoon') {
          updatedStudent.afternoon = {
            status: absenceType === "យឺត" ? "late" : (absenceType ? "absent" : "present"),
            time: time,
            absenceType: absenceType,
            reason: reason
          }
        }
        return updatedStudent
      }
      return student
    })

    setStudents(updatedStudents)
    setShowAbsenceForm(false)
    setSelectedStudent(null)
    setEditingAbsence(null)
  }

  const handleEditAbsence = (absence: any) => {
    const student = students.find(s => s.id === absence.id)
    if (!student) return
    
    setSelectedStudent(student)
    setCurrentTimePeriod(absence.timePeriod === "ពេលព្រឹក" ? "morning" : "afternoon")
    setEditingAbsence({
      time: absence.time,
      absenceType: absence.absenceType,
      reason: absence.reason
    })
    setShowAbsenceForm(true)
  }

  const handleDeleteAbsence = (studentId: number, timePeriod: string) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const updatedStudent = { ...student }
        if (timePeriod === 'morning') {
          updatedStudent.morning = {
            status: "present",
            time: "",
            absenceType: "",
            reason: ""
          }
        } else if (timePeriod === 'afternoon') {
          updatedStudent.afternoon = {
            status: "present",
            time: "",
            absenceType: "",
            reason: ""
          }
        }
        return updatedStudent
      }
      return student
    })

    setStudents(updatedStudents)
  }

  const getDailyAbsences = (): AbsenceRecord[] => {
    const absences: AbsenceRecord[] = []
    students.forEach(student => {
      if (student.morning.status !== "present") {
        absences.push({
          id: student.id,
          name: student.name,
          timePeriod: "ពេលព្រឹក",
          status: student.morning.status,
          time: student.morning.time,
          absenceType: student.morning.absenceType,
          reason: student.morning.reason
        })
      }
      if (student.afternoon.status !== "present") {
        absences.push({
          id: student.id,
          name: student.name,
          timePeriod: "ពេលរសៀល",
          status: student.afternoon.status,
          time: student.afternoon.time,
          absenceType: student.afternoon.absenceType,
          reason: student.afternoon.reason
        })
      }
    })
    return absences
  }

  const dailyAbsencesData: AbsenceRecord[] = getDailyAbsences()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">វត្តមាន</Badge>
      case "absent":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">អវត្តមាន</Badge>
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">យឺត</Badge>
      default:
        return <Badge variant="secondary">មិនច្បាស់</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ការកត់ត្រាអវត្តមានប្រចាំថ្ងៃ
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            ការកត់ត្រានិងគ្រប់គ្រងអវត្តមានសិស្ស
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            ទាញយករបាយការណ៍
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            បន្ថែមសិស្ស
          </Button>
        </div>
      </div>

      {/* School Information Card */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            ព័ត៌មានមុខងារ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">ឆ្នាំសិក្សា *</Label>
              <Input
                name="schoolYear"
                value={formData.schoolYear}
                onChange={handleInputChange}
                placeholder="ឆ្នាំសិក្សា"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">ថ្នាក់ *</Label>
              <Select name="grade" value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="៧ក">៧ក</SelectItem>
                  <SelectItem value="៧ខ">៧ខ</SelectItem>
                  <SelectItem value="៦ក">៦ក</SelectItem>
                  <SelectItem value="៦ខ">៦ខ</SelectItem>
                  <SelectItem value="៥ក">៥ក</SelectItem>
                  <SelectItem value="៥ខ">៥ខ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">ឈ្មោះគ្រូ *</Label>
              <Input
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                placeholder="ឈ្មោះគ្រូ"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">កាលបរិច្ឆេទ</Label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="h-11"
              />
            </div>
          </div>
          {!isFormValid && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  សូមបំពេញព័ត៌មានមុខងារទាំងអស់ដើម្បីមើលបញ្ជីសិស្ស
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards - Only show when form is valid */}
      {isFormValid && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Morning Summary */}
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ពេលព្រឹក</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{morningPresent + morningAbsent + morningLate} នាក់</div>
                <p className="text-xs text-muted-foreground">វត្តមាន: {morningPresent} • អវត្តមាន: {morningAbsent} • យឺត: {morningLate}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-500">វត្តមាន {morningPresent} នាក់</span>
                </div>
              </CardContent>
            </Card>

            {/* Afternoon Summary */}
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ពេលរសៀល</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{afternoonPresent + afternoonAbsent + afternoonLate} នាក់</div>
                <p className="text-xs text-muted-foreground">វត្តមាន: {afternoonPresent} • អវត្តមាន: {afternoonAbsent} • យឺត: {afternoonLate}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-orange-500 mr-1" />
                  <span className="text-xs text-orange-500">វត្តមាន {afternoonPresent} នាក់</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Present */}
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">សរុបវត្តមាន</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalPresent} នាក់</div>
                <p className="text-xs text-muted-foreground">{students.length > 0 ? ((totalPresent / students.length) * 100).toFixed(1) : 0}% នៃសិស្សទាំងអស់</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+{morningPresent + afternoonPresent} ពីពេលព្រឹក</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Absent */}
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">សរុបអវត្តមាន</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalAbsent} នាក់</div>
                <p className="text-xs text-muted-foreground">{students.length > 0 ? ((totalAbsent / students.length) * 100).toFixed(1) : 0}% នៃសិស្សទាំងអស់</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-500">+{morningAbsent + afternoonAbsent} ពីពេលព្រឹក</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student List */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    បញ្ជីឈ្មោះសិស្ស - {formData.grade} ({filteredStudents.length} នាក់)
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ស្វែងរកសិស្ស..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">ឈ្មោះសិស្ស</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">ពេលព្រឹក</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">ពេលរសៀល</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr 
                            key={student.id} 
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">{student.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">សិស្ស</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div 
                                className="flex flex-col items-center gap-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 p-2 rounded-lg transition-colors"
                                onClick={() => handleStudentClick(student, "morning")}
                              >
                                {getStatusBadge(student.morning.status)}
                                {student.morning.time && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{student.morning.time}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div 
                                className="flex flex-col items-center gap-1 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 p-2 rounded-lg transition-colors"
                                onClick={() => handleStudentClick(student, "afternoon")}
                              >
                                {getStatusBadge(student.afternoon.status)}
                                {student.afternoon.time && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{student.afternoon.time}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? "រកមិនឃើញសិស្ស" : "មិនមានសិស្សនៅក្នុងថ្នាក់នេះទេ"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Absences */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  ឈ្មោះសិស្សអវត្តមានប្រចាំថ្ងៃ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyAbsencesData.length > 0 ? (
                  <div className="space-y-3">
                    {dailyAbsencesData.map((absence, index) => (
                      <div key={`${absence.id}-${absence.timePeriod}`} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                              <UserX className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{absence.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{absence.timePeriod}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(absence.status)}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAbsence(absence)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAbsence(
                                  absence.id, 
                                  absence.timePeriod === "ពេលព្រឹក" ? "morning" : "afternoon"
                                )}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">ប្រភេទ:</span>
                            <span className="ml-2 font-medium">{absence.absenceType}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">ម៉ោង:</span>
                            <span className="ml-2 font-medium">{absence.time}</span>
                          </div>
                        </div>
                        {absence.reason && (
                          <div className="mt-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">មូលហេតុ:</span>
                            <p className="text-sm font-medium mt-1">{absence.reason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">មិនមានសិស្សអវត្តមាននៅថ្ងៃនេះទេ</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Absence Form Dialog */}
      <Dialog open={showAbsenceForm} onOpenChange={setShowAbsenceForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              ការកំណត់អវត្តមាន
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <form onSubmit={handleAbsenceSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>ឈ្មោះសិស្ស</Label>
                <Input
                  value={selectedStudent.name}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>កាលបរិច្ឆេទ</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ពេលវេលា</Label>
                  <Select name="timePeriod" defaultValue={currentTimePeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">ពេលព្រឹក</SelectItem>
                      <SelectItem value="afternoon">ពេលរសៀល</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ស្ថានភាព</Label>
                <RadioGroup name="absenceType" defaultValue={editingAbsence?.absenceType || "អវត្តមានឥតច្បាប់"}>
                  {absenceTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type}>{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>ម៉ោង (សម្រាប់មកយឺត)</Label>
                <Input
                  name="time"
                  defaultValue={editingAbsence?.time || selectedStudent[currentTimePeriod].time}
                  placeholder="ម៉ោង:នាទី"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label>មូលហេតុ (បើមាន)</Label>
                <Textarea
                  name="reason"
                  defaultValue={editingAbsence?.reason || selectedStudent[currentTimePeriod].reason}
                  placeholder="បញ្ចូលមូលហេតុ..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAbsenceForm(false)}
                >
                  បោះបង់
                </Button>
                <Button type="submit">
                  រក្សាទុក
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
