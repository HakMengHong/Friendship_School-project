'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { DashboardManagementDashboard } from "@/components/dashboard/DashboardManagementDashboard"
import { useDashboardManagement } from "@/hooks/useDashboardManagement"

export default function DashboardRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardRefactoredContent />
    </RoleGuard>
  )
}

function DashboardRefactoredContent() {
  const {
    // State
    students,
    users,
    courses,
    attendances,
    announcements,
    outstandingStudents,
    recentActivities,
    loading,
    error,
    showAddForm,
    newAnnouncement,
    
    // Computed values
    dashboardStats,
    learningQualityData,
    attendanceData,
    
    // Actions
    setShowAddForm,
    setNewAnnouncement,
    
    // Functions
    getGradeLabel,
    handleAddAnnouncement,
    handleDeleteAnnouncement,
    fetchDashboardData
  } = useDashboardManagement()

  const handleNewAnnouncementChange = (field: string, value: string) => {
    setNewAnnouncement(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          ផ្ទាំងគ្រប់គ្រង
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធគ្រប់គ្រងសាលា
        </p>
      </div>
      
      <DashboardManagementDashboard
        // Statistics
        dashboardStats={dashboardStats}
        
        // Data
        announcements={announcements}
        outstandingStudents={outstandingStudents}
        recentActivities={recentActivities}
        learningQualityData={learningQualityData}
        attendanceData={attendanceData}
        
        // Loading states
        loading={loading}
        
        // Form states
        showAddForm={showAddForm}
        newAnnouncement={newAnnouncement}
        
        // Functions
        onShowAddForm={setShowAddForm}
        onNewAnnouncementChange={handleNewAnnouncementChange}
        onAddAnnouncement={handleAddAnnouncement}
        onDeleteAnnouncement={handleDeleteAnnouncement}
      />
    </div>
  )
}
