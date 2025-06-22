"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, FileText, ChevronDown, User, BookOpen, Home, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export default function RegistrationPage() {
  const [studentName, setStudentName] = useState("")
  const [showStudentList, setShowStudentList] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Mock student data
  const students = [
    { id: 1, lastName: "យន្ត", firstName: "សុខ", class: "៧ក", dob: "2010-05-15" },
    { id: 2, lastName: "វណ្ណា", firstName: "ស្រី", class: "៦ខ", dob: "2011-03-22" }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">ចុះឈ្មោះសិស្ស</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Card 1 - Student Search (Left Side) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-[#0082c8]" />
                <span>ឈ្មោះសិស្ស</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="សរសេរឈ្មោះសិស្ស"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  onFocus={() => setShowStudentList(true)}
                />
                {showStudentList && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {students.map(student => (
                      <div
                        key={student.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedStudent(student)
                          setStudentName(`${student.lastName} ${student.firstName}`)
                          setShowStudentList(false)
                        }}
                      >
                        {student.lastName} {student.firstName} (ថ្នាក់ {student.class})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Cards */}
        <div className="lg:col-span-3 space-y-6">
          {/* Card 2 - Student Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#0082c8]" />
                <span>ព័ត៌មានមូលដ្ឋាន</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>នាមត្រកូល</Label>
                  <Input value={selectedStudent?.lastName || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>នាមខ្លួន</Label>
                  <Input value={selectedStudent?.firstName || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>ភេទ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ប្រុស</SelectItem>
                      <SelectItem value="female">ស្រី</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ថ្ងៃខែឆ្នាំកំណើត</Label>
                  <Input type="date" value={selectedStudent?.dob || ""} />
                </div>
                <div className="space-y-2">
                  <Label>អាយុ</Label>
                  <Input placeholder="អាយុ" />
                </div>
                <div className="space-y-2">
                  <Label>ចូលរៀនថ្នាក់ទី</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent>
                      {["៧ក", "៧ខ", "៦ក", "៦ខ", "៥ក", "៥ខ"].map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>លេខសំគាល់សិស្ស (ID)</Label>
                  <Input className="text-2xl h-16" placeholder="លេខសំគាល់សិស្ស" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 - Family Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-[#0082c8]" />
                <span>ព័ត៌មានគ្រួសារ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>នាមត្រកូលឪពុក</Label>
                  <Input placeholder="នាមត្រកូល" />
                </div>
                <div className="space-y-2">
                  <Label>នាមខ្លួនឪពុក</Label>
                  <Input placeholder="នាមខ្លួន" />
                </div>
                <div className="space-y-2">
                  <Label>នាមត្រកូលម្តាយ</Label>
                  <Input placeholder="នាមត្រកូល" />
                </div>
                <div className="space-y-2">
                  <Label>នាមខ្លួនម្តាយ</Label>
                  <Input placeholder="នាមខ្លួន" />
                </div>
                <div className="space-y-2">
                  <Label>ត្រូវជា</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">ឪពុក</SelectItem>
                      <SelectItem value="mother">ម្តាយ</SelectItem>
                      <SelectItem value="guardian">អាណាព្យាបាល</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>លេខទូរស័ព្ទ</Label>
                  <Input placeholder="លេខទូរស័ព្ទ" />
                </div>
                <div className="space-y-2">
                  <Label>ផ្ទះលេខ</Label>
                  <Input placeholder="ផ្ទះលេខ" />
                </div>
                <div className="space-y-2">
                  <Label>ភូមិ/សង្កាត់</Label>
                  <Input placeholder="ភូមិ/សង្កាត់" />
                </div>
                <div className="space-y-2">
                  <Label>ស្រុក/ខណ្ឌ</Label>
                  <Input placeholder="ស្រុក/ខណ្ឌ" />
                </div>
                <div className="space-y-2">
                  <Label>ខេត្ត/ក្រុង</Label>
                  <Input placeholder="ខេត្ត/ក្រុង" />
                </div>
                <div className="space-y-2">
                  <Label>មុខរបរ</Label>
                  <Input placeholder="មុខរបរ" />
                </div>
                <div className="space-y-2">
                  <Label>ប្រាក់ចំណូល</Label>
                  <Input placeholder="ប្រាក់ចំណូល" />
                </div>
                <div className="space-y-2">
                  <Label>ស្រុកកំណើត</Label>
                  <Input placeholder="ស្រុកកំណើត" />
                </div>
                <div className="space-y-2">
                  <Label>ចំនួនកូនក្នុងបន្ទុក</Label>
                  <Input type="number" placeholder="ចំនួន" />
                </div>
                <div className="space-y-2 flex items-center gap-2">
                  <Checkbox id="believe-jesus" />
                  <Label htmlFor="believe-jesus">ជឿព្រះយ៉េស៊ូ?</Label>
                </div>
                <div className="space-y-2">
                  <Label>ព្រះវិហារ</Label>
                  <Input placeholder="ព្រះវិហារ" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 - Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#0082c8]" />
                <span>ព័ត៌មានពីសិស្ស</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ផ្ទះលេខសិស្ស</Label>
                  <Input placeholder="ផ្ទះលេខ" />
                </div>
                <div className="space-y-2">
                  <Label>ភូមិ/សង្កាត់</Label>
                  <Input placeholder="ភូមិ/សង្កាត់" />
                </div>
                <div className="space-y-2">
                  <Label>ស្រុក/ខណ្ឌ</Label>
                  <Input placeholder="ស្រុក/ខណ្ឌ" />
                </div>
                <div className="space-y-2">
                  <Label>ខេត្ត/ក្រុង</Label>
                  <Input placeholder="ខេត្ត/ក្រុង" />
                </div>
                <div className="space-y-2">
                  <Label>ស្រុកកំណើត</Label>
                  <Input placeholder="ស្រុកកំណើត" />
                </div>
                <div className="space-y-2 flex items-center gap-2">
                  <Checkbox id="vaccinated" />
                  <Label htmlFor="vaccinated">សិស្សទទួលបានវ៉ាក់សាំងគ្រប់គ្រាន់ហើយនៅ?</Label>
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Card 6 - School Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-[#0082c8]" />
                  <span>ព័ត៌មានពីស្ថានភាពគ្រួសារសិស្ស</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>នៅជាមួយអ្នកណា</Label>
                    <Input placeholder="នៅជាមួយអ្នកណា" />
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <Checkbox id="own-house" />
                    <Label htmlFor="own-house">នៅផ្ទះផ្ទាល់ខ្លួន?</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>រយៈពេលនៅកំពង់ចាម</Label>
                    <Input placeholder="រយៈពេល" />
                  </div>
                  <div className="space-y-2">
                    <Label>ជីវភាព</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="ជ្រើសរើស" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">ល្អ</SelectItem>
                        <SelectItem value="medium">មធ្យម</SelectItem>
                        <SelectItem value="poor">ខ្វះខាត</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ទទួលមានជំនួយពីអង្គការណា</Label>
                    <Input placeholder="អង្គការ" />
                  </div>
                  <div className="space-y-2">
                    <Label>តើអ្នកស្គាល់សាលាតាមរយៈអ្វី?</Label>
                    <Input placeholder="មធ្យោបាយស្គាល់សាលា" />
                  </div>
                  <div className="space-y-2">
                    <Label>សាសនា</Label>
                    <Input placeholder="សាសនា" />
                  </div>
                  <div className="space-y-2">
                    <Label>ឈ្មោះព្រះវិហារ</Label>
                    <Input placeholder="ព្រះវិហារ" />
                  </div>
                  <div className="space-y-2">
                    <Label>លទ្ធភាពជួយសាលា</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="ជ្រើសរើស" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">បាទ/ចាស</SelectItem>
                        <SelectItem value="no">ទេ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ថវិកាជួយសាលា</Label>
                    <Input placeholder="ចំនួនទឹកប្រាក់" />
                  </div>
                  <div className="space-y-2">
                    <Label>ក្នុងមួយ</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="ជ្រើសរើស" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">ខែ</SelectItem>
                        <SelectItem value="year">ឆ្នាំ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            </CardContent>
          </Card>

          {/* Card 5 - School Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-[#0082c8]" />
                <span>តម្រូវការពីសាលា</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="clothes" />
                  <Label htmlFor="clothes">កង្វះខាតសម្លៀកបំពាក់</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="materials" />
                  <Label htmlFor="materials">កង្វះខាតសម្ភារៈសិក្សា</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="transport" />
                  <Label htmlFor="transport">ត្រូវការឡានដើម្បីជូនមកសាលា</Label>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>ថ្ងៃខែឆ្នាំចុះឈ្មោះចូលរៀន</Label>
                  <Input type="date" />
                </div>
                <div className="flex gap-4">
                  <Button className="bg-[#0082c8] hover:bg-[#0069a3]">
                    បញ្ចប់ការចុះឈ្មោះសិស្ស
                  </Button>
                  <Button variant="outline">
                    បោះពុម្ព
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
