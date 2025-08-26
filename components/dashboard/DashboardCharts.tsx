'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Star,
  Target
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface DashboardChartsProps {
  learningQualityData: Array<{
    month: string
    quality: number
    averageScore: number
    attendance: number
  }>
  attendanceData: Array<{
    name: string
    value: number
    color: string
  }>
}

export function DashboardCharts({
  learningQualityData,
  attendanceData
}: DashboardChartsProps) {
  // Learning quality chart data
  const qualityChartData = learningQualityData.map(item => ({
    month: item.month,
    'គុណភាពការសិក្សា': item.quality,
    'ពិន្ទុមធ្យម': item.averageScore,
    'អត្រាវត្តមាន': item.attendance
  }))

  // Custom tooltip for learning quality chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Custom tooltip for attendance pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            សិស្ស: {payload[0].value} នាក់
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Learning Quality Chart */}
      <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">គុណភាពការសិក្សា</CardTitle>
                <p className="text-blue-100 text-sm">Learning Quality Trends</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                ខែ 6 ចុងក្រោយ
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="គុណភាពការសិក្សា" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  name="គុណភាពការសិក្សា"
                />
                <Bar 
                  dataKey="ពិន្ទុមធ្យម" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  name="ពិន្ទុមធ្យម"
                />
                <Bar 
                  dataKey="អត្រាវត្តមាន" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  name="អត្រាវត្តមាន"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Pie Chart */}
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">ការចែកចាយវត្តមាន</CardTitle>
                  <p className="text-green-100 text-sm">Attendance Distribution</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  ថ្ងៃនេះ
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {attendanceData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">ចំណុចវាស់វែងដំណើរការ</CardTitle>
                  <p className="text-purple-100 text-sm">Performance Metrics</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Quality Trend */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      គុណភាពការសិក្សា
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {learningQualityData[learningQualityData.length - 1]?.quality || 0}%
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      ខែបច្ចុប្បន្ន
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Score Trend */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      ពិន្ទុមធ្យម
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      {learningQualityData[learningQualityData.length - 1]?.averageScore || 0}%
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ខែបច្ចុប្បន្ន
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Trend */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      អត្រាវត្តមាន
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                      {learningQualityData[learningQualityData.length - 1]?.attendance || 0}%
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      ខែបច្ចុប្បន្ន
                    </p>
                  </div>
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ការវិភាគដំណើរការ (Trend Analysis)
                </h4>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p>• គុណភាពការសិក្សាកំពុងកើតឡើង</p>
                  <p>• ពិន្ទុមធ្យមមានការកែលម្អ</p>
                  <p>• អត្រាវត្តមានមានស្ថិរភាព</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
