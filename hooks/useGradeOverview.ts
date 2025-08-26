import { useState, useMemo } from 'react'

interface Grade {
  id: number
  subject: string
  grade: number
  date: string
  status: string
  teacher: string
  trend: string
}

interface Goal {
  name: string
  current: number
  target: number
  progress: number
  trend: string
  color: string
}

interface SemesterComparison {
  semester: string
  average: number
  description: string
  bgColor: string
  textColor: string
}

interface Statistics {
  averageGrade: number
  improvement: string
  topStudent: string
  topStudentGrade: number
  ranking: number
  totalStudents: number
}

export function useGradeOverview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock data for recent grades
  const recentGrades: Grade[] = [
    { 
      id: 1,
      subject: "គណិតវិទ្យា", 
      grade: 92, 
      date: "2023-11-15", 
      status: "ល្អណាស់",
      teacher: "លោកគ្រូ ស៊ុន សុខា",
      trend: "+3.2%"
    },
    { 
      id: 2,
      subject: "ភាសាអង់គ្លេស", 
      grade: 88, 
      date: "2023-11-10", 
      status: "ល្អ",
      teacher: "លោកគ្រូ ជន ម៉ានី",
      trend: "+1.8%"
    },
    { 
      id: 3,
      subject: "រូបវិទ្យា", 
      grade: 85, 
      date: "2023-11-08", 
      status: "មធ្យម",
      teacher: "លោកគ្រូ ចាន់ ដារា",
      trend: "-0.5%"
    },
    { 
      id: 4,
      subject: "ភាសាខ្មែរ", 
      grade: 90, 
      date: "2023-11-05", 
      status: "ល្អណាស់",
      teacher: "លោកស្រី ពេជ្រ ចន្ទា",
      trend: "+2.1%"
    },
    { 
      id: 5,
      subject: "គីមីវិទ្យា", 
      grade: 87, 
      date: "2023-11-03", 
      status: "ល្អ",
      teacher: "លោកស្រី ម៉ម សុភា",
      trend: "+1.5%"
    },
  ]

  // Goals data
  const goals: Goal[] = [
    {
      name: "គោលដៅពិន្ទុមធ្យម",
      current: 85.2,
      target: 90,
      progress: (85.2/90)*100,
      trend: "+2.1% ពីខែមុន",
      color: "from-blue-500 to-purple-500"
    },
    {
      name: "គោលដៅភាសាអង់គ្លេស",
      current: 88,
      target: 95,
      progress: (88/95)*100,
      trend: "+1.8% ពីខែមុន",
      color: "from-green-500 to-blue-500"
    },
    {
      name: "គោលដៅគណិតវិទ្យា",
      current: 92,
      target: 95,
      progress: (92/95)*100,
      trend: "+3.2% ពីខែមុន",
      color: "from-purple-500 to-pink-500"
    }
  ]

  // Semester comparison data
  const semesterComparison: SemesterComparison[] = [
    {
      semester: "ពាក់កណ្តាលឆ្នាំទី១",
      average: 82.5,
      description: "ពិន្ទុមធ្យម: 82.5",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600"
    },
    {
      semester: "ពាក់កណ្តាលឆ្នាំទី២",
      average: 85.2,
      description: "ពិន្ទុមធ្យម: 85.2",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600"
    }
  ]

  // Statistics data
  const statistics: Statistics = {
    averageGrade: 85.2,
    improvement: "+5.3%",
    topStudent: "សុខ ចន្ទា",
    topStudentGrade: 98.5,
    ranking: 3,
    totalStudents: 45
  }

  // Filter grades based on search term and filter
  const filteredGrades = useMemo(() => {
    return recentGrades.filter(grade => {
      const matchesSearch = grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.teacher.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = selectedFilter === 'all' || grade.status === selectedFilter
      return matchesSearch && matchesFilter
    })
  }, [recentGrades, searchTerm, selectedFilter])

  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ល្អណាស់':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'ល្អ':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'មធ្យម':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Get grade color based on grade value
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  // Get trend icon and color
  const getTrendInfo = (trend: string) => {
    const isPositive = trend.startsWith('+')
    return {
      icon: isPositive ? 'ArrowUp' : 'ArrowDown',
      color: isPositive ? 'text-green-500' : 'text-red-500',
      iconColor: isPositive ? 'text-green-500' : 'text-red-500'
    }
  }

  // Calculate overall improvement
  const overallImprovement = useMemo(() => {
    const firstSemester = semesterComparison[0]?.average || 0
    const secondSemester = semesterComparison[1]?.average || 0
    const improvement = secondSemester - firstSemester
    const percentage = firstSemester > 0 ? (improvement / firstSemester) * 100 : 0
    return {
      value: improvement,
      percentage: percentage,
      isPositive: improvement >= 0
    }
  }, [semesterComparison])

  // Get available status filters
  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(recentGrades.map(grade => grade.status))]
    return ['all', ...statuses]
  }, [recentGrades])

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedFilter('all')
  }

  return {
    // Data
    recentGrades,
    goals,
    semesterComparison,
    statistics,
    filteredGrades,
    availableStatuses,
    
    // Filter states
    searchTerm,
    selectedFilter,
    
    // Computed values
    overallImprovement,
    
    // Utility functions
    getStatusBadge,
    getGradeColor,
    getTrendInfo,
    
    // Actions
    handleSearchChange,
    handleFilterChange,
    clearFilters
  }
}
