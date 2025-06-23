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
                <Label htmlFor="student-search" className="sr-only">ស្វែងរកសិស្ស</Label>
                <Input
                  id="student-search"
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
              <div className="flex flex-wrap gap-4">
                {/* Last Name */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="last-name">នាមត្រកូល</Label>
                  <Input 
                    id="last-name" 
                    value={selectedStudent?.lastName || ""} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, lastName: e.target.value})}
                  />
                </div>

                {/* First Name */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="first-name">នាមខ្លួន</Label>
                  <Input 
                    id="first-name" 
                    value={selectedStudent?.firstName || ""} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, firstName: e.target.value})}
                  />
                </div>

                {/* Gender */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="gender">ភេទ</Label>
                  <Select
                    value={selectedStudent?.gender || ""}
                    onValueChange={(value) => setSelectedStudent({...selectedStudent, gender: value})}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="ជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ប្រុស</SelectItem>
                      <SelectItem value="female">ស្រី</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date of Birth */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="dob">ថ្ងៃខែឆ្នាំកំណើត</Label>
                  <Input 
                    type="date" 
                    id="dob" 
                    value={selectedStudent?.dob || ""} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, dob: e.target.value})}
                  />
                </div>

                {/* Age */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="age">អាយុ</Label>
                  <Input 
                    id="age" 
                    value={selectedStudent?.age || ""}
                    onChange={(e) => setSelectedStudent({...selectedStudent, age: e.target.value})}
                    placeholder="អាយុ" 
                  />
                </div>

                {/* Class */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="class">ចូលរៀនថ្នាក់ទី</Label>
                  <Select
                    value={selectedStudent?.class || ""}
                    onValueChange={(value) => setSelectedStudent({...selectedStudent, class: value})}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="ជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent>
                      {["៧ក", "៧ខ", "៦ក", "៦ខ", "៥ក", "៥ខ"].map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student ID */}

                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label>លេខសំគាល់សិស្ស (ID)</Label>
                    <div className="text-4xl h-10 flex items-center justify-center font-bold bg-gray-100 rounded-md p-4">
                      {selectedStudent?.studentId || "1000"}
                    </div>
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
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {/* Family's Name */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="family-first-name">នាមត្រកូល</Label>
                  <Input id="family-first-name" placeholder="នាមត្រកូល" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="family-last-name">នាមខ្លួន</Label>
                  <Input id="family-last-name" placeholder="នាមខ្លួន" />
                </div>

                {/* Guardian Info */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="guardian-relation">ត្រូវជា</Label>
                  <Select>
                    <SelectTrigger id="guardian-relation">
                      <SelectValue placeholder="ជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">ឪពុក</SelectItem>
                      <SelectItem value="mother">ម្តាយ</SelectItem>
                      <SelectItem value="guardian">អាណាព្យាបាល</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="phone">លេខទូរស័ព្ទ</Label>
                  <Input id="phone" placeholder="លេខទូរស័ព្ទ" />
                </div>

                {/* Occupation */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="occupation">មុខរបរ</Label>
                  <Input id="occupation" placeholder="មុខរបរ" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="income">ប្រាក់ចំណូល</Label>
                  <Input id="income" placeholder="ប្រាក់ចំណូល" />
                </div>

                {/* Children Info */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="children-count">ចំនួនកូនក្នុងបន្ទុក</Label>
                  <Input id="children-count" type="number" placeholder="ចំនួន" />
                </div>

                {/* Address */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="house-number">ផ្ទះលេខ</Label>
                  <Input id="house-number" placeholder="ផ្ទះលេខ" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="village">ភូមិ/សង្កាត់</Label>
                  <Input id="village" placeholder="ភូមិ/សង្កាត់" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="district">ស្រុក/ខណ្ឌ</Label>
                  <Input id="district" placeholder="ស្រុក/ខណ្ឌ" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="province">ខេត្ត/ក្រុង</Label>
                  <Input id="province" placeholder="ខេត្ត/ក្រុង" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="birth-district">ស្រុកកំណើត</Label>
                  <Input id="birth-district" placeholder="ស្រុកកំណើត" />
                </div>

                {/* Religion */}
                <div className="flex-1 min-w-[150px] space-y-2 flex items-center gap-2">
                  <Checkbox id="believe-jesus" />
                  <Label htmlFor="believe-jesus">ជឿព្រះយ៉េស៊ូ?</Label>
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="church">ព្រះវិហារ</Label>
                  <Input id="church" placeholder="ព្រះវិហារ" />
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
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {/* House Number */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="student-house-number">ផ្ទះលេខ</Label>
                  <Input id="student-house-number" placeholder="ផ្ទះលេខ" />
                </div>

                {/* Village */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="student-village">ភូមិ/សង្កាត់</Label>
                  <Input id="student-village" placeholder="ភូមិ/សង្កាត់" />
                </div>

                {/* District */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="student-district">ស្រុក/ខណ្ឌ</Label>
                  <Input id="student-district" placeholder="ស្រុក/ខណ្ឌ" />
                </div>

                {/* Province */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="student-province">ខេត្ត/ក្រុង</Label>
                  <Input id="student-province" placeholder="ខេត្ត/ក្រុង" />
                </div>

                {/* Birth District */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="student-birth-district">ស្រុកកំណើត</Label>
                  <Input id="student-birth-district" placeholder="ស្រុកកំណើត" />
                </div>

                {/* Vaccination Checkbox */}
                <div className="flex-1 min-w-[240px] space-y-2 flex items-center gap-2">
                  <Checkbox id="vaccinated" />
                  <Label htmlFor="vaccinated">សិស្សទទួលបានវ៉ាក់សាំងគ្រប់គ្រាន់ហើយនៅ?</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#0082c8]" />
                <span>ព័ត៌មានពីស្ថានភាពគ្រួសារសិស្ស</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {/* Living Situation */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="living-with">នៅជាមួយអ្នកណា</Label>
                  <Input id="living-with" placeholder="នៅជាមួយអ្នកណា" />
                </div>
                
                <div className="flex-1 min-w-[180px] space-y-2 flex items-center gap-2">
                  <Checkbox id="own-house" />
                  <Label htmlFor="own-house">នៅផ្ទះផ្ទាល់ខ្លួន?</Label>
                </div>

                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="duration-in-kpc">រយៈពេលនៅកំពង់ចាម</Label>
                  <Input id="duration-in-kpc" placeholder="រយៈពេល" />
                </div>

                {/* Living Condition */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="living-condition">ជីវភាព</Label>
                  <Select>
                    <SelectTrigger id="living-condition">
                      <SelectValue placeholder="ជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">ល្អ</SelectItem>
                      <SelectItem value="medium">មធ្យម</SelectItem>
                      <SelectItem value="poor">ខ្វះខាត</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization Help */}
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label htmlFor="organization-help">ទទួលជំនួយពីអង្គការ</Label>
                  <Input id="organization-help" placeholder="អង្គការ" />
                </div>

                {/* School Info */}
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label htmlFor="know-school">ស្គាល់សាលាតាមរយៈ</Label>
                  <Input id="know-school" placeholder="មធ្យោបាយស្គាល់សាលា" />
                </div>

                {/* Religion */}
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="religion">សាសនា</Label>
                  <Input id="religion" placeholder="សាសនា" />
                </div>

                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="church-name">ឈ្មោះព្រះវិហារ</Label>
                  <Input id="church-name" placeholder="ព្រះវិហារ" />
                </div>

                {/* School Support */}
                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="can-help-school">លទ្ធភាពជួយសាលា</Label>
                  <Select>
                    <SelectTrigger id="can-help-school">
                      <SelectValue placeholder="ជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">បាទ/ចាស</SelectItem>
                      <SelectItem value="no">ទេ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[180px] space-y-2">
                  <Label htmlFor="help-amount">ថវិកាជួយសាលា</Label>
                  <Input id="help-amount" placeholder="ចំនួនទឹកប្រាក់" />
                </div>

                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="help-frequency">ក្នុងមួយ</Label>
                  <Select>
                    <SelectTrigger id="help-frequency">
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
                <div className="flex gap-4">
                  <Label htmlFor="registration-date">ថ្ងៃខែឆ្នាំចុះឈ្មោះចូលរៀន</Label>
                  <Input id="registration-date" type="date" />
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
