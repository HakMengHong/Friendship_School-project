'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { StudentFormTabs } from "@/components/student/StudentFormTabs"
import { useStudentRegistration } from "@/hooks/useStudentRegistration"

export default function RegisterStudentRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <RegisterStudentRefactoredContent />
    </RoleGuard>
  )
}

function RegisterStudentRefactoredContent() {
  const {
    // State
    activeTab,
    formData,
    schoolYears,
    guardianForms,
    isSubmitting,
    isCompleted,
    
    // Actions
    setActiveTab,
    
    // Functions
    handleFormDataChange,
    handleGuardianChange,
    handleFamilyInfoChange,
    addGuardianForm,
    removeGuardianForm,
    handleDateOfBirthChange,
    handleSubmit,
    generatePDF,
    getGradeLabel
  } = useStudentRegistration()

  return (
    <div className="container mx-auto py-8 px-4">

      
      <StudentFormTabs
        activeTab={activeTab}
        formData={formData}
        schoolYears={schoolYears}
        guardianForms={guardianForms}
        isSubmitting={isSubmitting}
        isCompleted={isCompleted}
        onSetActiveTab={setActiveTab}
        onFormDataChange={handleFormDataChange}
        onGuardianChange={handleGuardianChange}
        onFamilyInfoChange={handleFamilyInfoChange}
        onAddGuardianForm={addGuardianForm}
        onRemoveGuardianForm={removeGuardianForm}
        onDateOfBirthChange={handleDateOfBirthChange}
        onSubmit={handleSubmit}
        onGeneratePDF={generatePDF}
        getGradeLabel={getGradeLabel}
      />
    </div>
  )
}
