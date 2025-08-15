"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Printer, 
  FileText, 
  Calendar,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle,
  X
} from "lucide-react"
import { useState } from "react"

export default function ScoreReportPage() {
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState("monthly")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState({
    academicYear: "",
    month: "",
    year: "",
    semester: "",
    class: "",
    sortByRank: false,
    format: "pdf",
    includeDetails: true,
    includeAllClasses: false
  })

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log("Generating score report:", { reportType, reportData })
    setIsGenerating(false)
    setShowReportModal(false)
  }

  const reportTypes = [
    {
      id: "monthly",
      title: "របាយការណ៍ប្រចាំខែ",
      description: "របាយការណ៍ពិន្ទុសិស្សប្រចាំខែ",
      icon: Calendar,
      color: "bg-blue-500"
    },
    {
      id: "semester", 
      title: "របាយការណ៍ប្រចាំឆមាស",
      description: "របាយការណ៍ពិន្ទុសិស្សប្រចាំឆមាស",
      icon: BarChart3,
      color: "bg-green-500"
    },
    {
      id: "yearly",
      title: "របាយការណ៍ប្រចាំឆ្នាំ", 
      description: "របាយការណ៍ពិន្ទុសិស្សប្រចាំឆ្នាំ",
      icon: TrendingUp,
      color: "bg-purple-500"
    }
  ]

  const recentReports = [
    {
      id: 1,
      title: "របាយការណ៍ពិន្ទុខែមករា 2024",
      type: "monthly",
      date: "2024-01-31",
      status: "completed",
      format: "PDF"
    },
    {
      id: 2,
      title: "របាយការណ៍ពិន្ទុឆមាសទី១ 2023-2024",
      type: "semester", 
      date: "2024-02-15",
      status: "completed",
      format: "Excel"
    },
    {
      id: 3,
      title: "របាយការណ៍ពិន្ទុឆ្នាំ 2023-2024",
      type: "yearly",
      date: "2024-06-30", 
      status: "pending",
      format: "PDF"
    }
  ]

  return (
    <div>


      <Separator className="my-4" />   

      {/* Recent Reports Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">របាយការណ៍ថ្មីៗ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      report.type === 'monthly' ? 'bg-blue-100 dark:bg-blue-900' :
                      report.type === 'semester' ? 'bg-green-100 dark:bg-green-900' :
                      'bg-purple-100 dark:bg-purple-900'
                    }`}>
                      {report.type === 'monthly' ? <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                       report.type === 'semester' ? <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                       <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{report.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{report.format} • {report.date}</p>
                    </div>
                  </div>
                  <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                    {report.status === 'completed' ? 'បានបញ្ចប់' : 'កំពុងដំណើរការ'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="mr-1 h-3 w-3" />
                    ទាញយក
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Printer className="mr-1 h-3 w-3" />
                    បោះពុម្ព
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              reportType === type.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              setReportType(type.id)
              setShowReportModal(true)
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${type.color} text-white`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-wide">{type.title}</h3>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Modal - Enhanced Modern Design */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-primary/10">
                    <Award className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-wide text-center">
                      បង្កើតរបាយការណ៍ពិន្ទុ
                    </CardTitle>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                  className="h-5 w-5 p-0 hover:bg-muted"
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <form onSubmit={generateReport} className="space-y-3">
                {/* Report Type Selection */}
                <div className="space-y-2">
                  <Tabs value={reportType} onValueChange={setReportType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg h-10">
                      <TabsTrigger 
                        value="monthly" 
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 text-sm font-semibold"
                      >
                        <Calendar className="mr-1 h-4 w-4" />
                        ប្រចាំខែ
                      </TabsTrigger>
                      <TabsTrigger 
                        value="semester"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 text-sm font-semibold"
                      >
                        <BarChart3 className="mr-1 h-4 w-4" />
                        ប្រចាំឆមាស
                      </TabsTrigger>
                      <TabsTrigger 
                        value="yearly"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 text-sm font-semibold"
                      >
                        <TrendingUp className="mr-1 h-4 w-4" />
                        ប្រចាំឆ្នាំ
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-3">
                      <TabsContent value="monthly" className="space-y-2 animate-in fade-in-50 duration-200">
                        <div className="bg-muted/30 rounded-lg p-2 border border-border/50">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor="academicYear" className="text-sm font-semibold text-foreground">
                                ឆ្នាំសិក្សា <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Input
                                id="academicYear"
                                value={reportData.academicYear}
                                onChange={(e) => setReportData({...reportData, academicYear: e.target.value})}
                                placeholder="ឧ. 2023-2024"
                                className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="month" className="text-sm font-semibold text-foreground">
                                ខែ <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={reportData.month} onValueChange={(value) => setReportData({...reportData, month: value})}>
                                <SelectTrigger className="h-9 text-sm border-border/50 focus:border-primary focus:ring-primary/20">
                                  <SelectValue placeholder="ជ្រើសរើសខែ" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">មករា</SelectItem>
                                  <SelectItem value="2">កុម្ភៈ</SelectItem>
                                  <SelectItem value="3">មីនា</SelectItem>
                                  <SelectItem value="4">មេសា</SelectItem>
                                  <SelectItem value="5">ឧសភា</SelectItem>
                                  <SelectItem value="6">មិថុនា</SelectItem>
                                  <SelectItem value="7">កក្កដា</SelectItem>
                                  <SelectItem value="8">សីហា</SelectItem>
                                  <SelectItem value="9">កញ្ញា</SelectItem>
                                  <SelectItem value="10">តុលា</SelectItem>
                                  <SelectItem value="11">វិច្ឆិកា</SelectItem>
                                  <SelectItem value="12">ធ្នូ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="year" className="text-sm font-semibold text-foreground">
                                ឆ្នាំ <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Input
                                id="year"
                                type="number"
                                value={reportData.year}
                                onChange={(e) => setReportData({...reportData, year: e.target.value})}
                                placeholder="ឧ. 2024"
                                className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="class" className="text-sm font-semibold text-foreground">
                                ថ្នាក់
                              </Label>
                              <Input
                                id="class"
                                value={reportData.class}
                                onChange={(e) => setReportData({...reportData, class: e.target.value})}
                                placeholder="ឧ. ថ្នាក់ទី១ក"
                                className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="semester" className="space-y-2 animate-in fade-in-50 duration-200">
                        <div className="bg-muted/30 rounded-lg p-2 border border-border/50">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor="academicYearSemester" className="text-sm font-semibold text-foreground">
                                ឆ្នាំសិក្សា <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Input
                                id="academicYearSemester"
                                value={reportData.academicYear}
                                onChange={(e) => setReportData({...reportData, academicYear: e.target.value})}
                                placeholder="ឧ. 2023-2024"
                                className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="semester" className="text-sm font-semibold text-foreground">
                                ឆមាស <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Select value={reportData.semester} onValueChange={(value) => setReportData({...reportData, semester: value})}>
                                <SelectTrigger className="h-9 text-sm border-border/50 focus:border-primary focus:ring-primary/20">
                                  <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">ឆមាសទី១</SelectItem>
                                  <SelectItem value="2">ឆមាសទី២</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="yearly" className="space-y-2 animate-in fade-in-50 duration-200">
                        <div className="bg-muted/30 rounded-lg p-2 border border-border/50">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor="academicYearYearly" className="text-sm font-semibold text-foreground">
                                ឆ្នាំសិក្សា <span className="text-red-500 font-bold">*</span>
                              </Label>
                              <Input
                                id="academicYearYearly"
                                value={reportData.academicYear}
                                onChange={(e) => setReportData({...reportData, academicYear: e.target.value})}
                                placeholder="ឧ. 2023-2024"
                                className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="classYearly" className="text-sm font-semibold text-foreground">
                                ថ្នាក់
                              </Label>
                              <Input
                                id="classYearly"
                                value={reportData.class}
                                onChange={(e) => setReportData({...reportData, class: e.target.value})}
                                placeholder="ឧ. ថ្នាក់ទី១ក"
                                className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* Export Options */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold text-foreground">ជម្រើសនាំចេញ</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format" className="text-sm font-semibold text-foreground">
                      ទម្រង់ឯកសារ <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Select value={reportData.format} onValueChange={(value) => setReportData({...reportData, format: value})}>
                      <SelectTrigger className="h-8 text-sm border-border/50 focus:border-primary focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-3 w-3" />
                            <span>PDF</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-3 w-3" />
                            <span>Excel</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-3 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportModal(false)}
                    className="h-9 px-4 text-sm font-semibold hover:bg-muted/50"
                  >
                    បោះបង់
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isGenerating}
                    className="h-9 px-4 text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        កំពុងបង្កើត...
                      </>
                    ) : (
                      <>
                        <Download className="mr-1 h-3 w-3" />
                        បង្កើតរបាយការណ៍
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
