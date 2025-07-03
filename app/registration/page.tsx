'use client'
export const dynamic = "force-dynamic"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserPlus, FileText, User, Home, BookOpen, Calendar, Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function RegistrationPage() {
  const [studentName, setStudentName] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [guardianForms, setGuardianForms] = useState([0]); // Start with one form

  // Mock student data
  const students = [
    { id: 1, lastName: "យន្ត", firstName: "សុខ", class: "៧ក", dob: "2010-05-15", gender: "male" },
    { id: 2, lastName: "វណ្ណា", firstName: "ស្រី", class: "៦ខ", dob: "2011-03-22", gender: "female" },
    { id: 3, lastName: "សុខ", firstName: "ម៉ាលី", class: "៧ខ", dob: "2010-08-10", gender: "female" },
    { id: 4, lastName: "រស់", firstName: "សំណាង", class: "៦ក", dob: "2011-01-05", gender: "male" },
    { id: 5, lastName: "វណ្ដណា", firstName: "ស្រី", class: "៦ខ", dob: "2011-03-22", gender: "female" },
    { id: 7, lastName: "សុេដខ", firstName: "ម៉ាលី", class: "៧ខ", dob: "2010-08-10", gender: "female" },
    { id: 8, lastName: "រេស់ដ", firstName: "សំណាង", class: "៦ក", dob: "2011-01-05", gender: "male" },
    { id: 9, lastName: "វណ្ណាេ", firstName: "ស្រី", class: "៦ខ", dob: "2011-03-22", gender: "female" },
    { id: 10, lastName: "សុេខ", firstName: "ម៉ាលី", class: "៧ខ", dob: "2010-08-10", gender: "female" },
    { id: 11, lastName: "រដស់", firstName: "សំណាង", class: "៦ក", dob: "2011-01-05", gender: "male" },
    { id: 12, lastName: "វណ្ា្ដណា", firstName: "ស្រី", class: "៦ខ", dob: "2011-03-22", gender: "female" },
    { id: 13, lastName: "សុដខ", firstName: "ម៉ាលី", class: "៧ខ", dob: "2010-08-10", gender: "female" },
  ]

  const addGuardianForm = () => {
    setGuardianForms([...guardianForms, guardianForms.length]);
  };

  const removeGuardianForm = (indexToRemove) => {
    setGuardianForms(guardianForms.filter(index => index !== indexToRemove));
  };

  const tabs = [
    { id: 'basic', label: 'ព័ត៌មានសិស្ស'},
    { id: 'guardian', label: 'ព័ត៌មានអាណាព្យាបាល'},
    { id: 'family', label: 'ព័ត៌មានពីស្ថានភាពគ្រួសារសិស្ស'},
    { id: 'additional', label: 'ព័ត៌មានបន្ថែម'}
  ];

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Student List Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">បញ្ជីឈ្មោះសិស្ស</CardTitle>
                  <CardDescription>សូមជ្រើសរើសសិស្ស</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="ស្វែងរកសិស្ស..."
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="pl-10"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-2 max-h-[calc(150vh-300px)] overflow-y-auto">
                  {students
                    .filter(student => {
                      if (!studentName) return true
                      const searchTerm = studentName.toLowerCase()
                      const fullName = `${student.lastName} ${student.firstName}`.toLowerCase()
                      return fullName.includes(searchTerm)
                    })
                    .map(student => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStudent?.id === student.id 
                            ? 'bg-blue-50 border border-blue-100' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {student.lastName} {student.firstName}
                            </p>
                            <p className="text-sm text-gray-500">
                              ថ្នាក់ {student.class} • ID: {student.id}
                            </p>
                          </div>
                          {selectedStudent?.id === student.id && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              បានជ្រើសរើស
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form Content */}
        <div className="flex-1 space-y-6">
          {/* Form Navigation Tabs */}
            <div className="bg-white rounded-xl border-none shadow-sm overflow-hidden">
              <nav className="flex overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium flex items-center space-x-2 border-b-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

          {/* Basic Information Tab */}
          {activeTab === "basic" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
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
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[150px] space-y-2">
                    <Label htmlFor="dob">ថ្ងៃខែឆ្នាំកំណើត</Label>
                    <Input 
                      type="date" 
                      id="dob" 
                      value={selectedStudent?.dob || ""} 
                      className="w-[150px]"
                      onChange={(e) => setSelectedStudent({...selectedStudent, dob: e.target.value})}
                    />
                    </div>
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
                  
                 <div className="flex-1 min-w-[100px] flex flex-col items-center justify-center space-y-2">
                      <Checkbox id={"register-to-study"} />
                      <Label htmlFor={"register-to-study"}>ចុះឈ្មេាះចូលរៀន?</Label>
                  </div>
                  
                  {/* Student ID */}
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <Label>លេខសំគាល់សិស្ស (ID)</Label>
                    <div className="text-4xl h-10 flex items-center justify-center font-bold bg-gray-100 rounded-md p-4">
                      {selectedStudent?.studentId || "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>អាសយដ្ឋានសិស្ស</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {/* House Number */}
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <Label htmlFor="student-house-number">ផ្ទះលេខ</Label>
                    <Input id="student-house-number" placeholder="ផ្ទះលេខ" />
                  </div>

                  {/* Village */}
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <Label htmlFor="student-village">ភូមិ/សង្កាត់</Label>
                    <Input id="student-village" placeholder="ភូមិ/សង្កាត់" />
                  </div>

                  {/* District */}
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <Label htmlFor="student-district">ស្រុក/ខណ្ឌ</Label>
                    <Input id="student-district" placeholder="ស្រុក/ខណ្ឌ" />
                  </div>

                  {/* Province */}
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <Label htmlFor="student-province">ខេត្ត/ក្រុង</Label>
                    <Input id="student-province" placeholder="ខេត្ត/ក្រុង" />
                  </div>

                  {/* Birth District */}
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <Label htmlFor="student-birth-district">ស្រុកកំណើត</Label>
                    <Input id="student-birth-district" placeholder="ស្រុកកំណើត" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Family Information Tab */}
          {activeTab === "guardian" && (
            <div className="space-y-4">
              {guardianForms.map((formIndex) => (
                <Card key={formIndex}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center space-x-2">
                        <Home className="h-5 w-5 text-blue-600" />
                        <span>
                          ព័ត៌មានអាណាព្យាបាល {guardianForms.length > 1 ? formIndex + 1 : ''}
                        </span>
                      </CardTitle>
                      {formIndex > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuardianForm(formIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          លុប
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {/* Family's Name */}
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`family-first-name-${formIndex}`}>នាមត្រកូល</Label>
                        <Input id={`family-first-name-${formIndex}`} placeholder="នាមត្រកូល" />
                      </div>
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`family-last-name-${formIndex}`}>នាមខ្លួន</Label>
                        <Input id={`family-last-name-${formIndex}`} placeholder="នាមខ្លួន" />
                      </div>

                      {/* Guardian Info */}
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`guardian-relation-${formIndex}`}>ត្រូវជា</Label>
                        <Select>
                          <SelectTrigger id={`guardian-relation-${formIndex}`}>
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
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`phone-${formIndex}`}>លេខទូរស័ព្ទ</Label>
                        <Input id={`phone-${formIndex}`} placeholder="លេខទូរស័ព្ទ" />
                      </div>

                      {/* Occupation */}
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`occupation-${formIndex}`}>មុខរបរ</Label>
                        <Input id={`occupation-${formIndex}`} placeholder="មុខរបរ" />
                      </div>
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`income-${formIndex}`}>ប្រាក់ចំណូល</Label>
                        <Input id={`income-${formIndex}`} placeholder="ប្រាក់ចំណូល" />
                      </div>

                      {/* Children Info */}
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`children-count-${formIndex}`}>ចំនួនកូនក្នុងបន្ទុក</Label>
                        <Input id={`children-count-${formIndex}`} type="number" placeholder="ចំនួន" />
                      </div>

                      {/* Address */}
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`house-number-${formIndex}`}>ផ្ទះលេខ</Label>
                        <Input id={`house-number-${formIndex}`} placeholder="ផ្ទះលេខ" />
                      </div>
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`village-${formIndex}`}>ភូមិ/សង្កាត់</Label>
                        <Input id={`village-${formIndex}`} placeholder="ភូមិ/សង្កាត់" />
                      </div>
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`district-${formIndex}`}>ស្រុក/ខណ្ឌ</Label>
                        <Input id={`district-${formIndex}`} placeholder="ស្រុក/ខណ្ឌ" />
                      </div>
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`province-${formIndex}`}>ខេត្ត/ក្រុង</Label>
                        <Input id={`province-${formIndex}`} placeholder="ខេត្ត/ក្រុង" />
                      </div>
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`birth-district-${formIndex}`}>ស្រុកកំណើត</Label>
                        <Input id={`birth-district-${formIndex}`} placeholder="ស្រុកកំណើត" />
                      </div>

                      {/* Religion */}
                      <div className="flex-1 min-w-[100px] flex flex-col items-center justify-center space-y-2">
                          <Checkbox id={`believe-jesus-${formIndex}`} />
                          <Label htmlFor={`believe-jesus-${formIndex}`}>ជឿព្រះយ៉េស៊ូ?</Label>
                      </div>
                      <div className="flex-1 min-w-[180px] space-y-2">
                        <Label htmlFor={`church-${formIndex}`}>ព្រះវិហារ</Label>
                        <Input id={`church-${formIndex}`} placeholder="ព្រះវិហារ" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                type="button" 
                onClick={addGuardianForm}
                className="mt-4"
                variant="outline"
              >
                + បន្ថែម
              </Button>
            </div>
          )}

          {activeTab === "family" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>ព័ត៌មានពីស្ថានភាពគ្រួសារសិស្ស</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {/* Living Situation */}
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <Label htmlFor="living-with">នៅជាមួយអ្នកណា</Label>
                      <Input id="living-with" placeholder="នៅជាមួយអ្នកណា" />
                    </div>
                    
                    <div className="flex-1 min-w-[180px] flex flex-col items-center justify-center space-y-2">
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
                    <div className="flex-1 min-w-[180px] space-y-2">
                      <Label htmlFor="organization-help">ទទួលជំនួយពីអង្គការ</Label>
                      <Input id="organization-help" placeholder="អង្គការ" />
                    </div>

                    {/* School Info */}
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <Label htmlFor="know-school">ស្គាល់សាលាតាមរយៈ</Label>
                      <Input id="know-school" placeholder="ស្គាល់សាលាតាម" />
                    </div>

                    {/* Religion */}
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <Label htmlFor="religion">សាសនា</Label>
                      <Input id="religion" placeholder="សាសនា" />
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-2">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>ព័ត៌មានសិក្សាសម្រាប់សិស្សថ្មី</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <Label htmlFor="school">សាលារៀនមុន</Label>
                      <Input id="school" />
                    </div>
                    
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <Label htmlFor="reason">មូលហេតុផ្លាស់ប្តូរ</Label>
                      <Input id="reason" />
                    </div>
                    
                    <div className="flex-1 min-w-[350px] flex flex-col items-center justify-center space-y-2">
                        <Checkbox id="vaccinated" />
                        <Label htmlFor="vaccinated" className="cursor-pointer">
                          សិស្សទទួលបានវ៉ាក់សាំងគ្រប់គ្រាន់ហើយនៅ?
                        </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Additional Information Tab */}
          {activeTab === "additional" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>តម្រូវការពីសាលា</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="clothes" />
                        <Label htmlFor="clothes">កង្វះខាតសម្លៀកបំពាក់</Label>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="materials" />
                        <Label htmlFor="materials">កង្វះខាតសម្ភារៈសិក្សា</Label>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="transport" />
                        <Label htmlFor="transport">ត្រូវការឡានដើម្បីជូនមកសាលា</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>កាលបរិច្ឆេទចុះឈ្មោះ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <Label htmlFor="registration-date">ថ្ងៃខែឆ្នាំចុះឈ្មោះចូលរៀន</Label>
                      <Input
                        id="registration-date"
                        type="date"
                        className="w-[150px]"
                      />
                    </div>
                  </div>
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <div className="flex gap-4 pt-6">
                        <Button className="bg-blue-600 hover:bg-blue-700">
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
          )}
        </div>
      </div>
    </>
  )
}
