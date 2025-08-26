'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp } from "lucide-react"

interface Goal {
  name: string
  current: number
  target: number
  progress: number
  trend: string
  color: string
}

interface GradeGoalsTrackingProps {
  goals: Goal[]
}

export function GradeGoalsTracking({ goals }: GradeGoalsTrackingProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span>ការតាមដានគោលដៅ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="font-medium">{goal.name}</span>
                <span className="font-semibold text-blue-600">{goal.current}/{goal.target}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`bg-gradient-to-r ${goal.color} h-3 rounded-full transition-all duration-300`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{goal.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
