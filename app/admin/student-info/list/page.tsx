"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  Printer, 
  FileText, 
  Users,
  UserCheck,
  CheckCircle,
  X
} from "lucide-react"
import { useState } from "react"

export default function StudentListReportPage() {
  const [showReportModal, setShowReportModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState({
    academicYear: "",
    class: "",
    format: "pdf",
    includeDetails: true,
    includeAllClasses: false
  })

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log("Generating student list report:", reportData)
    setIsGenerating(false)
    setShowReportModal(false)
  }

  const reportTypes = [
    {
      id: "class-list",
      title: "បញ្ជីឈ្មោះតាមថ្នាក់",
      description: "របាយការណ៍បញ្ជីឈ្មោះសិស្សតាមថ្នាក់",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      id: "all-students", 
      title: "បញ្ជីឈ្មោះសិស្សទាំងអស់",
      description: "របាយការណ៍បញ្ជីឈ្មោះសិស្សទាំងអស់",
      icon: UserCheck,
      color: "bg-green-500"
    },
    {
      id: "student-details",
      title: "ព័ត៌មានលម្អិតសិស្ស", 
      description: "របាយការណ៍ព័ត៌មានលម្អិតសិស្ស",
      icon: CheckCircle,
      color: "bg-purple-500"
    }
  ]

  const recentReports = [
    {
      id: 1,
      title: "បញ្ជីឈ្មោះថ្នាក់ទី១ក 2023-2024",
      type: "class-list",
      date: "2024-01-15",
      status: "completed",
      format: "PDF"
    },
    {
      id: 2,
      title: "បញ្ជីឈ្មោះសិស្សទាំងអស់ 2023-2024",
      type: "all-students", 
      date: "2024-01-20",
      status: "completed",
      format: "Excel"
    },
    {
      id: 3,
      title: "ព័ត៌មានលម្អិតសិស្សថ្នាក់ទី២ក 2023-2024",
      type: "student-details",
      date: "2024-01-25", 
      status: "pending",
      format: "PDF"
    }
  ]

  return (
    <div>


      <Separator className="my-4" />   

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((type) => (
          <Card 
            key={type.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
            onClick={() => setShowReportModal(true)}
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

      {/* Report Modal - Compact Modern Design */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-primary/10">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-wide text-center">
                      បង្កើតរបាយការណ៍បញ្ជីឈ្មោះសិស្ស
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
                {/* Report Configuration */}
                <div className="space-y-2">
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
                            <Users className="h-3 w-3" />
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
