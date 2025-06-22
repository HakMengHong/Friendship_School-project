"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, FileText, User, Home } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export default function RegistrationPage() {
  // Form state
  const [formData, setFormData] = useState({
    studentName: "",
    selectedStudent: null,
    gender: "",
    grade: "",
    dob: "",
    age: "",
    studentId: "",
    // Family information
    fatherLastName: "",
    fatherFirstName: "",
    motherLastName: "",
    motherFirstName: "",
    relationship: "",
    phone: "",
    address: "",
    // Add other fields as needed
    registrationDate: ""
  })

  const [showStudentList, setShowStudentList] = useState(false)

  // Mock student data
  const students = [
    { id: 1, lastName: "យន្ត", firstName: "សុខ", class: "៧ក", dob: "2010-05-15" },
    { id: 2, lastName: "វណ្ណា", firstName: "ស្រី", class: "៦ខ", dob: "2011-03-22" }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStudentSelect = (student) => {
    setFormData(prev => ({
      ...prev,
      selectedStudent: student,
      studentName: `${student.lastName} ${student.firstName}`,
      dob: student.dob
    }))
    setShowStudentList(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">ចុះឈ្មោះសិស្ស</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Card 1 - Student Search */}
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
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    onFocus={() => setShowStudentList(true)}
                  />
                  {showStudentList && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {students.map(student => (
                        <div
                          key={student.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleStudentSelect(student)}
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
                    <Input 
                      value={formData.selectedStudent?.lastName || ""} 
                      readOnly 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>នាមខ្លួន</Label>
                    <Input 
                      value={formData.selectedStudent?.firstName || ""} 
                      readOnly 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ភេទ</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
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
                    <Input 
                      type="date" 
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>អាយុ</Label>
                    <Input 
                      placeholder="អាយុ" 
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ចូលរៀនថ្នាក់ទី</Label>
                    <Select
                      value={formData.grade}
                      onValueChange={(value) => handleSelectChange('grade', value)}
                    >
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
                    <Input 
                      className="text-2xl h-16" 
                      placeholder="លេខសំគាល់សិស្ស"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3 - Family Information (abbreviated for example) */}
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
                    <Input 
                      placeholder="នាមត្រកូល"
                      name="fatherLastName"
                      value={formData.fatherLastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Other family fields would follow the same pattern */}
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
                  {/* Other checkboxes */}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>ថ្ងៃខែឆ្នាំចុះឈ្មោះចូលរៀន</Label>
                    <Input 
                      type="date" 
                      name="registrationDate"
                      value={formData.registrationDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      className="bg-[#0082c8] hover:bg-[#0069a3]"
                    >
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
      </form>
    </div>
  )
}
