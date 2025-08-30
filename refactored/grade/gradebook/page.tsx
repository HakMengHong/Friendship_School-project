'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { Separator } from "@/components/ui/separator"
import { ReportTypesGrid } from "@/components/grade-book/ReportTypesGrid"
import { ReportGenerationModal } from "@/components/grade-book/ReportGenerationModal"
import { useGradeBook } from "@/hooks/useGradeBook"

export default function GradeBookRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <GradeBookRefactoredContent />
    </RoleGuard>
  )
}

function GradeBookRefactoredContent() {
  const {
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
  } = useGradeBook()

  return (
    <div>
      <Separator className="my-4" />   

      {/* Report Types Grid */}
      <ReportTypesGrid
        reportTypes={reportTypes}
        selectedType={reportType}
        onTypeSelect={handleReportTypeChange}
      />

      {/* Report Generation Modal */}
      <ReportGenerationModal
        isOpen={showReportModal}
        reportType={reportType}
        reportData={reportData}
        isGenerating={isGenerating}
        months={months}
        semesters={semesters}
        formatOptions={formatOptions}
        onClose={closeModal}
        onReportTypeChange={(type) => {
          // Update report type and open modal
          handleReportTypeChange(type)
        }}
        onReportDataChange={updateReportData}
        onSubmit={generateReport}
      />
    </div>
  )
}
