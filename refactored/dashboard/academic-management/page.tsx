'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { AcademicDashboard } from "@/components/academic/AcademicDashboard"

export default function AcademicManagementRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ការគ្រប់គ្រងផ្នែកអប់រំ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            គ្រប់គ្រងឆ្នាំសិក្សា មុខវិជ្ជា ថ្នាក់រៀន និងការចាត់តាំងគ្រូ
          </p>
        </div>
        
        <AcademicDashboard />
      </div>
    </RoleGuard>
  )
}
