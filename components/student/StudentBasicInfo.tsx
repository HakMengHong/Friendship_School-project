'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  User,
  Calendar,
  GraduationCap,
  Building,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Star,
  AlertCircle
} from "lucide-react"

interface StudentBasicInfoProps {
  formData: {
    lastName: string
    firstName: string
    gender: string
    dob: string
    age: string
    studentId: string
    class: string
    schoolYear: string
    registerToStudy: boolean
    previousSchool: string
    transferReason: string
    phone: string
    emergencyContact: string
  }
  schoolYears: Array<{ schoolYearId: number; schoolYearCode: string }>
  onFormDataChange: (field: string, value: any) => void
  onDateOfBirthChange: (dob: string) => void
  getGradeLabel: (grade: string | number) => string
}

export function StudentBasicInfo({
  formData,
  schoolYears,
  onFormDataChange,
  onDateOfBirthChange,
  getGradeLabel
}: StudentBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">ព័ត៌មានផ្ទាល់ខ្លួន</CardTitle>
              <p className="text-blue-100 text-sm">Personal Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Last Name */}
            <div>
              <Label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                នាមត្រកូល (Last Name)
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => onFormDataChange('lastName', e.target.value)}
                placeholder="ឧ. សុខ"
                className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>

            {/* First Name */}
            <div>
              <Label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                នាមខ្លួន (First Name)
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => onFormDataChange('firstName', e.target.value)}
                placeholder="ឧ. សំអាង"
                className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                ភេទ (Gender)
              </Label>
              <Select value={formData.gender} onValueChange={(value) => onFormDataChange('gender', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200">
                  <SelectValue placeholder="ជ្រើសរើសភេទ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ប្រុស (Male)</SelectItem>
                  <SelectItem value="female">ស្រី (Female)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dob" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => onDateOfBirthChange(e.target.value)}
                className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>

            {/* Age (Auto-calculated) */}
            <div>
              <Label htmlFor="age" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                អាយុ (Age)
              </Label>
              <Input
                id="age"
                value={formData.age}
                readOnly
                className="mt-1 h-12 text-lg border-blue-200 bg-blue-50 dark:bg-blue-950/20"
              />
            </div>

            {/* Student ID */}
            <div>
              <Label htmlFor="studentId" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Star className="h-4 w-4" />
                លេខសម្គាល់សិស្ស (Student ID)
              </Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => onFormDataChange('studentId', e.target.value)}
                placeholder="ឧ. STU001"
                className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information Section */}
      <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">ព័ត៌មានផ្នែកអប់រំ</CardTitle>
              <p className="text-green-100 text-sm">Academic Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class */}
            <div>
              <Label htmlFor="class" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <GraduationCap className="h-4 w-4" />
                ថ្នាក់ (Class)
              </Label>
              <Select value={formData.class} onValueChange={(value) => onFormDataChange('class', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-green-200 focus:border-green-500 focus:ring-green-200">
                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 12}, (_, i) => i + 1).map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {getGradeLabel(grade)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* School Year */}
            <div>
              <Label htmlFor="schoolYear" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                ឆ្នាំសិក្សា (School Year)
              </Label>
              <Select value={formData.schoolYear} onValueChange={(value) => onFormDataChange('schoolYear', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-green-200 focus:border-green-500 focus:ring-green-200">
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

            {/* Register to Study */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registerToStudy"
                  checked={formData.registerToStudy}
                  onCheckedChange={(checked) => onFormDataChange('registerToStudy', checked)}
                  className="border-green-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <Label htmlFor="registerToStudy" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ចុះឈ្មោះរៀន (Register to Study)
                </Label>
              </div>
            </div>

            {/* Previous School */}
            <div>
              <Label htmlFor="previousSchool" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Building className="h-4 w-4" />
                សាលារៀនពីមុន (Previous School)
              </Label>
              <Input
                id="previousSchool"
                value={formData.previousSchool}
                onChange={(e) => onFormDataChange('previousSchool', e.target.value)}
                placeholder="ឧ. សាលារៀនពីមុន"
                className="mt-1 h-12 text-lg border-green-200 focus:border-green-500 focus:ring-green-200"
              />
            </div>

            {/* Transfer Reason */}
            <div>
              <Label htmlFor="transferReason" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <AlertCircle className="h-4 w-4" />
                មូលហេតុផ្លាស់ទី (Transfer Reason)
              </Label>
              <Input
                id="transferReason"
                value={formData.transferReason}
                onChange={(e) => onFormDataChange('transferReason', e.target.value)}
                placeholder="ឧ. មូលហេតុផ្លាស់ទី"
                className="mt-1 h-12 text-lg border-green-200 focus:border-green-500 focus:ring-green-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">ព័ត៌មានទំនាក់ទំនង</CardTitle>
              <p className="text-purple-100 text-sm">Contact Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Phone className="h-4 w-4" />
                លេខទូរស័ព្ទ (Phone)
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => onFormDataChange('phone', e.target.value)}
                placeholder="ឧ. 012345678"
                className="mt-1 h-12 text-lg border-purple-200 focus:border-purple-500 focus:ring-purple-200"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <Label htmlFor="emergencyContact" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Phone className="h-4 w-4" />
                លេខទូរស័ព្ទអាសន្ន (Emergency Contact)
              </Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => onFormDataChange('emergencyContact', e.target.value)}
                placeholder="ឧ. 012345678"
                className="mt-1 h-12 text-lg border-purple-200 focus:border-purple-500 focus:ring-purple-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
