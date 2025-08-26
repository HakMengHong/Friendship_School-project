'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  HeartPulse,
  Award,
  Users,
  Loader2
} from "lucide-react"

interface Guardian {
  guardianId: number
  firstName?: string
  lastName?: string
  relation: string
  phone?: string
  occupation?: string
  houseNumber?: string
  village?: string
  district?: string
  province?: string
  birthDistrict?: string
  church?: string
  income?: number
  childrenCount?: number
  believeJesus?: boolean
}

interface FamilyInfo {
  familyinfoId: number
  canHelpSchool?: boolean
  churchName?: string
  durationInKPC?: string
  helpAmount?: number
  helpFrequency?: string
  knowSchool?: string
  livingCondition?: string
  livingWith?: string
  organizationHelp?: string
  ownHouse?: boolean
  religion?: string
}

interface Student {
  studentId: number
  firstName: string
  lastName: string
  gender: string
  dob: string | Date
  class: string
  photo?: string
  phone?: string
  registrationDate?: string | Date
  status?: string
  religion?: string
  health?: string
  emergencyContact?: string
  createdAt: string | Date
  updatedAt: string | Date
  classId?: number
  needsClothes?: boolean
  needsMaterials?: boolean
  needsTransport?: boolean
  previousSchool?: string
  registerToStudy?: boolean
  studentBirthDistrict?: string
  studentDistrict?: string
  studentHouseNumber?: string
  studentProvince?: string
  studentVillage?: string
  transferReason?: string
  vaccinated?: boolean
  schoolYear?: string
  family?: FamilyInfo
  guardians?: Guardian[]
}

interface StudentTableProps {
  students: Student[]
  loading?: boolean
  onViewDetails: (student: Student) => void
  onEdit: (student: Student) => void
  onDelete: (studentId: number) => void
}

export function StudentTable({
  students,
  loading = false,
  onViewDetails,
  onEdit,
  onDelete
}: StudentTableProps) {
  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('km-KH')
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active':
        return 'សកម្ម'
      case 'inactive':
        return 'អសកម្ម'
      case 'suspended':
        return 'ផ្អាក'
      default:
        return 'មិនដឹង'
    }
  }

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? '👨' : '👩'
  }

  const getSupportNeeds = (student: Student) => {
    const needs = []
    if (student.needsClothes) needs.push('សំលៀកបំពាក់')
    if (student.needsMaterials) needs.push('សម្ភារៈ')
    if (student.needsTransport) needs.push('ដំណើរ')
    return needs
  }

  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student Table
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">
                កំពុងផ្ទុកព័ត៌មានសិស្ស...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (students.length === 0) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student Table
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              គ្មានសិស្ស
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              មិនមានសិស្សដែលត្រូវគ្នានឹងការច្រោះរបស់អ្នក
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student Table - {students.length} សិស្ស
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            {students.length} សិស្ស
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="font-semibold">សិស្ស</TableHead>
                <TableHead className="font-semibold">ថ្នាក់</TableHead>
                <TableHead className="font-semibold">ព័ត៌មានទំនាក់ទំនង</TableHead>
                <TableHead className="font-semibold">ស្ថានភាព</TableHead>
                <TableHead className="font-semibold">តម្រូវការ</TableHead>
                <TableHead className="font-semibold">កាលបរិច្ឆេទ</TableHead>
                <TableHead className="font-semibold">សកម្មភាព</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const supportNeeds = getSupportNeeds(student)
                return (
                  <TableRow key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {student.photo ? (
                            <img
                              src={student.photo}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getGenderIcon(student.gender)}</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {student.firstName} {student.lastName}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {student.studentId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{student.class}</span>
                      </div>
                      {student.schoolYear && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {student.schoolYear}
                        </p>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {student.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{student.phone}</span>
                          </div>
                        )}
                        {student.studentVillage && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{student.studentVillage}</span>
                          </div>
                        )}
                        {student.emergencyContact && (
                          <div className="flex items-center space-x-1">
                            <HeartPulse className="h-3 w-3 text-red-400" />
                            <span className="text-sm text-red-600">{student.emergencyContact}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {getStatusLabel(student.status)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {supportNeeds.length > 0 ? (
                          supportNeeds.map((need, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {need}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            គ្មាន
                          </span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(student.registrationDate || student.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(student.dob)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => onViewDetails(student)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => onEdit(student)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => onDelete(student.studentId)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
