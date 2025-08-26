'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Calendar,
  CalendarCheck,
  Grid3X3,
  List,
  MoreHorizontal,
  Clock,
  Edit,
  Save,
  CalendarDays
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
  createdAt: string
}

interface SchoolYearManagerProps {
  schoolYears: SchoolYear[]
  showYearForm: boolean
  newSchoolYear: { schoolYearCode: string }
  submitting: boolean
  errors: Record<string, string>
  onSetShowYearForm: (show: boolean) => void
  onSetNewSchoolYear: (year: { schoolYearCode: string }) => void
  onSetErrors: (errors: Record<string, string>) => void
  onAddSchoolYear: () => void
  onDeleteSchoolYear?: (yearId: number) => void
}

export function SchoolYearManager({
  schoolYears,
  showYearForm,
  newSchoolYear,
  submitting,
  errors,
  onSetShowYearForm,
  onSetNewSchoolYear,
  onSetErrors,
  onAddSchoolYear,
  onDeleteSchoolYear
}: SchoolYearManagerProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">ឆ្នាំសិក្សា</h2>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {schoolYears.length} ឆ្នាំសិក្សា
                </Badge>
                <div className="h-1 w-8 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => onSetShowYearForm(!showYearForm)}
            className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            variant="ghost"
          >
            <div className="flex items-center gap-2">
              {showYearForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span>{showYearForm ? 'បោះបង់' : 'បន្ថែមឆ្នាំសិក្សា'}</span>
            </div>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {showYearForm && (
          <div className="mb-6 border-2 border-dashed border-blue-300 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-100/50 dark:from-blue-950/30 dark:to-indigo-900/30 shadow-inner">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                បន្ថែមឆ្នាំសិក្សាថ្មី
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  ឆ្នាំសិក្សា
                </label>
                <Input
                  value={newSchoolYear.schoolYearCode}
                  onChange={(e) => {
                    onSetNewSchoolYear({...newSchoolYear, schoolYearCode: e.target.value})
                    if (errors.schoolYearCode) onSetErrors({ ...errors, schoolYearCode: '' })
                  }}
                  placeholder="ឧ. 2024-2025"
                  className={`h-12 text-lg ${errors.schoolYearCode ? 'border-red-500 ring-red-200' : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'}`}
                />
                {errors.schoolYearCode && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {errors.schoolYearCode}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  onSetShowYearForm(false)
                  onSetErrors({})
                  onSetNewSchoolYear({ schoolYearCode: '' })
                }}
                className="px-6 py-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                បោះបង់
              </Button>
              <Button 
                onClick={onAddSchoolYear} 
                disabled={submitting}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                បន្ថែមឆ្នាំសិក្សា
              </Button>
            </div>
          </div>
        )}

        {schoolYears.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                គ្មានឆ្នាំសិក្សាទេ
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                ចុចប៊ូតុង "បន្ថែមឆ្នាំសិក្សា" ដើម្បីចាប់ផ្តើមបង្កើតឆ្នាំសិក្សាថ្មី
              </p>
              
              <Button
                onClick={() => onSetShowYearForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                បន្ថែមឆ្នាំសិក្សាថ្មី
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* School Years Display Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <CalendarCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    ឆ្នាំសិក្សា
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    សរុប {schoolYears.length} ឆ្នាំសិក្សា
                  </p>
                </div>
              </div>
            </div>
            
            {/* School Years Display - Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {schoolYears.map((year) => (
                <div key={year.schoolYearId} className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Top Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg">
                      <Calendar className="h-3 w-3 mr-1" />
                      ឆ្នាំសិក្សា
                    </Badge>
                  </div>

                  {/* School Year Header */}
                  <div className="relative z-10 mb-4 pr-20">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                        <CalendarCheck className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                        {year.schoolYearCode}
                      </h3>
                    </div>
                  </div>

                  {/* School Year Details */}
                  <div className="relative z-10 space-y-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                          ឆ្នាំសិក្សា
                        </span>
                        <span className="text-blue-800 dark:text-blue-200 text-sm font-semibold">
                          {year.schoolYearCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* School Year Footer */}
                  <div className="relative z-10 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        បង្កើត: {new Date(year.createdAt).toLocaleDateString('km-KH')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    {onDeleteSchoolYear && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSchoolYear(year.schoolYearId)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-lg"
                        disabled={submitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
