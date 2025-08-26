'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { AddStudentClassFilter } from "@/components/add-student-class/AddStudentClassFilter"
import { StudentSelectionTable } from "@/components/add-student-class/StudentSelectionTable"
import { useAddStudentClass } from "@/hooks/useAddStudentClass"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  GraduationCap,
  Plus,
  CheckCircle,
  Loader2
} from "lucide-react"

export default function AddStudentClassRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AddStudentClassRefactoredContent />
    </RoleGuard>
  )
}

function AddStudentClassRefactoredContent() {
  const {
    // Loading states
    loading,
    dataLoading,
    enrollmentsLoading,
    
    // Error state
    error,
    
    // Data
    students,
    courses,
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
  } = useAddStudentClass()

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleRefresh = () => {
    fetchAllData()
  }

  const handleSelectAll = () => {
    const availableStudentIds = students
      .filter(student => !isStudentEnrolled(student.studentId))
      .map(student => student.studentId)
    setSelectedStudents(availableStudentIds)
  }

  const handleDeselectAll = () => {
    setSelectedStudents([])
  }

  return (
    <div className="container mx-auto py-8 px-4">


      <div className="space-y-6">
        {/* Filter Panel */}
        <AddStudentClassFilter
          schoolYears={schoolYears}
          courses={courses}
          uniqueClasses={uniqueClasses}
          selectedSchoolYear={selectedSchoolYear}
          selectedCourse={selectedCourse}
          selectedClass={selectedClass}
          searchTerm={searchTerm}
          statistics={statistics}
          loading={loading}
          dataLoading={dataLoading}
          onSchoolYearChange={setSelectedSchoolYear}
          onCourseChange={setSelectedCourse}
          onClassChange={setSelectedClass}
          onSearchChange={handleSearchChange}
          onClearFilters={clearAllFilters}
          onRefresh={handleRefresh}
        />

        {/* Success Message */}
        {showSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="text-sm font-semibold text-green-800">
                  ជោគជ័យ!
                </h4>
                <p className="text-sm text-green-700">
                  សិស្សត្រូវបានបន្ថែមទៅក្នុងថ្នាក់ដោយជោគជ័យ
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Student Selection Table */}
        <StudentSelectionTable
          students={students}
          selectedStudents={selectedStudents}
          loading={loading}
          dataLoading={dataLoading}
          onStudentSelection={handleStudentSelection}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          isStudentEnrolled={isStudentEnrolled}
          getSelectedCourseName={getSelectedCourseName}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-sm font-medium text-indigo-700">
                សិស្សដែលបានជ្រើសរើស
              </p>
              <p className="text-2xl font-bold text-indigo-900">
                {selectedStudents.length}
              </p>
            </div>
            {selectedCourse && (
              <div className="text-center">
                <p className="text-sm font-medium text-purple-700">
                  ថ្នាក់គោលដៅ
                </p>
                <p className="text-lg font-semibold text-purple-900">
                  {getSelectedCourseName()}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowAddStudentForm(true)}
              variant="outline"
              className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              បន្ថែមសិស្សថ្មី
            </Button>
            
            <Button
              onClick={handleAddStudentsToClass}
              disabled={selectedStudents.length === 0 || !selectedCourse || loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  កំពុងបន្ថែម...
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  បន្ថែមទៅក្នុងថ្នាក់
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 dark:text-red-400">
              កំហុស: {error}
            </p>
          </div>
        )}

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">សិស្សសរុប</p>
                <p className="text-xl font-bold text-blue-900">{statistics.totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">អាចជ្រើសរើស</p>
                <p className="text-xl font-bold text-green-900">{statistics.availableStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">ជ្រើសរើស</p>
                <p className="text-xl font-bold text-purple-900">{statistics.selectedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">ចុះឈ្មោះរួច</p>
                <p className="text-xl font-bold text-orange-900">{statistics.enrolledCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
