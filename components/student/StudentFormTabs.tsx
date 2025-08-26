'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  UserPlus,
  User,
  Users,
  Home,
  FileText,
  Download,
  Save,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Star,
  GraduationCap,
  Phone,
  MapPin
} from "lucide-react"

import { StudentBasicInfo } from './StudentBasicInfo'
import { GuardianInfo } from './GuardianInfo'
import { FamilyInfo } from './FamilyInfo'

interface StudentFormTabsProps {
  activeTab: string
  formData: any
  schoolYears: Array<{ schoolYearId: number; schoolYearCode: string }>
  guardianForms: number[]
  isSubmitting: boolean
  isCompleted: boolean
  onSetActiveTab: (tab: string) => void
  onFormDataChange: (field: string, value: any) => void
  onGuardianChange: (index: number, field: string, value: any) => void
  onFamilyInfoChange: (field: string, value: any) => void
  onAddGuardianForm: () => void
  onRemoveGuardianForm: (index: number) => void
  onDateOfBirthChange: (dob: string) => void
  onSubmit: () => void
  onGeneratePDF: () => void
  getGradeLabel: (grade: string | number) => string
}

export function StudentFormTabs({
  activeTab,
  formData,
  schoolYears,
  guardianForms,
  isSubmitting,
  isCompleted,
  onSetActiveTab,
  onFormDataChange,
  onGuardianChange,
  onFamilyInfoChange,
  onAddGuardianForm,
  onRemoveGuardianForm,
  onDateOfBirthChange,
  onSubmit,
  onGeneratePDF,
  getGradeLabel
}: StudentFormTabsProps) {
  const tabs = [
    {
      id: "basic",
      label: "ព័ត៌មានមូលដ្ឋាន",
      icon: User,
      description: "Basic Information"
    },
    {
      id: "guardian",
      label: "អាណាព្យាបាទ",
      icon: Users,
      description: "Guardian Information"
    },
    {
      id: "family",
      label: "គ្រួសារ",
      icon: Home,
      description: "Family Information"
    }
  ]

  const getTabStatus = (tabId: string) => {
    if (tabId === "basic") {
      return formData.firstName && formData.lastName && formData.gender && formData.dob
    } else if (tabId === "guardian") {
      return formData.guardians && formData.guardians.length > 0 && 
             formData.guardians[0].firstName && formData.guardians[0].lastName
    } else if (tabId === "family") {
      return formData.familyInfo && formData.familyInfo.livingWith
    }
    return false
  }

  const getNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    return currentIndex < tabs.length - 1 ? tabs[currentIndex + 1].id : null
  }

  const getPrevTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    return currentIndex > 0 ? tabs[currentIndex - 1].id : null
  }

  const handleNextTab = () => {
    const nextTab = getNextTab()
    if (nextTab) {
      onSetActiveTab(nextTab)
    }
  }

  const handlePrevTab = () => {
    const prevTab = getPrevTab()
    if (prevTab) {
      onSetActiveTab(prevTab)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ការចុះឈ្មោះសិស្ស</CardTitle>
                <p className="text-blue-100 text-sm">Student Registration Form</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {isCompleted ? 'បានបញ្ចប់' : 'កំពុងដំណើរការ'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-4">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isCompleted = getTabStatus(tab.id)
            const isActive = activeTab === tab.id
            
            return (
              <div key={tab.id} className="flex items-center space-x-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${
                    isActive 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : isCompleted 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {tab.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tab.description}
                  </p>
                </div>
                {index < tabs.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Tabs */}
      <Card className="border-2 border-gray-200 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={onSetActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabsList className="grid w-full grid-cols-3 h-14 bg-transparent">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isCompleted = getTabStatus(tab.id)
                  
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white ${
                        isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {isCompleted && <CheckCircle className="h-4 w-4" />}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="p-6">
              <StudentBasicInfo
                formData={formData}
                schoolYears={schoolYears}
                onFormDataChange={onFormDataChange}
                onDateOfBirthChange={onDateOfBirthChange}
                getGradeLabel={getGradeLabel}
              />
            </TabsContent>

            {/* Guardian Information Tab */}
            <TabsContent value="guardian" className="p-6">
              <GuardianInfo
                guardians={formData.guardians}
                guardianForms={guardianForms}
                onGuardianChange={onGuardianChange}
                onAddGuardianForm={onAddGuardianForm}
                onRemoveGuardianForm={onRemoveGuardianForm}
              />
            </TabsContent>

            {/* Family Information Tab */}
            <TabsContent value="family" className="p-6">
              <FamilyInfo
                familyInfo={formData.familyInfo}
                onFamilyInfoChange={onFamilyInfoChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Navigation and Action Buttons */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Previous Button */}
        <Button
          onClick={handlePrevTab}
          disabled={!getPrevTab()}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ថយក្រោយ</span>
        </Button>

        {/* Progress Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ទំព័រ {tabs.findIndex(tab => tab.id === activeTab) + 1} ក្នុងចំណោម {tabs.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Page {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
          </p>
        </div>

        {/* Next/Submit Buttons */}
        <div className="flex items-center space-x-2">
          {activeTab !== "family" ? (
            <Button
              onClick={handleNextTab}
              disabled={!getNextTab() || !getTabStatus(activeTab)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
            >
              <span>បន្ទាប់</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                onClick={onGeneratePDF}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>ទាញយក PDF</span>
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isSubmitting || !getTabStatus(activeTab)}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>កំពុងដំណើរការ...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>រក្សាទុក</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Success Message */}
      {isCompleted && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                  ការចុះឈ្មោះបានជោគជ័យ!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  សិស្សត្រូវបានចុះឈ្មោះដោយជោគជ័យ។ អ្នកអាចទាញយក PDF ឬបន្ថែមសិស្សថ្មី។
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Summary */}
      {formData.firstName && formData.lastName && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
              <Star className="h-5 w-5" />
              <span>សង្ខេបព័ត៌មានសិស្ស</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">ឈ្មោះ:</span>
                <span className="text-sm">{formData.firstName} {formData.lastName}</span>
              </div>
              {formData.studentId && (
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">លេខសម្គាល់:</span>
                  <span className="text-sm">{formData.studentId}</span>
                </div>
              )}
              {formData.class && (
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">ថ្នាក់:</span>
                  <span className="text-sm">{getGradeLabel(formData.class)}</span>
                </div>
              )}
              {formData.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">លេខទូរស័ព្ទ:</span>
                  <span className="text-sm">{formData.phone}</span>
                </div>
              )}
              {formData.guardians && formData.guardians.length > 0 && formData.guardians[0].firstName && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">អាណាព្យាបាទ:</span>
                  <span className="text-sm">{formData.guardians[0].firstName} {formData.guardians[0].lastName}</span>
                </div>
              )}
              {formData.familyInfo && formData.familyInfo.livingWith && (
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">រស់នៅជាមួយ:</span>
                  <span className="text-sm">{formData.familyInfo.livingWith}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
