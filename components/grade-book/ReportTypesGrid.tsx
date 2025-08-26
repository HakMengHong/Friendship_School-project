'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, BarChart3, TrendingUp } from "lucide-react"

interface ReportType {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

interface ReportTypesGridProps {
  reportTypes: ReportType[]
  selectedType: string
  onTypeSelect: (typeId: string) => void
}

export function ReportTypesGrid({ 
  reportTypes, 
  selectedType, 
  onTypeSelect 
}: ReportTypesGridProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calendar':
        return Calendar
      case 'BarChart3':
        return BarChart3
      case 'TrendingUp':
        return TrendingUp
      default:
        return Calendar
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {reportTypes.map((type) => {
        const IconComponent = getIcon(type.icon)
        return (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              selectedType === type.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${type.color} text-white`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-wide">{type.title}</h3>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
