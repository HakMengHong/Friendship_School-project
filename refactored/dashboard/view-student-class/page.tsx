'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { ViewStudentClassFilter } from "@/components/view-student-class/ViewStudentClassFilter"
import { ViewStudentClassTable } from "@/components/view-student-class/ViewStudentClassTable"
import { useViewStudentClass } from "@/hooks/useViewStudentClass"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Eye,
  AlertCircle,
  Loader2,
  Trash2
} from "lucide-react"

export default function ViewStudentClassRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <ViewStudentClassRefactoredContent />
    </RoleGuard>
  )
}

function ViewStudentClassRefactoredContent() {
  const {
    // Loading states
    loading,
    dataLoading,
    
    // Error state
    error,
    
    // Data
    students,
    courses,
    schoolYears,
    enrollments,
    teachers,
    filteredStudentsBySearch,
    
    // Filter states
    selectedSchoolYear,
    selectedCourse,
    searchTerm,
    showFilters,
    autoShowStudents,
    
    // Remove student states
    removingStudent,
    showRemoveConfirm,
    
    // Computed values
    statistics,
    courseDistribution,
    schoolYearDistribution,
    getCourseName,
    getSelectedCourseDetails,
    getTeacherName,
    shouldShowStudents,
    
    // Actions
    setSelectedSchoolYear,
    setSelectedCourse,
    setSearchTerm,
    setShowFilters,
    setAutoShowStudents,
    setRemovingStudent,
    setShowRemoveConfirm,
    
    // Functions
    fetchAllData,
    fetchSchoolYears,
    fetchCourses,
    fetchStudents,
    fetchEnrollments,
    fetchTeachers,
    removeStudentFromCourse,
    handleRemoveStudent,
    clearAllFilters,
    handleStudentSearch,
    handleSchoolYearChange,
    handleCourseChange
  } = useViewStudentClass()

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleRefresh = () => {
    fetchAllData()
  }

  const handleToggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleConfirmRemove = () => {
    if (removingStudent) {
      removeStudentFromCourse(removingStudent)
    }
  }

  const handleCancelRemove = () => {
    setShowRemoveConfirm(false)
    setRemovingStudent(null)
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">មានបញ្ហា:</span>
            <span>{error}</span>
          </div>
          <Button 
            onClick={fetchAllData} 
            variant="outline" 
            className="mt-2"
          >
            ព្យាយាមម្តងទៀត
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          មើលសិស្សក្នុងថ្នាក់
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          មើល និងគ្រប់គ្រងសិស្សក្នុងថ្នាក់ដែលបានជ្រើសរើស
        </p>
      </div>

      <div className="space-y-6">
        {/* Filter Panel */}
        <ViewStudentClassFilter
          schoolYears={schoolYears}
          courses={courses}
          selectedSchoolYear={selectedSchoolYear}
          selectedCourse={selectedCourse}
          searchTerm={searchTerm}
          showFilters={showFilters}
          statistics={statistics}
          courseDistribution={courseDistribution}
          schoolYearDistribution={schoolYearDistribution}
          loading={loading}
          dataLoading={dataLoading}
          onSchoolYearChange={handleSchoolYearChange}
          onCourseChange={handleCourseChange}
          onSearchChange={handleSearchChange}
          onToggleFilters={handleToggleFilters}
          onClearFilters={clearAllFilters}
          onRefresh={handleRefresh}
        />

        {/* Student Table */}
        <ViewStudentClassTable
          enrollments={filteredStudentsBySearch}
          loading={loading}
          dataLoading={dataLoading}
          autoShowStudents={autoShowStudents}
          onRemoveStudent={handleRemoveStudent}
          getCourseName={getCourseName}
          getTeacherName={getTeacherName}
        />

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">សិស្សសរុប</p>
                <p className="text-xl font-bold text-blue-900">{statistics.totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">ថ្នាក់សរុប</p>
                <p className="text-xl font-bold text-purple-900">{statistics.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">ចុះឈ្មោះសកម្ម</p>
                <p className="text-xl font-bold text-green-900">{statistics.activeEnrollments}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Eye className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-teal-700">បង្ហាញ</p>
                <p className="text-xl font-bold text-teal-900">{statistics.displayedStudents}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Student Confirmation Dialog */}
      <Dialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>ដកសិស្សចេញពីថ្នាក់</span>
            </DialogTitle>
            <DialogDescription>
              តើអ្នកប្រាកដជាចង់ដក {removingStudent?.student.firstName} {removingStudent?.student.lastName} ចេញពីថ្នាក់ {removingStudent ? getCourseName(removingStudent.courseId) : ''} ឬទេ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelRemove}
              disabled={loading}
            >
              បោះបង់
            </Button>
            <Button
              onClick={handleConfirmRemove}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  កំពុងដក...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  ដកចេញ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
