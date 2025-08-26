'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  BookOpen,
  Calendar
} from "lucide-react"

interface StudentFilterPanelProps {
  schoolYears: Array<{ schoolYearId: number; schoolYearCode: string }>
  classes: string[]
  selectedSchoolYear: string
  selectedClass: string
  searchTerm: string
  studentStats: {
    total: number
    active: number
    male: number
    female: number
    needsSupport: number
    inactive: number
  }
  onSchoolYearChange: (value: string) => void
  onClassChange: (value: string) => void
  onSearchChange: (value: string) => void
  onExport: (format: 'excel' | 'pdf' | 'csv') => void
  onRefresh: () => void
  loading?: boolean
}

export function StudentFilterPanel({
  schoolYears,
  classes,
  selectedSchoolYear,
  selectedClass,
  searchTerm,
  studentStats,
  onSchoolYearChange,
  onClassChange,
  onSearchChange,
  onExport,
  onRefresh,
  loading = false
}: StudentFilterPanelProps) {
  return (
    <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                ព័ត៌មានសិស្ស
              </CardTitle>
              <p className="text-white/80 text-sm">
                Student Information Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {studentStats.total} សិស្ស
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ស្វែងរកសិស្ស..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>

            {/* School Year Filter */}
            <Select value={selectedSchoolYear} onValueChange={onSchoolYearChange}>
              <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="ឆ្នាំសិក្សា" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់</SelectItem>
                {schoolYears.map((year) => (
                  <SelectItem key={year.schoolYearId} value={year.schoolYearCode}>
                    {year.schoolYearCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Class Filter */}
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="ថ្នាក់" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់</SelectItem>
                {classes.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={onRefresh}
                disabled={loading}
                variant="outline"
                className="h-12 border-2 border-blue-200 hover:border-blue-500"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                ផ្ទុកឡើងវិញ
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-900">{studentStats.total}</p>
              <p className="text-sm text-blue-600">សិស្សសរុប</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-900">{studentStats.active}</p>
              <p className="text-sm text-green-600">សកម្ម</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-900">{studentStats.male}</p>
              <p className="text-sm text-blue-600">ប្រុស</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
              <Users className="h-8 w-8 mx-auto mb-2 text-pink-600" />
              <p className="text-2xl font-bold text-pink-900">{studentStats.female}</p>
              <p className="text-sm text-pink-600">ស្រី</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-900">{studentStats.needsSupport}</p>
              <p className="text-sm text-orange-600">ត្រូវការជំនួយ</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-2xl font-bold text-gray-900">{studentStats.inactive}</p>
              <p className="text-sm text-gray-600">អសកម្ម</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                នាំចេញទិន្នន័យ (Export Data)
              </h4>
              <p className="text-xs text-gray-500">
                នាំចេញព័ត៌មានសិស្សជាទម្រង់ផ្សេងៗ
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => onExport('excel')}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                onClick={() => onExport('pdf')}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => onExport('csv')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
