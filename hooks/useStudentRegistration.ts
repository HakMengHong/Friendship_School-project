import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

// PDF generation types
import type { StudentData } from '@/lib/puppeteer-pdf-generator'

interface Guardian {
  firstName: string
  lastName: string
  relation: string
  phone: string
  occupation: string
  income: string
  childrenCount: string
  houseNumber: string
  village: string
  district: string
  province: string
  birthDistrict: string
  believeJesus: boolean
  church: string
}

interface FamilyInfo {
  livingWith: string
  ownHouse: boolean
  durationInKPC: string
  livingCondition: string
  organizationHelp: string
  knowSchool: string
  religion: string
  churchName: string
  canHelpSchool: boolean
  helpAmount: string
  helpFrequency: string
}

interface StudentFormData {
  // Basic Information
  lastName: string
  firstName: string
  gender: string
  dob: string
  age: string
  studentId: string
  
  // Academic Information
  class: string
  schoolYear: string
  registerToStudy: boolean
  previousSchool: string
  transferReason: string
  
  // Address & Contact
  studentHouseNumber: string
  studentVillage: string
  studentDistrict: string
  studentProvince: string
  studentBirthDistrict: string
  phone: string
  emergencyContact: string
  
  // Health & Religion
  health: string
  vaccinated: boolean
  religion: string
  
  // School Needs
  needsClothes: boolean
  needsMaterials: boolean
  needsTransport: boolean
  
  // Guardians
  guardians: Guardian[]
  
  // Family info
  familyInfo: FamilyInfo
}

interface Student {
  id: string
  lastName: string
  firstName: string
  class: string
  dob: string
  gender: string
  studentId: string
}

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
  createdAt: string
}

