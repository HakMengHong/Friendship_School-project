'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { StudentFilterPanel } from "@/components/student-info/StudentFilterPanel"
import { StudentTable } from "@/components/student-info/StudentTable"
import { useStudentInfo } from "@/hooks/useStudentInfo"

export default function StudentInfoRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <StudentInfoRefactoredContent />
    </RoleGuard>
  )
}

function StudentInfoRefactoredContent() {
  const {
    // State
    students,
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
  } = useStudentInfo()

  const handleViewDetails = (student: any) => {
    handleStudentSelect(student)
  }

  const handleEdit = (student: any) => {
    // Navigate to edit page or open edit modal
    console.log('Edit student:', student)
  }

  const handleDelete = (studentId: number) => {
    if (confirm('តើអ្នកប្រាកដជាចង់លុបសិស្សនេះមែនទេ?')) {
      handleDeleteStudent(studentId)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          ព័ត៌មានសិស្ស
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          គ្រប់គ្រងព័ត៌មានសិស្ស និងព័ត៌មានលម្អិត
        </p>
      </div>

      <div className="space-y-6">
        {/* Filter Panel */}
        <StudentFilterPanel
          schoolYears={schoolYears}
          classes={classes}
          selectedSchoolYear={selectedSchoolYear}
          selectedClass={selectedClass}
          searchTerm={searchTerm}
          studentStats={studentStats}
          onSchoolYearChange={setSelectedSchoolYear}
          onClassChange={setSelectedClass}
          onSearchChange={setSearchTerm}
          onExport={exportStudentData}
          onRefresh={fetchStudents}
          loading={loading}
        />

        {/* Student Table */}
        <StudentTable
          students={students}
          loading={loading}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 dark:text-red-400">
              កំហុស: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
