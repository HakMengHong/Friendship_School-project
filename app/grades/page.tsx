'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Award, 
  TrendingUp, 
  Users, 
  BookOpen, 
  BarChart3, 
  Trophy,
  Star,
  Target,
  Download,
  Filter,
  Search,
  Calendar,
  GraduationCap
} from "lucide-react"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export default function GradesPage() {
  const [selectedSemester, setSelectedSemester] = useState("ឆមាសទី ១")
  const [selectedYear, setSelectedYear] = useState("ឆ្នាំសិក្សា ២០២៤")

  const gradeData = [
    { subject: "គណិតវិទ្យា", average: 85.5, highest: 98, lowest: 65, students: 45, trend: "+2.1%", color: "#3b82f6" },
    { subject: "រូបវិទ្យា", average: 82.3, highest: 95, lowest: 58, students: 38, trend: "+1.8%", color: "#10b981" },
    { subject: "គីមីវិទ្យា", average: 88.1, highest: 99, lowest: 72, students: 42, trend: "+3.2%", color: "#f59e0b" },
    { subject: "ជីវវិទ្យា", average: 86.7, highest: 96, lowest: 68, students: 40, trend: "+1.5%", color: "#8b5cf6" },
    { subject: "ភាសាខ្មែរ", average: 89.2, highest: 97, lowest: 75, students: 50, trend: "+2.8%", color: "#ef4444" },
    { subject: "ភាសាអង់គ្លេស", average: 84.8, highest: 94, lowest: 62, students: 48, trend: "+1.9%", color: "#06b6d4" },
  ]

  const topStudents = [
    { name: "សុខ ចន្ទា", grade: 98.5, class: "ថ្នាក់ទី ១២A", subject: "គណិតវិទ្យា", rank: 1 },
    { name: "ម៉ម សុភា", grade: 97.8, class: "ថ្នាក់ទី ១២B", subject: "ភាសាខ្មែរ", rank: 2 },
    { name: "ចាន់ ដារា", grade: 96.2, class: "ថ្នាក់ទី ១២A", subject: "គីមីវិទ្យា", rank: 3 },
    { name: "ហេង វិចិត្រ", grade: 95.7, class: "ថ្នាក់ទី ១២C", subject: "ជីវវិទ្យា", rank: 4 },
    { name: "ពេជ្រ ម៉ានី", grade: 94.9, class: "ថ្នាក់ទី ១២B", subject: "រូបវិទ្យា", rank: 5 },
  ]

  // Chart data for grade distribution
  const gradeDistributionData = [
    { range: "90-100", count: 45, percentage: 17.1, color: "#10b981" },
    { range: "80-89", count: 89, percentage: 33.8, color: "#3b82f6" },
    { range: "70-79", count: 78, percentage: 29.7, color: "#f59e0b" },
    { range: "60-69", count: 35, percentage: 13.3, color: "#ef4444" },
    { range: "50-59", count: 16, percentage: 6.1, color: "#8b5cf6" },
  ]

  // Monthly trend data
  const monthlyTrendData = [
    { month: 'មករា', average: 82.5, target: 85 },
    { month: 'កុម្ភៈ', average: 84.2, target: 85 },
    { month: 'មីនា', average: 83.8, target: 85 },
    { month: 'មេសា', average: 86.1, target: 85 },
    { month: 'ឧសភា', average: 87.3, target: 85 },
    { month: 'មិថុនា', average: 88.5, target: 85 },
  ]

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">🥇 ទី១</Badge>
      case 2:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">🥈 ទី២</Badge>
      case 3:
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">🥉 ទី៣</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">ទី{rank}</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ពិន្ទុសិស្ស</h1>
          <p className="text-gray-600 dark:text-gray-400">តាមដានពិន្ទុនិងដំណើរការសិក្សារបស់សិស្ស</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            ត្រង
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            បញ្ជីឈ្មោះ
          </Button>
          <Button className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            របាយការណ៍
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ឆមាស</label>
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>ឆមាសទី ១</option>
                <option>ឆមាសទី ២</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>ឆ្នាំសិក្សា ២០២៤</option>
                <option>ឆ្នាំសិក្សា ២០២៣</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ស្វែងរក</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកសិស្ស..."
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ពិន្ទុមធ្យមទូទៅ</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">86.1</div>
            <p className="text-xs text-muted-foreground">+2.3% ពីឆមាសមុន</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">កំពុងកើនឡើង</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ពិន្ទុខ្ពស់បំផុត</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5</div>
            <p className="text-xs text-muted-foreground">សុខ ចន្ទា</p>
            <div className="flex items-center mt-2">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="text-xs text-yellow-500">ពិន្ទុល្អ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សប្រលង</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">263</div>
            <p className="text-xs text-muted-foreground">សិស្សទាំងអស់</p>
            <div className="flex items-center mt-2">
              <GraduationCap className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-500">ថ្នាក់ទី១២</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អត្រាជាប់</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">94.3%</div>
            <p className="text-xs text-muted-foreground">248/263 សិស្ស</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">ល្អជាងគោលដៅ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Chart */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-lg">ការចែកចាយពិន្ទុ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={gradeDistributionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'count') return [value, 'ចំនួនសិស្ស']
                      if (name === 'percentage') return [`${value}%`, 'ភាគរយ']
                      return [value, name]
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-lg">ដំណើរការពិន្ទុតាមខែ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'average') return [value, 'ពិន្ទុមធ្យម']
                      if (name === 'target') return [value, 'គោលដៅ']
                      return [value, name]
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Grades */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span className="text-lg">ពិន្ទុតាមមុខវិជ្ជា</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeData.map((subject, index) => (
                <div key={index} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{subject.subject}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">{subject.average}</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                        {subject.trend}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">ខ្ពស់បំផុត</span>
                      <span className="font-semibold text-green-600">{subject.highest}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">ទាបបំផុត</span>
                      <span className="font-semibold text-red-600">{subject.lowest}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">សិស្ស</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{subject.students} នាក់</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-lg">សិស្សល្អបំផុត</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-400 to-gray-600"
                          : index === 2
                          ? "bg-gradient-to-br from-orange-400 to-red-500"
                          : "bg-gradient-to-br from-blue-400 to-purple-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{student.class}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{student.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xl font-bold text-blue-600">{student.grade}</p>
                      {getRankBadge(student.rank)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ពិន្ទុ</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
