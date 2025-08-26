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
