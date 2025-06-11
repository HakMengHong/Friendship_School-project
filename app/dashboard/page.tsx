"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Award, Settings } from "lucide-react"
import { KhmerCalendar } from "@/components/calendar/khmer_calendar"

export default function DashboardPage() {
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
            <CardTitle className="text-sm font-medium">មុខវិជ្ជា</CardTitle>
            <BookOpen className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 មុខវិជ្ជាថ្មី</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ពិន្ទុមធ្យម</CardTitle>
            <Award className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2</div>
            <p className="text-xs text-muted-foreground">+2.5% ពីខែមុន</p>
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
      </div>

      {/* Calendar and Recent Activity in the same row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Activity - takes 3 columns */}
        <div className="lg:col-span-3">
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
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">បានបញ្ចប់ការប្រលង</p>
                    <p className="text-xs text-muted-foreground">១៥ នាទីមុន</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">បានកែប្រែកាលវិភាគ</p>
                    <p className="text-xs text-muted-foreground">២០ នាទីមុន</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Khmer Calendar - takes 1 column */}
        <div className="lg:col-span-1">
            <KhmerCalendar compact={true} />
        </div>
      </div>
    </>
  )
}
