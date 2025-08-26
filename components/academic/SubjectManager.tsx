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
  BookOpen,
  BookOpenCheck,
  Grid3X3,
  List,
  MoreHorizontal,
  Clock
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Subject {
  subjectId: number
  subjectName: string
  createdAt: string
}

interface SubjectManagerProps {
  subjects: Subject[]
  filteredSubjects: Subject[]
  showSubjectForm: boolean
  newSubject: { subjectName: string }
  submitting: boolean
  searchTerm: string
  viewMode: 'grid' | 'table'
  errors: Record<string, string>
  onSetShowSubjectForm: (show: boolean) => void
  onSetNewSubject: (subject: { subjectName: string }) => void
  onSetSearchTerm: (term: string) => void
  onSetViewMode: (mode: 'grid' | 'table') => void
  onSetErrors: (errors: Record<string, string>) => void
  onAddSubject: () => void
  onDeleteSubject: (subjectId: number) => void
}

export function SubjectManager({
  subjects,
  filteredSubjects,
  showSubjectForm,
  newSubject,
  submitting,
  searchTerm,
  viewMode,
  errors,
  onSetShowSubjectForm,
  onSetNewSubject,
  onSetSearchTerm,
  onSetViewMode,
  onSetErrors,
  onAddSubject,
  onDeleteSubject
}: SubjectManagerProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">មុខវិជ្ជា</h2>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {subjects.length} មុខវិជ្ជា
                </Badge>
                <div className="h-1 w-8 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => onSetShowSubjectForm(!showSubjectForm)}
            className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            variant="ghost"
          >
            <div className="flex items-center gap-2">
              {showSubjectForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span>{showSubjectForm ? 'បោះបង់' : 'បន្ថែមមុខវិជ្ជា'}</span>
            </div>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Modern Search and Filter Section for Subjects */}
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                <Input
                  placeholder="ស្វែងរកមុខវិជ្ជា..."
                  value={searchTerm}
                  onChange={(e) => onSetSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base border-green-200 focus:border-green-500 focus:ring-green-200 dark:border-green-800 dark:focus:border-green-400"
                />
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-green-700 dark:text-green-300">
                  បានរកឃើញ <strong>{filteredSubjects.length}</strong> មុខវិជ្ជា
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetSearchTerm('')}
                className="h-10 px-4 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                កំណត់ឡើងវិញ
              </Button>
            </div>
          </div>
        </div>

        {showSubjectForm && (
          <div className="mb-6 border-2 border-dashed border-green-300 rounded-xl p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30 shadow-inner">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                បន្ថែមមុខវិជ្ជាថ្មី
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  ឈ្មោះមុខវិជ្ជា
                </label>
                <Input
                  value={newSubject.subjectName}
                  onChange={(e) => {
                    onSetNewSubject({...newSubject, subjectName: e.target.value})
                    if (errors.subjectName) onSetErrors({ ...errors, subjectName: '' })
                  }}
                  placeholder="ឧ. គណិតវិទ្យា"
                  className={`h-12 text-lg ${errors.subjectName ? 'border-red-500 ring-red-200' : 'border-green-200 focus:border-green-500 focus:ring-green-200'}`}
                />
                {errors.subjectName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {errors.subjectName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  onSetShowSubjectForm(false)
                  onSetErrors({})
                  onSetNewSubject({ subjectName: '' })
                }}
                className="px-6 py-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                បោះបង់
              </Button>
              <Button 
                onClick={onAddSubject} 
                disabled={submitting}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                បន្ថែមមុខវិជ្ជា
              </Button>
            </div>
          </div>
        )}

        {filteredSubjects.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                គ្មានមុខវិជ្ជាទេ
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                ចុចប៊ូតុង "បន្ថែមមុខវិជ្ជា" ដើម្បីចាប់ផ្តើមបង្កើតមុខវិជ្ជាថ្មី
              </p>
              
              <Button
                onClick={() => onSetShowSubjectForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                បន្ថែមមុខវិជ្ជាថ្មី
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Subjects Display Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <BookOpenCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    មុខវិជ្ជា
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    សរុប {filteredSubjects.length} មុខវិជ្ជា
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">បង្ហាញជា</p>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onSetViewMode('grid')}
                      className="h-8 px-3 text-xs bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Grid3X3 className="h-3 w-3 mr-1" />
                      ក្រឡា
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onSetViewMode('table')}
                      className="h-8 px-3 text-xs bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <List className="h-3 w-3 mr-1" />
                      បញ្ជី
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subjects Display - Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSubjects.map((subject) => (
                  <div key={subject.subjectId} className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Top Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                        <BookOpen className="h-3 w-3 mr-1" />
                        មុខវិជ្ជា
                      </Badge>
                    </div>

                    {/* Subject Header */}
                    <div className="relative z-10 mb-4 pr-20">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                          <BookOpenCheck className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                          {subject.subjectName}
                        </h3>
                      </div>
                    </div>

                    {/* Subject Details */}
                    <div className="relative z-10 space-y-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                            ឈ្មោះមុខវិជ្ជា
                          </span>
                          <span className="text-green-800 dark:text-green-200 text-sm font-semibold">
                            {subject.subjectName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subject Footer */}
                    <div className="relative z-10 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          បង្កើត: {new Date(subject.createdAt).toLocaleDateString('km-KH')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSubject(subject.subjectId)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-lg"
                        disabled={submitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subjects Display - List View */}
            {viewMode === 'table' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4" />
                            <span>មុខវិជ្ជា</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>កាលបរិច្ឆេទបង្កើត</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <MoreHorizontal className="h-4 w-4" />
                            <span>សកម្មភាព</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredSubjects.map((subject, index) => (
                        <tr key={subject.subjectId} className="hover:bg-green-50 dark:hover:bg-green-950/10 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                                <BookOpenCheck className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {subject.subjectName}
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400">
                                  មុខវិជ្ជា
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span>{new Date(subject.createdAt).toLocaleDateString('km-KH')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteSubject(subject.subjectId)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
                              disabled={submitting}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              លុប
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
