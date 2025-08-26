import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'

interface Student {
  studentId: number
  firstName: string
  lastName: string
  gender: string
  dob: string
  class: string
  phone?: string
  status: string
  schoolYear: string
  classId?: number
  createdAt?: string
  updatedAt?: string
  photo?: string
  registrationDate?: string
  scholarships?: any[]
  attendances?: any[]
  family?: any[]
  guardians?: any[]
}

interface Course {
  courseId: number
  grade: string
  section: string
  courseName: string
  schoolYear: {
    schoolYearCode: string
  }
}

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Enrollment {
  enrollmentId: number
  studentId: number
  courseId: number
  drop?: boolean
}

interface NewStudent {
  firstName: string
  lastName: string
  gender: string
  dob: string
  class: string
  phone: string
  schoolYear: string
  needsClothes: boolean
  needsMaterials: boolean
  needsTransport: boolean
  previousSchool: string
  registerToStudy: boolean
  studentBirthDistrict: string
  studentDistrict: string
  studentHouseNumber: string
  studentProvince: string
  studentVillage: string
  transferReason: string
  vaccinated: boolean
  religion: string
  health: string
  emergencyContact: string
}

export function useAddStudentClass() {
  // Loading states
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  
  // Filter states
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Selection states
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  
  // UI states
  const [showSuccess, setShowSuccess] = useState(false)
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)
  
  // Form state for new student
  const [newStudent, setNewStudent] = useState<NewStudent>({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    class: '',
    phone: '',
    schoolYear: '',
    needsClothes: false,
    needsMaterials: false,
    needsTransport: false,
    previousSchool: '',
    registerToStudy: true,
    studentBirthDistrict: '',
    studentDistrict: '',
    studentHouseNumber: '',
    studentProvince: '',
    studentVillage: '',
    transferReason: '',
    vaccinated: false,
    religion: '',
    health: '',
    emergencyContact: ''
  })

  // Initialize data on mount
  useEffect(() => {
    fetchAllData()
    fetchEnrollments()
  }, [])

  // Fetch all data function
  const fetchAllData = async () => {
    setDataLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchSchoolYears(),
        fetchCourses(),
        fetchStudents()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Fetch school years
  const fetchSchoolYears = async () => {
    try {
      const response = await fetch('/api/school-years')
      if (response.ok) {
        const data = await response.json()
        setSchoolYears(data)
        if (data.length > 0) {
          setSelectedSchoolYear(data[0].schoolYearCode)
        }
      } else {
        setError('មានបញ្ហាក្នុងការទាញយកឆ្នាំសិក្សា')
      }
    } catch (error) {
      console.error('Error fetching school years:', error)
      setError('មានបញ្ហាក្នុងការទាញយកឆ្នាំសិក្សា')
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      } else {
        setError('មានបញ្ហាក្នុងការទាញយកថ្នាក់')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('មានបញ្ហាក្នុងការទាញយកថ្នាក់')
    }
  }

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data || [])
      } else {
        setError('មានបញ្ហាក្នុងការទាញយកសិស្ស')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('មានបញ្ហាក្នុងការទាញយកសិស្ស')
    }
  }

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true)
      const response = await fetch('/api/enrollments')
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data || [])
      } else {
        console.error('Error fetching enrollments')
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setEnrollmentsLoading(false)
    }
  }

  // Check if student is already enrolled in selected course
  const isStudentEnrolled = (studentId: number) => {
    if (!selectedCourse) return false
    return enrollments.some(enrollment => 
      enrollment.studentId === studentId && 
      enrollment.courseId === parseInt(selectedCourse) &&
      !enrollment.drop
    )
  }

  // Filter students based on search term, school year, and class
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSchoolYear = !selectedSchoolYear || student.schoolYear === selectedSchoolYear
      const matchesClass = !selectedClass || selectedClass === 'all' || student.class === selectedClass
      return matchesSearch && matchesSchoolYear && matchesClass
    })
  }, [students, searchTerm, selectedSchoolYear, selectedClass])

  // Get unique classes from students
  const uniqueClasses = useMemo(() => {
    return [...new Set(students.map(student => student.class))].sort()
  }, [students])

  // Filter courses based on selected school year
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
      !selectedSchoolYear || course.schoolYear.schoolYearCode === selectedSchoolYear
    )
  }, [courses, selectedSchoolYear])

  // Get selected course name
  const getSelectedCourseName = () => {
    const course = courses.find(c => c.courseId.toString() === selectedCourse)
    return course ? `${course.courseName}${course.section}` : ''
  }

  // Handle student selection
  const handleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSchoolYear('')
    setSelectedClass('all')
    setSearchTerm('')
    setSelectedStudents([])
  }

  // Add students to class
  const handleAddStudentsToClass = async () => {
    if (selectedStudents.length === 0 || !selectedCourse) {
      toast.error('សូមជ្រើសរើសសិស្ស និងថ្នាក់')
      return
    }

    // Confirm action
    const confirmed = window.confirm(
      `តើអ្នកប្រាកដជាចង់បន្ថែមសិស្ស ${selectedStudents.length} នាក់ទៅក្នុងថ្នាក់ ${getSelectedCourseName()} ឬទេ?`
    )
    
    if (!confirmed) return

    setLoading(true)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          studentIds: selectedStudents
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setShowSuccess(true)
        setSelectedStudents([])
        setSelectedCourse('')
        toast.success(`បានបន្ថែមសិស្ស ${selectedStudents.length} នាក់ទៅក្នុងថ្នាក់ដោយជោគជ័យ`)
        
        // Refresh enrollments list
        fetchEnrollments()
        
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const errorData = await response.json()
        if (errorData.existingStudentIds) {
          toast.error(`សិស្សមួយចំនួនបានចុះឈ្មោះក្នុងថ្នាក់នេះរួចហើយ`)
        } else {
          toast.error(errorData.error || 'មានបញ្ហាក្នុងការបន្ថែមសិស្សទៅក្នុងថ្នាក់')
        }
      }
    } catch (error) {
      console.error('Error adding students to class:', error)
      toast.error('មានបញ្ហាក្នុងការបន្ថែមសិស្សទៅក្នុងថ្នាក់')
    } finally {
      setLoading(false)
    }
  }

  // Add new student
  const handleAddNewStudent = async () => {
    // Validate required fields
    if (!newStudent.firstName || !newStudent.firstName.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះខ្លី')
      return
    }
    
    if (!newStudent.lastName || !newStudent.lastName.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះពេញ')
      return
    }
    
    if (!newStudent.gender) {
      toast.error('សូមជ្រើសរើសភេទ')
      return
    }
    
    if (!newStudent.dob) {
      toast.error('សូមបញ្ចូលថ្ងៃខែឆ្នាំកំណើត')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      })

      if (response.ok) {
        toast.success('បានបន្ថែមសិស្សថ្មីដោយជោគជ័យ')
        setNewStudent({
          firstName: '',
          lastName: '',
          gender: '',
          dob: '',
          class: '',
          phone: '',
          schoolYear: '',
          needsClothes: false,
          needsMaterials: false,
          needsTransport: false,
          previousSchool: '',
          registerToStudy: true,
          studentBirthDistrict: '',
          studentDistrict: '',
          studentHouseNumber: '',
          studentProvince: '',
          studentVillage: '',
          transferReason: '',
          vaccinated: false,
          religion: '',
          health: '',
          emergencyContact: ''
        })
        setShowAddStudentForm(false)
        fetchStudents() // Refresh the students list
      } else {
        toast.error('មានបញ្ហាក្នុងការបន្ថែមសិស្ស')
      }
    } catch (error) {
      toast.error('មានបញ្ហាក្នុងការបន្ថែមសិស្ស')
    } finally {
      setLoading(false)
    }
  }

  // Update new student form
  const updateNewStudent = (field: keyof NewStudent, value: any) => {
    setNewStudent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Statistics
  const statistics = useMemo(() => {
    const totalStudents = students.length
    const availableStudents = filteredStudents.length
    const selectedCount = selectedStudents.length
    const enrolledCount = filteredStudents.filter(student => isStudentEnrolled(student.studentId)).length

    return {
      totalStudents,
      availableStudents,
      selectedCount,
      enrolledCount,
      availableForEnrollment: availableStudents - enrolledCount
    }
  }, [students, filteredStudents, selectedStudents, enrollments, selectedCourse])

  return {
    // Loading states
    loading,
    dataLoading,
    enrollmentsLoading,
    
    // Error state
    error,
    
    // Data
    students: filteredStudents,
    courses: filteredCourses,
    schoolYears,
    enrollments,
    uniqueClasses,
    
    // Filter states
    selectedSchoolYear,
    selectedCourse,
    selectedClass,
    searchTerm,
    selectedStudents,
    
    // UI states
    showSuccess,
    showAddStudentForm,
    newStudent,
    
    // Computed values
    statistics,
    getSelectedCourseName,
    
    // Actions
    setSelectedSchoolYear,
    setSelectedCourse,
    setSelectedClass,
    setSearchTerm,
    setSelectedStudents,
    setShowAddStudentForm,
    setNewStudent,
    
    // Functions
    fetchAllData,
    fetchStudents,
    fetchCourses,
    fetchSchoolYears,
    fetchEnrollments,
    handleStudentSelection,
    handleAddStudentsToClass,
    handleAddNewStudent,
    updateNewStudent,
    clearAllFilters,
    isStudentEnrolled
  }
}
