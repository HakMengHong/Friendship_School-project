'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { AttendanceDailyFilter } from "@/components/attendance-daily/AttendanceDailyFilter"
import { AttendanceDailyTable } from "@/components/attendance-daily/AttendanceDailyTable"
import { AttendanceDailyForm } from "@/components/attendance-daily/AttendanceDailyForm"
import { useAttendanceDaily } from "@/hooks/useAttendanceDaily"

export default function AttendanceDailyRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <AttendanceDailyRefactoredContent />
    </RoleGuard>
  )
}

function AttendanceDailyRefactoredContent() {
  const {
    // State
    formData,
    schoolYears,
    courses,
    students,
    attendances,
    loading,
    loadingStudents,
    loadingAttendances,
    selectedStudent,
    showAttendanceForm,
    editingAttendance,
    currentSession,
    searchTerm,
    currentUser,
    attendanceForm,
    statusOptions,
    sessionOptions,
    filteredCourses,
    statistics,
    isFormValid,
    
    // Actions
    setFormData,
    setSearchTerm,
    setSelectedStudent,
    setShowAttendanceForm,
    setEditingAttendance,
    setCurrentSession,
    setAttendanceForm,
    
    // Functions
    handleInputChange,
    handleSelectChange,
    handleStudentClick,
    handleAttendanceSubmit,
    handleDeleteAttendance,
    getStudentAttendance,
    getAttendanceStatus,
    getStatusBadge,
    fetchInitialData,
    fetchStudents,
    fetchAttendances
  } = useAttendanceDaily()

  const handleSchoolYearChange = (value: string) => {
    handleSelectChange('schoolYear', value)
  }

  const handleCourseChange = (value: string) => {
    handleSelectChange('course', value)
  }

  const handleDateChange = (value: string) => {
    handleInputChange({ target: { name: 'date', value } } as any)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleRefresh = () => {
    fetchInitialData()
  }

  const handleFormClose = () => {
    setShowAttendanceForm(false)
    setSelectedStudent(null)
    setEditingAttendance(null)
  }

  const handleFormChange = (field: string, value: string) => {
    setAttendanceForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isEditing = Boolean(editingAttendance && editingAttendance.attendanceId && editingAttendance.attendanceId > 0)

  return (
    <div className="container mx-auto py-8 px-4">


      <div className="space-y-6">
        {/* Filter Panel */}
        <AttendanceDailyFilter
          schoolYears={schoolYears}
          courses={filteredCourses}
          formData={formData}
          searchTerm={searchTerm}
          statistics={statistics}
          loading={loading}
          loadingStudents={loadingStudents}
          loadingAttendances={loadingAttendances}
          onSchoolYearChange={handleSchoolYearChange}
          onCourseChange={handleCourseChange}
          onDateChange={handleDateChange}
          onSearchChange={handleSearchChange}
          onRefresh={handleRefresh}
        />

        {/* Attendance Table */}
        <AttendanceDailyTable
          students={students}
          attendances={attendances}
          loading={loading}
          loadingStudents={loadingStudents}
          loadingAttendances={loadingAttendances}
          onStudentClick={handleStudentClick}
          onDeleteAttendance={handleDeleteAttendance}
          getAttendanceStatus={getAttendanceStatus}
          getStatusBadge={getStatusBadge}
        />

        {/* Attendance Form */}
        <AttendanceDailyForm
          showForm={showAttendanceForm}
          selectedStudent={selectedStudent}
          currentSession={currentSession}
          attendanceForm={attendanceForm}
          statusOptions={statusOptions}
          sessionOptions={sessionOptions}
          isEditing={isEditing}
          loading={loading}
          onClose={handleFormClose}
          onSubmit={handleAttendanceSubmit}
          onFormChange={handleFormChange}
        />

        {/* Form Validation Warning */}
        {!isFormValid && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              សូមជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់ដើម្បីមើលវត្តមាន
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
