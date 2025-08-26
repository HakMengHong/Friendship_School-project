'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar,
  Eye,
  Edit,
  ArrowUp,
  ArrowDown
} from "lucide-react"

interface Grade {
  id: number
  subject: string
  grade: number
  date: string
  status: string
  teacher: string
  trend: string
}

interface RecentGradesTableProps {
  grades: Grade[]
  getStatusBadge: (status: string) => string
  getGradeColor: (grade: number) => string
  getTrendInfo: (trend: string) => {
    icon: string
    color: string
    iconColor: string
  }
}

export function RecentGradesTable({ 
  grades, 
  getStatusBadge, 
  getGradeColor, 
  getTrendInfo 
}: RecentGradesTableProps) {
  if (grades.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">រកមិនឃើញពិន្ទុ</h3>
            <p className="text-gray-600 dark:text-gray-400">សូមព្យាយាមស្វែងរកជាមួយពាក្យផ្សេង</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>ពិន្ទុថ្មីៗ</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              មើលទាំងអស់
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-1" />
              កែប្រែ
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>មុខវិជ្ជា</TableHead>
              <TableHead>ពិន្ទុ</TableHead>
              <TableHead>គ្រូបង្រៀន</TableHead>
              <TableHead>កាលបរិច្ឆេទ</TableHead>
              <TableHead>ស្ថានភាព</TableHead>
              <TableHead>ដំណើរការ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((item) => {
              const trendInfo = getTrendInfo(item.trend)
              return (
                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{item.subject}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${getGradeColor(item.grade)}`}>
                      {item.grade}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {item.teacher}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {item.date}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {trendInfo.icon === 'ArrowUp' ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${trendInfo.color}`}>
                        {item.trend}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
