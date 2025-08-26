'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  FileText, 
  BarChart3,
  Calendar,
  X
} from "lucide-react"

interface ReportData {
  academicYear: string
  month: string
  year: string
  semester: string
  class: string
  startDate: string
  endDate: string
  sortByRank: boolean
  format: string
  includeDetails: boolean
  includeAllClasses: boolean
}

interface ReportGenerationModalProps {
  isOpen: boolean
  reportType: string
  reportData: ReportData
  isGenerating: boolean
  months: { value: string; label: string }[]
  semesters: { value: string; label: string }[]
  formatOptions: { value: string; label: string; icon: string }[]
  onClose: () => void
  onReportTypeChange: (type: string) => void
  onReportDataChange: (field: keyof ReportData, value: string | boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

export function ReportGenerationModal({
  isOpen,
  reportType,
  reportData,
  isGenerating,
  months,
  semesters,
  formatOptions,
  onClose,
  onReportTypeChange,
  onReportDataChange,
  onSubmit
}: ReportGenerationModalProps) {
  if (!isOpen) return null

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return FileText
      case 'BarChart3':
        return BarChart3
      default:
        return FileText
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-primary/10">
                <FileText className="h-3 w-3 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-wide text-center">
                  បង្កើតរបាយការណ៍សៀវភៅតាមដាន
                </CardTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-5 w-5 p-0 hover:bg-muted"
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <form onSubmit={onSubmit} className="space-y-3">
            {/* Report Type Selection */}
            <div className="space-y-2">
              <Tabs value={reportType} onValueChange={onReportTypeChange} className="w-full">
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
                    <Download className="mr-1 h-4 w-4" />
                    ប្រចាំឆ្នាំ
                  </TabsTrigger>
                </TabsList>

                <div className="mt-3">
                  {/* Monthly Report Form */}
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
                            onChange={(e) => onReportDataChange('academicYear', e.target.value)}
                            placeholder="ឧ. 2023-2024"
                            className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="month" className="text-sm font-semibold text-foreground">
                            ខែ <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Select value={reportData.month} onValueChange={(value) => onReportDataChange('month', value)}>
                            <SelectTrigger className="h-9 text-sm border-border/50 focus:border-primary focus:ring-primary/20">
                              <SelectValue placeholder="ជ្រើសរើសខែ" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.label}
                                </SelectItem>
                              ))}
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
                            onChange={(e) => onReportDataChange('year', e.target.value)}
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
                            onChange={(e) => onReportDataChange('class', e.target.value)}
                            placeholder="ឧ. ថ្នាក់ទី១ក"
                            className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Semester Report Form */}
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
                            onChange={(e) => onReportDataChange('academicYear', e.target.value)}
                            placeholder="ឧ. 2023-2024"
                            className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="semester" className="text-sm font-semibold text-foreground">
                            ឆមាស <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Select value={reportData.semester} onValueChange={(value) => onReportDataChange('semester', value)}>
                            <SelectTrigger className="h-9 text-sm border-border/50 focus:border-primary focus:ring-primary/20">
                              <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                            </SelectTrigger>
                            <SelectContent>
                              {semesters.map((semester) => (
                                <SelectItem key={semester.value} value={semester.value}>
                                  {semester.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="startDate" className="text-sm font-semibold text-foreground">
                            ថ្ងៃចាប់ផ្តើម <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={reportData.startDate}
                            onChange={(e) => onReportDataChange('startDate', e.target.value)}
                            className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="endDate" className="text-sm font-semibold text-foreground">
                            ថ្ងៃបញ្ចប់ <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={reportData.endDate}
                            onChange={(e) => onReportDataChange('endDate', e.target.value)}
                            className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Yearly Report Form */}
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
                            onChange={(e) => onReportDataChange('academicYear', e.target.value)}
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
                            onChange={(e) => onReportDataChange('class', e.target.value)}
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
                <Select value={reportData.format} onValueChange={(value) => onReportDataChange('format', value)}>
                  <SelectTrigger className="h-8 text-sm border-border/50 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => {
                      const IconComponent = getIcon(option.icon)
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-3 w-3" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
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
                onClick={onClose}
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
  )
}
