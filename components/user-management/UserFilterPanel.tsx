'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search,
  Users,
  UserCheck,
  Shield,
  User as UserIcon,
  TrendingUp,
  RefreshCw,
  X,
  Loader2
} from "lucide-react"

interface UserFilterPanelProps {
  userStats: {
    totalUsers: number
    activeUsers: number
    adminUsers: number
    teacherUsers: number
    inactiveUsers: number
  }
  search: string
  loading?: boolean
  onSearchChange: (value: string) => void
  onRefresh: () => void
}

export function UserFilterPanel({
  userStats,
  search,
  loading = false,
  onSearchChange,
  onRefresh
}: UserFilterPanelProps) {
  const activeRate = userStats.totalUsers > 0 ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100) : 0

  return (
    <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                គ្រប់គ្រងអ្នកប្រើ
              </CardTitle>
              <p className="text-white/80 text-sm">
                User Management System
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {userStats.totalUsers} អ្នកប្រើ
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {activeRate}% សកម្ម
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="ស្វែងរកអ្នកប្រើ..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
              />
              {search && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                  onClick={() => onSearchChange("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={onRefresh}
                disabled={loading}
                variant="outline"
                className="h-12 border-2 border-purple-200 hover:border-purple-500"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                ផ្ទុកឡើងវិញ
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  អត្រាសកម្មភាព
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {activeRate}%
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg w-fit mx-auto mb-2">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{userStats.totalUsers}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">អ្នកប្រើសរុប</p>
            </div>
            
            {/* Active Users */}
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg w-fit mx-auto mb-2">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{userStats.activeUsers}</p>
              <p className="text-sm text-green-600 dark:text-green-400">អ្នកប្រើសកម្ម</p>
            </div>
            
            {/* Admin Users */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg w-fit mx-auto mb-2">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{userStats.adminUsers}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">អ្នកគ្រប់គ្រង</p>
            </div>
            
            {/* Teacher Users */}
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg w-fit mx-auto mb-2">
                <UserIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{userStats.teacherUsers}</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">គ្រូបង្រៀន</p>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Activity Status */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ស្ថានភាពសកម្មភាព
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">សកម្ម</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {userStats.activeUsers}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">អសកម្ម</span>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {userStats.inactiveUsers}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                ការបែងចែកតួនាទី
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 dark:text-blue-400">អ្នកគ្រប់គ្រង</span>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    {userStats.adminUsers}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 dark:text-blue-400">គ្រូបង្រៀន</span>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                    {userStats.teacherUsers}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3">
                ការវាយតម្លៃដំណើរការ
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 dark:text-green-400">អត្រាសកម្មភាព</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">{activeRate}%</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {userStats.activeUsers}/{userStats.totalUsers}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div 
                    className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${activeRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                សកម្មភាពរហ័ស (Quick Actions)
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                គ្រប់គ្រងអ្នកប្រើប្រាស់យ៉ាងមានប្រសិទ្ធភាព
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                ប្រព័ន្ធដំណើរការ
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
