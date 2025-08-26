'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Star
} from "lucide-react"
import { KhmerCalendar } from "@/components/calendar/khmer_calendar"

import { DashboardStatistics } from './DashboardStatistics'
import { DashboardCharts } from './DashboardCharts'
import { DashboardActivities } from './DashboardActivities'

interface DashboardManagementDashboardProps {
  // Statistics
  dashboardStats: {
    totalStudents: number
    totalUsers: number
    totalCourses: number
    totalAttendances: number
    presentAttendances: number
    absentAttendances: number
    lateAttendances: number
    excusedAttendances: number
    attendanceRate: number
  }
  
  // Data
  announcements: any[]
  outstandingStudents: any[]
  recentActivities: any[]
  learningQualityData: any[]
  attendanceData: any[]
  
  // Loading states
  loading: boolean
  
  // Form states
  showAddForm: boolean
  newAnnouncement: {
    title: string
    content: string
    author: string
    date: string
    priority: 'high' | 'medium' | 'low'
  }
  
  // Functions
  onShowAddForm: (show: boolean) => void
  onNewAnnouncementChange: (field: string, value: string) => void
  onAddAnnouncement: () => void
  onDeleteAnnouncement: (id: string) => void
}

export function DashboardManagementDashboard({
  // Statistics
  dashboardStats,
  
  // Data
  announcements,
  outstandingStudents,
  recentActivities,
  learningQualityData,
  attendanceData,
  
  // Loading states
  loading,
  
  // Form states
  showAddForm,
  newAnnouncement,
  
  // Functions
  onShowAddForm,
  onNewAnnouncementChange,
  onAddAnnouncement,
  onDeleteAnnouncement
}: DashboardManagementDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ផ្ទាំងគ្រប់គ្រង</CardTitle>
                <p className="text-blue-100 text-sm">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                ថ្ងៃ {new Date().toLocaleDateString('km-KH')}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Section */}
      <DashboardStatistics
        dashboardStats={dashboardStats}
        loading={loading}
      />

      {/* Charts Section */}
      <DashboardCharts
        learningQualityData={learningQualityData}
        attendanceData={attendanceData}
      />

      {/* Activities Section */}
      <DashboardActivities
        announcements={announcements}
        outstandingStudents={outstandingStudents}
        recentActivities={recentActivities}
        showAddForm={showAddForm}
        newAnnouncement={newAnnouncement}
        onShowAddForm={onShowAddForm}
        onNewAnnouncementChange={onNewAnnouncementChange}
        onAddAnnouncement={onAddAnnouncement}
        onDeleteAnnouncement={onDeleteAnnouncement}
      />

      {/* Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Khmer Calendar */}
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ប្រតិទិនខ្មែរ</CardTitle>
                <p className="text-purple-100 text-sm">Khmer Calendar</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <KhmerCalendar />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">សកម្មភាពរហ័ស</CardTitle>
                <p className="text-indigo-100 text-sm">Quick Actions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                        ការគ្រប់គ្រងសិស្ស
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        បន្ថែម កែប្រែ សិស្ស
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-300">
                        ការគ្រប់គ្រងពិន្ទុ
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        បញ្ចូល កែប្រែ ពិន្ទុ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                        ការគ្រប់គ្រងវត្តមាន
                      </h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        តាមដាន វត្តមាន
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">
                        របាយការណ៍
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        បង្កើត របាយការណ៍
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  ស្ថានភាពប្រព័ន្ធ (System Status)
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">ប្រព័ន្ធដំណើរការ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">មូលដ្ឋានទិន្នន័យ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">ការតភ្ជាប់</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">សុវត្ថិភាព</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Footer */}
      <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-500 rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  សង្ខេបផ្ទាំងគ្រប់គ្រង (Dashboard Summary)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ថ្ងៃ {new Date().toLocaleDateString('km-KH')} - ម៉ោង {new Date().toLocaleTimeString('km-KH')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">សិស្សសរុប</p>
                <p className="font-bold text-blue-600">{dashboardStats.totalStudents}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ថ្នាក់សិក្សា</p>
                <p className="font-bold text-purple-600">{dashboardStats.totalCourses}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">អត្រាវត្តមាន</p>
                <p className="font-bold text-green-600">{dashboardStats.attendanceRate}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
