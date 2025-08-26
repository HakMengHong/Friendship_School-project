'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { AcademicDashboard } from "@/components/academic/AcademicDashboard"

export default function AcademicManagementRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto py-8 px-4">

        
        <AcademicDashboard />
      </div>
    </RoleGuard>
  )
}
