"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, Calendar, BarChart3, Users } from "lucide-react"

export default function AttendancePage() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">វត្តមានសិស្ស</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">វត្តមានថ្ងៃនេះ</CardTitle>
            <UserCheck className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95.2%</div>
            <p className="text-xs text-muted-foreground">1,176/1,234 សិស្ស</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">វត្តមានខែនេះ</CardTitle>
            <Calendar className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.8%</div>
            <p className="text-xs text-muted-foreground">មធ្យមភាគ</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមាន</CardTitle>
            <BarChart3 className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-muted-foreground">សិស្សអវត្តមាន</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ថ្នាក់រៀន</CardTitle>
            <Users className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">ថ្នាក់ទាំងអស់</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>ទិដ្ឋភាពវត្តមានទូទៅ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">ថ្នាក់ទី ៧A</p>
                <p className="text-sm text-gray-600">៤៥ សិស្ស</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">១០០%</p>
                <p className="text-xs text-gray-500">៤៥/៤៥ សិស្ស</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">ថ្នាក់ទី ៨B</p>
                <p className="text-sm text-gray-600">៤២ សិស្ស</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">៩៧.៦%</p>
                <p className="text-xs text-gray-500">៤១/៤២ សិស្ស</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">ថ្នាក់ទី ៩C</p>
                <p className="text-sm text-gray-600">៣៨ សិស្ស</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-600">៨៩.៥%</p>
                <p className="text-xs text-gray-500">៣៤/៣៨ សិស្ស</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
