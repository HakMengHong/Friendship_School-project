"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, TrendingUp, Award } from "lucide-react"

export default function ScoresPage() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">ពិន្ទុសិស្ស</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-[#0082c8]" />
              <span>ពិន្ទុមធ្យម</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">85.2</div>
            <p className="text-sm text-gray-600">ពិន្ទុមធ្យមទូទៅ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-[#0082c8]" />
              <span>ការកែលម្អ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+5.3%</div>
            <p className="text-sm text-gray-600">ពីខែមុន</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-[#0082c8]" />
              <span>សិស្សល្អបំផុត</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">សុខ ចន្ទា</div>
            <p className="text-sm text-gray-600">ពិន្ទុ: 98.5</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
