'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { AttendanceManagementDashboard } from "@/components/attendance/AttendanceManagementDashboard"
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement"

export default function AttendanceRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AttendanceRefactoredContent />
    </RoleGuard>
  )
}

function AttendanceRefactoredContent() {
  const {
    // Filter states
    selectedDate,
    selectedSchoolYear,
    selectedCourse,
    selectedStatus,
    searchTerm,
    
    // Data states
    schoolYears,
    courses,
    attendances,
    
    // Loading states
    loading,
    loadingAttendances,
    
    // Computed values
    filteredCourses,
    filteredAttendances,
    attendanceStats,
    
    // Functions
    getGradeLabel,
    getStatusColor,
    getStatusIcon,
    handleSchoolYearChange,
    handleCourseChange,
    handleStatusChange,
    handleDateChange,
    handleSearchChange
  } = useAttendanceManagement()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          ការគ្រប់គ្រងវត្តមាន
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          តាមដាន និងគ្រប់គ្រងវត្តមានសិស្ស
        </p>
      </div>
      
      <AttendanceManagementDashboard
        // Filter states
        selectedDate={selectedDate}
        selectedSchoolYear={selectedSchoolYear}
        selectedCourse={selectedCourse}
        selectedStatus={selectedStatus}
        searchTerm={searchTerm}
        
        // Data states
        schoolYears={schoolYears}
        courses={courses}
        attendances={attendances}
        
        // Loading states
        loading={loading}
        loadingAttendances={loadingAttendances}
        
        // Computed values
        filteredCourses={filteredCourses}
        filteredAttendances={filteredAttendances}
        attendanceStats={attendanceStats}
        
        // Functions
        onDateChange={handleDateChange}
        onSchoolYearChange={handleSchoolYearChange}
        onCourseChange={handleCourseChange}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
        getGradeLabel={getGradeLabel}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />
    </div>
  )
}
