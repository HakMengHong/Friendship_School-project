'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

interface SemesterComparison {
  semester: string
  average: number
  description: string
  bgColor: string
  textColor: string
}

interface SemesterComparisonProps {
  semesterComparison: SemesterComparison[]
  overallImprovement: {
    value: number
    percentage: number
    isPositive: boolean
  }
}

export function SemesterComparison({ 
  semesterComparison, 
  overallImprovement 
}: SemesterComparisonProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-purple-600" />
          <span>ការប្រៀបធៀបពាក់កណ្តាលឆ្នាំ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {semesterComparison.map((semester, index) => (
            <div key={index} className={`flex items-center justify-between p-3 ${semester.bgColor} rounded-lg`}>
              <div>
                <p className="font-medium">{semester.semester}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{semester.description}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${semester.textColor}`}>{semester.average}</p>
                <p className="text-xs text-gray-500">ពិន្ទុ</p>
              </div>
            </div>
          ))}
          
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm font-medium">ការកែលម្អសរុប</p>
            <p className={`text-2xl font-bold ${overallImprovement.isPositive ? 'text-purple-600' : 'text-red-600'}`}>
              {overallImprovement.isPositive ? '+' : ''}{overallImprovement.percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">ពីពាក់កណ្តាលឆ្នាំទី១</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
