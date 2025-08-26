import { useState, useEffect, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'

// Type definitions
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

interface SchoolYearResponse {
  schoolYearId: number
  schoolYearCode: string
  createdAt: string
}

interface ClassesResponse {
  classes: string[]
}

export function useStudentInfo() {
  const { toast } = useToast()
  
  // State management
  const [students, setStudents] = useState<Student[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYearResponse[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  
  // UI states
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [showGuardianInfo, setShowGuardianInfo] = useState(false)
  const [showFamilyInfo, setShowFamilyInfo] = useState(false)
  const [showAcademicInfo, setShowAcademicInfo] = useState(false)

  // Fetch school years
  const fetchSchoolYears = async () => {
    try {
      const response = await fetch('/api/school-years')
      if (!response.ok) throw new Error('Failed to fetch school years')
      const data = await response.json()
      setSchoolYears(data)
    } catch (error) {
      console.error('Error fetching school years:', error)
      setError('Failed to load school years')
    }
  }

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (!response.ok) throw new Error('Failed to fetch classes')
      const data: ClassesResponse = await response.json()
      setClasses(data.classes)
    } catch (error) {
      console.error('Error fetching classes:', error)
      setError('Failed to load classes')
    }
  }

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to load students')
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSchoolYear = !selectedSchoolYear || student.schoolYear === selectedSchoolYear
      const matchesClass = !selectedClass || student.class === selectedClass
      const matchesSearch = !searchTerm || 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSchoolYear && matchesClass && matchesSearch
    })
  }, [students, selectedSchoolYear, selectedClass, searchTerm])

  // Student statistics
  const studentStats = useMemo(() => {
    const total = students.length
    const active = students.filter(s => s.status === 'active').length
    const male = students.filter(s => s.gender === 'male').length
    const female = students.filter(s => s.gender === 'female').length
    const needsSupport = students.filter(s => 
      s.needsClothes || s.needsMaterials || s.needsTransport
    ).length

    return {
      total,
      active,
      male,
      female,
      needsSupport,
      inactive: total - active
    }
  }, [students])

  // Class distribution
  const classDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {}
    students.forEach(student => {
      distribution[student.class] = (distribution[student.class] || 0) + 1
    })
    return distribution
  }, [students])

  // Handle student selection
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setShowStudentDetails(true)
  }

  // Handle student deletion
  const handleDeleteStudent = async (studentId: number) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete student')
      
      setStudents(prev => prev.filter(s => s.studentId !== studentId))
      toast({
        title: "Success",
        description: "Student deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting student:', error)
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive"
      })
    }
  }

  // Export student data
  const exportStudentData = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      const response = await fetch('/api/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: filteredStudents,
          format,
          filename: `students-${new Date().toISOString().split('T')[0]}`
        })
      })
      
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `students.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: `Student data exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      })
    }
  }

  // Initialize data
  useEffect(() => {
    fetchSchoolYears()
    fetchClasses()
    fetchStudents()
  }, [])

  return {
    // State
    students: filteredStudents,
    schoolYears,
    classes,
    loading,
    error,
    selectedSchoolYear,
    selectedClass,
    searchTerm,
    selectedStudent,
    showStudentDetails,
    showGuardianInfo,
    showFamilyInfo,
    showAcademicInfo,
    
    // Computed values
    studentStats,
    classDistribution,
    
    // Actions
    setSelectedSchoolYear,
    setSelectedClass,
    setSearchTerm,
    setSelectedStudent,
    setShowStudentDetails,
    setShowGuardianInfo,
    setShowFamilyInfo,
    setShowAcademicInfo,
    
    // Functions
    handleStudentSelect,
    handleDeleteStudent,
    exportStudentData,
    fetchStudents
  }
}