export function useStudentRegistration() {
  const { toast } = useToast()
  
  // Main state
  const [studentName, setStudentName] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student>({
    id: 'new',
    lastName: '',
    firstName: '',
    class: '',
    dob: '',
    gender: '',
    studentId: ''
  })
  const [activeTab, setActiveTab] = useState("basic")
  const [guardianForms, setGuardianForms] = useState([0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [isNewStudent, setIsNewStudent] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])

  // Form state for new student
  const [formData, setFormData] = useState<StudentFormData>({
    // Basic Information
    lastName: '',
    firstName: '',
    gender: '',
    dob: '',
    age: '',
    studentId: '',
    
    // Academic Information
    class: '',
    schoolYear: '',
    registerToStudy: false,
    previousSchool: '',
    transferReason: '',
    
    // Address & Contact
    studentHouseNumber: '',
    studentVillage: '',
    studentDistrict: '',
    studentProvince: '',
    studentBirthDistrict: '',
    phone: '',
    emergencyContact: '',
    
    // Health & Religion
    health: '',
    vaccinated: false,
    religion: '',
    
    // School Needs
    needsClothes: false,
    needsMaterials: false,
    needsTransport: false,
    
    // Guardians
    guardians: [{
      firstName: '',
      lastName: '',
      relation: '',
      phone: '',
      occupation: '',
      income: '',
      childrenCount: '',
      houseNumber: '',
      village: '',
      district: '',
      province: '',
      birthDistrict: '',
      believeJesus: false,
      church: ''
    }],
    
    // Family info
    familyInfo: {
      livingWith: '',
      ownHouse: false,
      durationInKPC: '',
      livingCondition: '',
      organizationHelp: '',
      knowSchool: '',
      religion: '',
      churchName: '',
      canHelpSchool: false,
      helpAmount: '',
      helpFrequency: ''
    }
  })

  // Utility functions
  const getGradeLabel = (gradeNumber: string | number) => {
    const gradeMap: { [key: string]: string } = {
      "1": "ថ្នាក់ទី១",
      "2": "ថ្នាក់ទី២", 
      "3": "ថ្នាក់ទី៣",
      "4": "ថ្នាក់ទី៤",
      "5": "ថ្នាក់ទី៥",
      "6": "ថ្នាក់ទី៦",
      "7": "ថ្នាក់ទី៧",
      "8": "ថ្នាក់ទី៨",
      "9": "ថ្នាក់ទី៩"
    }
    return gradeMap[gradeNumber?.toString()] || gradeNumber?.toString() || "N/A"
  }

  const generateNextStudentId = async () => {
    try {
      const response = await fetch('/api/students/next-id')
      const data = await response.json()
      return data.nextStudentId
    } catch (error) {
      console.error('Error generating student ID:', error)
      const nextId = students.length + 1
      return nextId.toString()
    }
  }

  const generateSimpleStudentId = () => {
    const nextId = students.length + 1
    return nextId.toString()
  }

  const formatKhmerText = (text: string, defaultValue: string = 'មិនមាន') => {
    if (!text || text.trim() === '') {
      return defaultValue
    }
    return text.trim()
  }

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    if (!dob) return ''
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age.toString()
  }

  // Fetch data functions
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students')
      const data = await response.json()
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchSchoolYears = useCallback(async () => {
    try {
      const response = await fetch('/api/school-years')
      const data = await response.json()
      setSchoolYears(data || [])
    } catch (error) {
      console.error('Error fetching school years:', error)
      toast({
        title: "Error",
        description: "Failed to fetch school years",
        variant: "destructive"
      })
    }
  }, [toast])

  // Form handling functions
  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGuardianChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      guardians: prev.guardians.map((guardian, i) => 
        i === index ? { ...guardian, [field]: value } : guardian
      )
    }))
  }

  const handleFamilyInfoChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      familyInfo: {
        ...prev.familyInfo,
        [field]: value
      }
    }))
  }

  const addGuardianForm = () => {
    setGuardianForms(prev => [...prev, prev.length])
    setFormData(prev => ({
      ...prev,
      guardians: [...prev.guardians, {
        firstName: '',
        lastName: '',
        relation: '',
        phone: '',
        occupation: '',
        income: '',
        childrenCount: '',
        houseNumber: '',
        village: '',
        district: '',
        province: '',
        birthDistrict: '',
        believeJesus: false,
        church: ''
      }]
    }))
  }

  const removeGuardianForm = (index: number) => {
    setGuardianForms(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      guardians: prev.guardians.filter((_, i) => i !== index)
    }))
  }

  const handleDateOfBirthChange = (dob: string) => {
    handleFormDataChange('dob', dob)
    const age = calculateAge(dob)
    handleFormDataChange('age', age)
  }

  // Student selection functions
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setIsNewStudent(student.id === 'new')
    
    if (student.id === 'new') {
      // Reset form for new student
      setFormData({
        lastName: '',
        firstName: '',
        gender: '',
        dob: '',
        age: '',
        studentId: '',
        class: '',
        schoolYear: '',
        registerToStudy: false,
        previousSchool: '',
        transferReason: '',
        studentHouseNumber: '',
        studentVillage: '',
        studentDistrict: '',
        studentProvince: '',
        studentBirthDistrict: '',
        phone: '',
        emergencyContact: '',
        health: '',
        vaccinated: false,
        religion: '',
        needsClothes: false,
        needsMaterials: false,
        needsTransport: false,
        guardians: [{
          firstName: '',
          lastName: '',
          relation: '',
          phone: '',
          occupation: '',
          income: '',
          childrenCount: '',
          houseNumber: '',
          village: '',
          district: '',
          province: '',
          birthDistrict: '',
          believeJesus: false,
          church: ''
        }],
        familyInfo: {
          livingWith: '',
          ownHouse: false,
          durationInKPC: '',
          livingCondition: '',
          organizationHelp: '',
          knowSchool: '',
          religion: '',
          churchName: '',
          canHelpSchool: false,
          helpAmount: '',
          helpFrequency: ''
        }
      })
      setGuardianForms([0])
    } else {
      // Load existing student data
      // This would need to be implemented based on your API
    }
  }

  // Form submission
  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Generate student ID if not provided
      if (!formData.studentId) {
        const nextId = await generateNextStudentId()
        handleFormDataChange('studentId', nextId)
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Student registered successfully"
        })
        setIsCompleted(true)
        fetchStudents()
      } else {
        throw new Error('Failed to register student')
      }
    } catch (error) {
      console.error('Error registering student:', error)
      toast({
        title: "Error",
        description: "Failed to register student",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // PDF generation
  const generatePDF = async () => {
    try {
      const studentData: StudentData = {
        ...formData,
        gradeLabel: getGradeLabel(formData.class)
      }

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `student-registration-${formData.studentId}-${formData.firstName}-${formData.lastName}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "PDF generated successfully"
        })
      } else {
        throw new Error('Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      })
    }
  }

  // Initialize data on mount
  useEffect(() => {
    fetchStudents()
    fetchSchoolYears()
  }, [fetchStudents, fetchSchoolYears])

  return {
    // State
    studentName,
    selectedStudent,
    activeTab,
    guardianForms,
    isSubmitting,
    isCompleted,
    showForm,
    isNewStudent,
    students,
    loading,
    schoolYears,
    formData,
    
    // Actions
    setStudentName,
    setSelectedStudent,
    setActiveTab,
    setGuardianForms,
    setIsSubmitting,
    setIsCompleted,
    setShowForm,
    setIsNewStudent,
    setFormData,
    
    // Functions
    getGradeLabel,
    generateNextStudentId,
    generateSimpleStudentId,
    formatKhmerText,
    calculateAge,
    handleFormDataChange,
    handleGuardianChange,
    handleFamilyInfoChange,
    addGuardianForm,
    removeGuardianForm,
    handleDateOfBirthChange,
    handleStudentSelect,
    handleSubmit,
    generatePDF,
    fetchStudents,
    fetchSchoolYears
  }
}
