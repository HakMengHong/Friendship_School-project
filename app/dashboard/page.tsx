"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Award, Settings, MessageSquare, Star, TrendingUp } from "lucide-react"
import { KhmerCalendar } from "@/components/calendar/khmer_calendar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  // State for announcements
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "ការប្រជុំគ្រូ", content: "មានការប្រជុំគ្រូនៅថ្ងៃសៅរ៍នេះ", date: "2023-05-15", author: "អ្នកគ្រប់គ្រង" },
    { id: 2, title: "ការប្រឡងឆមាស", content: "ការប្រឡងឆមាសនឹងចាប់ផ្តើមនៅខែក្រោយ", date: "2023-05-10", author: "អ្នកគ្រប់គ្រង" },
  ])

  // State for outstanding students
  const [outstandingStudents, setOutstandingStudents] = useState([
    { id: 1, name: "សុខ សំអាង", grade: "ថ្នាក់ទី១២ក", achievement: "ពិន្ទុខ្ពស់បំផុតក្នុងថ្នាក់", score: "A" },
    { id: 2, name: "ម៉ៅ សុធារី", grade: "ថ្នាក់ទី១១ខ", achievement: "ឈ្នះការប្រកួតអក្សរសាស្ត្រ", score: "A+" },
    { id: 3, name: "វ៉ាន់ សុផល", grade: "ថ្នាក់ទី១០គ", achievement: "សកម្មភាពស្ម័គ្រចិត្តល្អ", score: "A" },
  ])

  // Learning quality data by month
  const learningQualityData = [
    { month: 'មករា', quality: 75, averageScore: 68 },
    { month: 'កុម្ភៈ', quality: 82, averageScore: 72 },
    { month: 'មីនា', quality: 78, averageScore: 70 },
    { month: 'មេសា', quality: 85, averageScore: 75 },
    { month: 'ឧសភា', quality: 90, averageScore: 80 },
    { month: 'មិថុនា', quality: 88, averageScore: 78 },
  ]

  // Add new announcement
  const addAnnouncement = () => {
    const newAnnouncement = {
      id: announcements.length + 1,
      title: "ដំណឹងថ្មី",
      content: "ខ្លឹមសារដំណឹងថ្មី",
      date: new Date().toISOString().split('T')[0],
      author: "អ្នកគ្រប់គ្រង"
    }
    setAnnouncements([...announcements, newAnnouncement])
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">សូមស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រង</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សទាំងអស់</CardTitle>
            <Users className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% ពីខែមុន</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">គ្រូទាំងអស់</CardTitle>
            <Settings className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">គ្រូ</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សពូកែ</CardTitle>
            <Award className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">សិស្សពូកែក្នុងខែនេះ</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ដំណឹង</CardTitle>
            <MessageSquare className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">ដំណឹងសកម្ម</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Quality Chart */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              គុណភាពការសិក្សាតាមខែ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={learningQualityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'quality') return [`${value}%`, 'គុណភាព']
                      if (name === 'averageScore') return [value, 'ពិន្ទុមធ្យម']
                      return [value, name]
                    }}
                    labelFormatter={(label) => `ខែ${label}`}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === 'quality') return 'គុណភាព (%)'
                      if (value === 'averageScore') return 'ពិន្ទុមធ្យម'
                      return value
                    }}
                  />
                  <Bar dataKey="quality" fill="#0082c8" name="គុណភាព" />
                  <Bar dataKey="averageScore" fill="#00c49f" name="ពិន្ទុមធ្យម" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              ក្រាហ្វបង្ហាញពីគុណភាពការសិក្សានិងពិន្ទុមធ្យមរបស់សិស្សតាមខែ
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Announcements Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>ដំណឹងសំខាន់ៗ</CardTitle>
              <Button size="sm" onClick={addAnnouncement}>
                បន្ថែមដំណឹង
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{announcement.title}</h3>
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                    </div>
                    <p className="text-sm mt-2">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">- {announcement.author}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Khmer Calendar */}
        <div className="lg:col-span-1">
          <KhmerCalendar compact={true} />
        </div>
      </div>

      {/* Outstanding Students and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outstanding Students */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                សិស្សពូកែ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ឈ្មោះ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ថ្នាក់</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ចំនួនពិន្ទុ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">សមិទ្ធផល</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {outstandingStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.score}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.achievement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>សកម្មភាពថ្មីៗ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">បានបន្ថែមសិស្សថ្មី</p>
                    <p className="text-xs text-muted-foreground">២ នាទីមុន</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">បានកែប្រែពិន្ទុ</p>
                    <p className="text-xs text-muted-foreground">៥ នាទីមុន</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">បានបង្កើតថ្នាក់ថ្មី</p>
                    <p className="text-xs text-muted-foreground">១០ នាទីមុន</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
