'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  Target, 
  Medal,
  ArrowUp,
  Star,
  CheckCircle
} from "lucide-react"

interface Statistics {
  averageGrade: number
  improvement: string
  topStudent: string
  topStudentGrade: number
  ranking: number
  totalStudents: number
}

interface GradeStatisticsCardsProps {
  statistics: Statistics
}

export function GradeStatisticsCards({ statistics }: GradeStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Average Grade Card */}
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ពិន្ទុមធ្យម</CardTitle>
          <BarChart2 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{statistics.averageGrade}</div>
          <p className="text-xs text-muted-foreground">ពិន្ទុមធ្យមទូទៅ</p>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{statistics.improvement} ពីខែមុន</span>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Card */}
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ការកែលម្អ</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{statistics.improvement}</div>
          <p className="text-xs text-muted-foreground">ពីខែមុន</p>
          <div className="flex items-center mt-2">
            <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">កំពុងកើនឡើង</span>
          </div>
        </CardContent>
      </Card>

      {/* Top Student Card */}
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">សិស្សល្អបំផុត</CardTitle>
          <Award className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-purple-600">{statistics.topStudent}</div>
          <p className="text-xs text-muted-foreground">ពិន្ទុ: {statistics.topStudentGrade}</p>
          <div className="flex items-center mt-2">
            <Star className="h-3 w-3 text-yellow-500 mr-1" />
            <span className="text-xs text-yellow-500">ថ្នាក់ទី១</span>
          </div>
        </CardContent>
      </Card>

      {/* Ranking Card */}
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ចំណាត់ថ្នាក់</CardTitle>
          <Medal className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">#{statistics.ranking}</div>
          <p className="text-xs text-muted-foreground">ក្នុងចំណោមសិស្ស {statistics.totalStudents} នាក់</p>
          <div className="flex items-center mt-2">
            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">ល្អណាស់</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
