"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, UserCheck, UserX, Clock, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

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
  [key: string]: any // Add index signature for dynamic property access
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

  const [students, setStudents] = useState<Student[]>([
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
      afternoon: { status: "absent", time: "-", absenceType: "អវត្តមានឥតច្បាប់", reason: "" }
    },
    { 
      id: 3, 
      name: "ចាន់ ដារា", 
      morning: { status: "absent", time: "-", absenceType: "អវត្តមានឥតច្បាប់", reason: "" },
      afternoon: { status: "present", time: "១:១៥", absenceType: "", reason: "" }
    },
    { 
      id: 4, 
      name: "ហេង វិចិត្រ", 
      morning: { status: "late", time: "៨:១៥", absenceType: "យឺត", reason: "" },
      afternoon: { status: "late", time: "១:៣០", absenceType: "យឺត", reason: "" }
    },
    { 
      id: 5, 
      name: "ពេជ្រ ម៉ានី", 
      morning: { status: "present", time: "៧:២០", absenceType: "", reason: "" },
      afternoon: { status: "present", time: "១:២០", absenceType: "", reason: "" }
    }
  ])
  


  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
      let formattedValue = '';
      
      if (input.length > 0) {
        formattedValue = input.substring(0, 2);
        if (input.length > 2) {
          formattedValue += ':' + input.substring(2, 4);
        }
      }
      
      e.target.value = formattedValue;
    };

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAbsenceForm, setShowAbsenceForm] = useState(false)
  const [editingAbsence, setEditingAbsence] = useState<EditingAbsence | null>(null)
  const [currentTimePeriod, setCurrentTimePeriod] = useState("morning")

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
        return {
          ...student,
          [timePeriod]: {
            status: absenceType === "យឺត" ? "late" : (absenceType ? "absent" : "present"),
            time: time,
            absenceType: absenceType,
            reason: reason
          }
        }
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
        return {
          ...student,
          [timePeriod]: {
            status: "present",
            time: "",
            absenceType: "",
            reason: ""
          }
        }
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

  return (
    <>
      {/* School information form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ព័ត៌មានមុខងារ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ឆ្នាំសិក្សា</label>
              <input
                type="text"
                name="schoolYear"
                value={formData.schoolYear}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md bg-muted dark:bg-slate-700"
                placeholder="ឆ្នាំសិក្សា"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ថ្នាក់</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md bg-muted dark:bg-slate-700"
                placeholder="ថ្នាក់"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ឈ្មោះគ្រូ</label>
              <input
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md bg-muted dark:bg-slate-700"
                placeholder="ឈ្មោះគ្រូ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">កាលបរិច្ឆេទ</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md bg-muted dark:bg-slate-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
        {/* Morning summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>ពេលព្រឹក</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{morningPresent}</div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">វត្តមាន</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{morningAbsent}</div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">អវត្តមាន</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">{morningLate}</div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">យឺត</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Afternoon summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>ពេលរសៀល</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{afternoonPresent}</div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">វត្តមាន</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{afternoonAbsent}</div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">អវត្តមាន</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">{afternoonLate}</div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">យឺត</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total present */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <span>សរុបវត្តមាន</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {totalPresent}
            </div>
            <p className="text-sm text-muted-foreground dark:text-slate-400">សិស្ស</p>
          </CardContent>
        </Card>

        {/* Total absent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserX className="h-5 w-5 text-red-600" />
              <span>សរុបអវត្តមាន</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {totalAbsent}
            </div>
            <p className="text-sm text-muted-foreground dark:text-slate-400">សិស្ស</p>
          </CardContent>
        </Card>

        {/* Total late */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span>សរុបយឺត</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {totalLate}
            </div>
            <p className="text-sm text-muted-foreground dark:text-slate-400">សិស្ស</p>
          </CardContent>
        </Card>

        {/* Total students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-center" />
              <span>សរុបសិស្ស</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground dark:text-slate-400">
              {students.length}
            </div>
            <p className="text-sm text-muted-foreground dark:text-slate-400">សិស្ស</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student list with morning/afternoon attendance */}
        <Card>
          <CardHeader>
            <CardTitle>បញ្ជីឈ្មោះសិស្ស</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">ឈ្មោះ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">ពេលព្រឹក</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">ពេលរសៀល</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground dark:text-slate-100">
                        {student.name}
                      </td>
                      <td 
                        className={`px-6 py-4 whitespace-nowrap text-sm cursor-pointer ${
                          student.morning.status === "present" ? "text-green-600" :
                          student.morning.status === "absent" ? "text-red-600" : "text-yellow-600"
                        }`}
                        onClick={() => handleStudentClick(student, "morning")}
                      >
                        {student.morning.status === "present" ? "វត្តមាន" : 
                         student.morning.status === "absent" ? "អវត្តមាន" : "យឺត"}
                        {student.morning.time && ` (${student.morning.time})`}
                      </td>
                      <td 
                        className={`px-6 py-4 whitespace-nowrap text-sm cursor-pointer ${
                          student.afternoon.status === "present" ? "text-green-600" :
                          student.afternoon.status === "absent" ? "text-red-600" : "text-yellow-600"
                        }`}
                        onClick={() => handleStudentClick(student, "afternoon")}
                      >
                        {student.afternoon.status === "present" ? "វត្តមាន" : 
                         student.afternoon.status === "absent" ? "អវត្តមាន" : "យឺត"}
                        {student.afternoon.time && ` (${student.afternoon.time})`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Daily absences table */}
        <Card>
          <CardHeader>
            <CardTitle>ឈ្មោះសិស្សអវត្តមានប្រចាំថ្ងៃ</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyAbsencesData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">ឈ្មោះសិស្ស</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">ពេលវេលា</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">ប្រភេទ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">ម៉ោង</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">មូលហេតុ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {dailyAbsencesData.map((absence, index) => (
                      <tr key={`${absence.id}-${absence.timePeriod}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground dark:text-slate-100">
                          {absence.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-slate-400">
                          {absence.timePeriod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-slate-400">
                          {absence.absenceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-slate-400">
                          {absence.time}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground dark:text-slate-400">
                          {absence.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAbsence(absence)}
                              className="text-blue-600 hover:text-blue-900"
                              title="កែសម្រួល"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAbsence(
                                absence.id, 
                                absence.timePeriod === "ពេលព្រឹក" ? "morning" : "afternoon"
                              )}
                              className="text-red-600 hover:text-red-900"
                              title="លុប"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground dark:text-slate-400 text-center py-4">មិនមានសិស្សអវត្តមាននៅថ្ងៃនេះទេ</p>
            )}
          </CardContent>
        </Card>

        {showAbsenceForm && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>ការកំណត់អវត្តមាន</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAbsenceSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ឈ្មោះសិស្ស</label>
                      <input
                        type="text"
                        value={selectedStudent.name}
                        readOnly
                        className="w-full p-2 border rounded-md bg-muted dark:bg-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">កាលបរិច្ឆេទ</label>
                        <input
                          type="date"
                          value={formData.date}
                          readOnly
                          className="w-full p-2 border rounded-md bg-muted dark:bg-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ពេលវេលា</label>
                        <select
                          name="timePeriod"
                          defaultValue={currentTimePeriod}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="morning">ពេលព្រឹក</option>
                          <option value="afternoon">ពេលរសៀល</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">ស្ថានភាព</label>
                      <div className="space-y-2">
                        {absenceTypes.map(type => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="absenceType"
                              value={type}
                              defaultChecked={editingAbsence?.absenceType === type}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ម៉ោង (សម្រាប់មកយឺត)</label>
                      <input
                        type="text"
                        name="time"
                        defaultValue={editingAbsence?.time || selectedStudent[currentTimePeriod].time}
                        onInput={handleTimeInput}
                        className="w-full p-2 border rounded-md"
                        placeholder="ម៉ោង:នាទី"
                        maxLength={5}
                        onKeyDown={(e) => {
                          // Allow numbers, Khmer numerals, Backspace, and Colon
                          if (!/[0-9០-៩:]/.test(e.key) && e.key !== 'Backspace') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">មូលហេតុ (បើមាន)</label>
                      <textarea
                        name="reason"
                        defaultValue={editingAbsence?.reason || selectedStudent[currentTimePeriod].reason}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="បញ្ចូលមូលហេតុ..."
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAbsenceForm(false)}
                        className="px-4 py-2 border rounded-md text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-slate-700"
                      >
                        បោះបង់
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        រក្សាទុក
                      </button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
