'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { GradeStatisticsCards } from "@/components/grade-overview/GradeStatisticsCards"
import { GradeGoalsTracking } from "@/components/grade-overview/GradeGoalsTracking"
import { RecentGradesTable } from "@/components/grade-overview/RecentGradesTable"
import { SemesterComparison } from "@/components/grade-overview/SemesterComparison"
import { useGradeOverview } from "@/hooks/useGradeOverview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart2,
  Target,
  BookOpen
} from "lucide-react"

export default function GradeRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <GradeRefactoredContent />
    </RoleGuard>
  )
}

function GradeRefactoredContent() {
  const {
    // Data
    recentGrades,
    goals,
    semesterComparison,
    statistics,
    filteredGrades,
    availableStatuses,
    
    // Filter states
    searchTerm,
    selectedFilter,
    
    // Computed values
    overallImprovement,
    
    // Utility functions
    getStatusBadge,
    getGradeColor,
    getTrendInfo,
    
    // Actions
    handleSearchChange,
    handleFilterChange,
    clearFilters
  } = useGradeOverview()

  return (
    <div className="space-y-6 p-6">
      {/* Top Stats Cards */}
      <GradeStatisticsCards statistics={statistics} />

      {/* Subject Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>ពិន្ទុតាមមុខវិជ្ជា</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Bar Chart Placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>ការបែងចែកពិន្ទុ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Pie Chart Placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tracking */}
      <GradeGoalsTracking goals={goals} />

      {/* Recent Grades and Semester Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentGradesTable
            grades={filteredGrades}
            getStatusBadge={getStatusBadge}
            getGradeColor={getGradeColor}
            getTrendInfo={getTrendInfo}
          />
        </div>

        <SemesterComparison
          semesterComparison={semesterComparison}
          overallImprovement={overallImprovement}
        />
      </div>
    </div>
  )
}
