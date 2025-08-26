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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          ការចុះឈ្មោះសិស្ស
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          បំពេញព័ត៌មានសិស្សថ្មីជាមួយនឹងព័ត៌មានលម្អិត
        </p>
      </div>
      
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
