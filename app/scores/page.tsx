'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  Target, 
  Medal,
  Plus,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Users,
  BookOpen,
  Calendar,
  GraduationCap
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"

export default function ScoresPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const recentScores = [
    { 
      id: 1,
      subject: "គណិតវិទ្យា", 
      score: 92, 
      date: "2023-11-15", 
      status: "ល្អណាស់",
      teacher: "លោកគ្រូ ស៊ុន សុខា",
      trend: "+3.2%"
    },
    { 
      id: 2,
      subject: "ភាសាអង់គ្លេស", 
      score: 88, 
      date: "2023-11-10", 
      status: "ល្អ",
      teacher: "លោកគ្រូ ជន ម៉ានី",
      trend: "+1.8%"
    },
    { 
      id: 3,
      subject: "រូបវិទ្យា", 
      score: 85, 
      date: "2023-11-08", 
      status: "មធ្យម",
      teacher: "លោកគ្រូ ចាន់ ដារា",
      trend: "-0.5%"
    },
    { 
      id: 4,
      subject: "ភាសាខ្មែរ", 
      score: 90, 
      date: "2023-11-05", 
      status: "ល្អណាស់",
      teacher: "លោកស្រី ពេជ្រ ចន្ទា",
      trend: "+2.1%"
    },
    { 
      id: 5,
      subject: "គីមីវិទ្យា", 
      score: 87, 
      date: "2023-11-03", 
      status: "ល្អ",
      teacher: "លោកស្រី ម៉ម សុភា",
      trend: "+1.5%"
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ល្អណាស់':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">ល្អណាស់</Badge>
      case 'ល្អ':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">ល្អ</Badge>
      case 'មធ្យម':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">មធ្យម</Badge>
      default:
        return <Badge>ធម្មតា</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredScores = recentScores.filter(score => {
    const matchesSearch = score.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         score.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || score.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-4 p-0">

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ពិន្ទុមធ្យម</CardTitle>
            <BarChart2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85.2</div>
            <p className="text-xs text-muted-foreground">ពិន្ទុមធ្យមទូទៅ</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+5.3% ពីខែមុន</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ការកែលម្អ</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+5.3%</div>
            <p className="text-xs text-muted-foreground">ពីខែមុន</p>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">កំពុងកើនឡើង</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សល្អបំផុត</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">សុខ ចន្ទា</div>
            <p className="text-xs text-muted-foreground">ពិន្ទុ: 98.5</p>
            <div className="flex items-center mt-2">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="text-xs text-yellow-500">ថ្នាក់ទី១</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ចំណាត់ថ្នាក់</CardTitle>
            <Medal className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">#3</div>
            <p className="text-xs text-muted-foreground">ក្នុងចំណោមសិស្ស 45 នាក់</p>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">ល្អណាស់</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>ពិន្ទុតាមមុខវិជ្ជា</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Bar Chart Placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>ការបែងចែកពិន្ទុ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Pie Chart Placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tracking */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>ការតាមដានគោលដៅ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">គោលដៅពិន្ទុមធ្យម</span>
                <span className="font-semibold text-blue-600">85.2/90</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(85.2/90)*100}%` }}
                ></div>
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+2.1% ពីខែមុន</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">គោលដៅភាសាអង់គ្លេស</span>
                <span className="font-semibold text-green-600">88/95</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(88/95)*100}%` }}
                ></div>
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+1.8% ពីខែមុន</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">គោលដៅគណិតវិទ្យា</span>
                <span className="font-semibold text-purple-600">92/95</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(92/95)*100}%` }}
                ></div>
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+3.2% ពីខែមុន</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scores and Semester Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-200">
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
                {filteredScores.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{item.subject}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${getScoreColor(item.score)}`}>
                        {item.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {item.teacher}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {item.date}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {item.trend.startsWith('+') ? (
                          <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${item.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {item.trend}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <span>ការប្រៀបធៀបពាក់កណ្តាលឆ្នាំ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="font-medium">ពាក់កណ្តាលឆ្នាំទី១</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ពិន្ទុមធ្យម: 82.5</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">82.5</p>
                  <p className="text-xs text-gray-500">ពិន្ទុ</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="font-medium">ពាក់កណ្តាលឆ្នាំទី២</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ពិន្ទុមធ្យម: 85.2</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">85.2</p>
                  <p className="text-xs text-green-500">+2.7</p>
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm font-medium">ការកែលម្អសរុប</p>
                <p className="text-2xl font-bold text-purple-600">+3.3%</p>
                <p className="text-xs text-gray-500">ពីពាក់កណ្តាលឆ្នាំទី១</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredScores.length === 0 && (
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-12 text-center">
            <div className="mx-auto max-w-md">
              <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">រកមិនឃើញពិន្ទុ</h3>
              <p className="text-gray-600 dark:text-gray-400">សូមព្យាយាមស្វែងរកជាមួយពាក្យផ្សេង</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
