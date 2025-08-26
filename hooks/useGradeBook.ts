import { useState, useMemo } from 'react'

interface ReportData {
  academicYear: string
  month: string
  year: string
  semester: string
  class: string
  startDate: string
  endDate: string
  sortByRank: boolean
  format: string
  includeDetails: boolean
  includeAllClasses: boolean
}

interface ReportType {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

interface RecentReport {
  id: number
  title: string
  type: string
  date: string
  status: string
  format: string
}

export function useGradeBook() {
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState("monthly")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({
    academicYear: "",
    month: "",
    year: "",
    semester: "",
    class: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    sortByRank: false,
    format: "pdf",
    includeDetails: true,
    includeAllClasses: false
  })

  // Report types configuration
  const reportTypes: ReportType[] = [
    {
      id: "monthly",
      title: "របាយការណ៍ប្រចាំខែ",
      description: "របាយការណ៍សៀវភៅតាមដានប្រចាំខែ",
      icon: "Calendar",
      color: "bg-blue-500"
    },
    {
      id: "semester", 
      title: "របាយការណ៍ប្រចាំឆមាស",
      description: "របាយការណ៍សៀវភៅតាមដានប្រចាំឆមាស",
      icon: "BarChart3",
      color: "bg-green-500"
    },
    {
      id: "yearly",
      title: "របាយការណ៍ប្រចាំឆ្នាំ", 
      description: "របាយការណ៍សៀវភៅតាមដានប្រចាំឆ្នាំ",
      icon: "TrendingUp",
      color: "bg-purple-500"
    }
  ]

  // Recent reports data
  const recentReports: RecentReport[] = [
    {
      id: 1,
      title: "របាយការណ៍សៀវភៅតាមដានខែមករា 2024",
      type: "monthly",
      date: "2024-01-31",
      status: "completed",
      format: "PDF"
    },
    {
      id: 2,
      title: "របាយការណ៍សៀវភៅតាមដានឆមាសទី១ 2023-2024",
      type: "semester", 
      date: "2024-02-15",
      status: "completed",
      format: "Excel"
    },
    {
      id: 3,
      title: "របាយការណ៍សៀវភៅតាមដានឆ្នាំ 2023-2024",
      type: "yearly",
      date: "2024-06-30", 
      status: "pending",
      format: "PDF"
    }
  ]

  // Months data
  const months = [
    { value: "1", label: "មករា" },
    { value: "2", label: "កុម្ភៈ" },
    { value: "3", label: "មីនា" },
    { value: "4", label: "មេសា" },
    { value: "5", label: "ឧសភា" },
    { value: "6", label: "មិថុនា" },
    { value: "7", label: "កក្កដា" },
    { value: "8", label: "សីហា" },
    { value: "9", label: "កញ្ញា" },
    { value: "10", label: "តុលា" },
    { value: "11", label: "វិច្ឆិកា" },
    { value: "12", label: "ធ្នូ" }
  ]

  // Semesters data
  const semesters = [
    { value: "1", label: "ឆមាសទី១" },
    { value: "2", label: "ឆមាសទី២" }
  ]

  // Format options
  const formatOptions = [
    { value: "pdf", label: "PDF", icon: "FileText" },
    { value: "excel", label: "Excel", icon: "BarChart3" }
  ]

  // Get current selected report type
  const selectedReportType = useMemo(() => {
    return reportTypes.find(type => type.id === reportType)
  }, [reportType, reportTypes])

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Get format badge styling
  const getFormatBadge = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'excel':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Validate form data
  const validateForm = (): boolean => {
    if (!reportData.academicYear) return false
    
    switch (reportType) {
      case 'monthly':
        return !!(reportData.month && reportData.year)
      case 'semester':
        return !!(reportData.semester && reportData.startDate && reportData.endDate)
      case 'yearly':
        return true
      default:
        return false
    }
  }

  // Generate report
  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      console.error("Form validation failed")
      return
    }
    
    setIsGenerating(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Generating gradebook report:", { reportType, reportData })
      
      // Here you would make the actual API call
      // const response = await fetch('/api/gradebook/generate-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ reportType, reportData })
      // })
      
      // if (!response.ok) throw new Error('Failed to generate report')
      
      // Handle success
      console.log("Report generated successfully")
      
    } catch (error) {
      console.error("Error generating report:", error)
      // Handle error (show toast notification, etc.)
    } finally {
      setIsGenerating(false)
      setShowReportModal(false)
    }
  }

  // Update report data
  const updateReportData = (field: keyof ReportData, value: string | boolean) => {
    setReportData(prev => ({ ...prev, [field]: value }))
  }

  // Handle report type change
  const handleReportTypeChange = (newType: string) => {
    setReportType(newType)
    setShowReportModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowReportModal(false)
  }

  // Reset form
  const resetForm = () => {
    setReportData({
      academicYear: "",
      month: "",
      year: "",
      semester: "",
      class: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      sortByRank: false,
      format: "pdf",
      includeDetails: true,
      includeAllClasses: false
    })
  }

  return {
    // State
    showReportModal,
    reportType,
    isGenerating,
    reportData,
    
    // Data
    reportTypes,
    recentReports,
    months,
    semesters,
    formatOptions,
    
    // Computed values
    selectedReportType,
    
    // Utility functions
    getStatusBadge,
    getFormatBadge,
    validateForm,
    
    // Actions
    generateReport,
    updateReportData,
    handleReportTypeChange,
    closeModal,
    resetForm
  }
}
