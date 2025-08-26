'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Home,
  Users,
  Church,
  Heart,
  DollarSign,
  Building,
  MapPin,
  Calendar,
  Star,
  Shield,
  Target,
  Award,
  HelpCircle,
  Info
} from "lucide-react"

interface FamilyInfo {
  livingWith: string
  ownHouse: boolean
  durationInKPC: string
  livingCondition: string
  organizationHelp: string
  knowSchool: string
  religion: string
  churchName: string
  canHelpSchool: boolean
  helpAmount: string
  helpFrequency: string
}

interface FamilyInfoProps {
  familyInfo: FamilyInfo
  onFamilyInfoChange: (field: string, value: any) => void
}

export function FamilyInfo({
  familyInfo,
  onFamilyInfoChange
}: FamilyInfoProps) {
  return (
    <div className="space-y-6">
      {/* Family Background Information */}
      <Card className="border-2 border-teal-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">ព័ត៌មានផ្ទះគ្រួសារ</CardTitle>
              <p className="text-teal-100 text-sm">Family Background Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Living With */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Users className="h-4 w-4" />
                រស់នៅជាមួយ (Living With)
              </Label>
              <Select value={familyInfo.livingWith} onValueChange={(value) => onFamilyInfoChange('livingWith', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-teal-200 focus:border-teal-500 focus:ring-teal-200">
                  <SelectValue placeholder="ជ្រើសរើស" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parents">ឪពុកម្តាយ (Parents)</SelectItem>
                  <SelectItem value="father">ឪពុក (Father)</SelectItem>
                  <SelectItem value="mother">ម្តាយ (Mother)</SelectItem>
                  <SelectItem value="grandparents">ជីតាជីដូន (Grandparents)</SelectItem>
                  <SelectItem value="relatives">ញាតិមិត្ត (Relatives)</SelectItem>
                  <SelectItem value="alone">រស់នៅតែម្នាក់ឯង (Alone)</SelectItem>
                  <SelectItem value="other">ផ្សេងទៀត (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Own House */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ownHouse"
                  checked={familyInfo.ownHouse}
                  onCheckedChange={(checked) => onFamilyInfoChange('ownHouse', checked)}
                  className="border-teal-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                />
                <Label htmlFor="ownHouse" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  មានផ្ទះផ្ទាល់ (Own House)
                </Label>
              </div>
            </div>

            {/* Duration in KPC */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                រយៈពេលនៅក្នុង KPC (Duration in KPC)
              </Label>
              <Select value={familyInfo.durationInKPC} onValueChange={(value) => onFamilyInfoChange('durationInKPC', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-teal-200 focus:border-teal-500 focus:ring-teal-200">
                  <SelectValue placeholder="ជ្រើសរើស" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less_than_1">តិចជាង ១ ឆ្នាំ (Less than 1 year)</SelectItem>
                  <SelectItem value="1_to_3">១-៣ ឆ្នាំ (1-3 years)</SelectItem>
                  <SelectItem value="3_to_5">៣-៥ ឆ្នាំ (3-5 years)</SelectItem>
                  <SelectItem value="5_to_10">៥-១០ ឆ្នាំ (5-10 years)</SelectItem>
                  <SelectItem value="more_than_10">លើស ១០ ឆ្នាំ (More than 10 years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Living Condition */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Home className="h-4 w-4" />
                លក្ខខណ្ឌរស់នៅ (Living Condition)
              </Label>
              <Select value={familyInfo.livingCondition} onValueChange={(value) => onFamilyInfoChange('livingCondition', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-teal-200 focus:border-teal-500 focus:ring-teal-200">
                  <SelectValue placeholder="ជ្រើសរើស" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">ល្អ (Good)</SelectItem>
                  <SelectItem value="fair">មធ្យម (Fair)</SelectItem>
                  <SelectItem value="poor">អន់ (Poor)</SelectItem>
                  <SelectItem value="very_poor">អន់ណាស់ (Very Poor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Organization Help */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <HelpCircle className="h-4 w-4" />
                ការជួយពីអង្គការ (Organization Help)
              </Label>
              <Input
                value={familyInfo.organizationHelp}
                onChange={(e) => onFamilyInfoChange('organizationHelp', e.target.value)}
                placeholder="ឧ. អង្គការជួយ"
                className="mt-1 h-12 text-lg border-teal-200 focus:border-teal-500 focus:ring-teal-200"
              />
            </div>

            {/* Know School */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Info className="h-4 w-4" />
                ដឹងពីសាលារៀន (Know School)
              </Label>
              <Select value={familyInfo.knowSchool} onValueChange={(value) => onFamilyInfoChange('knowSchool', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-teal-200 focus:border-teal-500 focus:ring-teal-200">
                  <SelectValue placeholder="ជ្រើសរើស" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friend">ពីមិត្តភក្តិ (From Friend)</SelectItem>
                  <SelectItem value="relative">ពីញាតិមិត្ត (From Relative)</SelectItem>
                  <SelectItem value="church">ពីព្រះវិហារ (From Church)</SelectItem>
                  <SelectItem value="advertisement">ពីការផ្សាយពាណិជ្ជកម្ម (From Advertisement)</SelectItem>
                  <SelectItem value="other">ផ្សេងទៀត (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Religious Information */}
      <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Church className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">ព័ត៌មានសាសនា</CardTitle>
              <p className="text-purple-100 text-sm">Religious Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Religion */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Church className="h-4 w-4" />
                សាសនា (Religion)
              </Label>
              <Select value={familyInfo.religion} onValueChange={(value) => onFamilyInfoChange('religion', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-purple-200 focus:border-purple-500 focus:ring-purple-200">
                  <SelectValue placeholder="ជ្រើសរើសសាសនា" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="christian">គ្រិស្តសាសនា (Christian)</SelectItem>
                  <SelectItem value="buddhist">ព្រះពុទ្ធសាសនា (Buddhist)</SelectItem>
                  <SelectItem value="muslim">ឥស្លាមសាសនា (Muslim)</SelectItem>
                  <SelectItem value="hindu">ហិណ្ឌូសាសនា (Hindu)</SelectItem>
                  <SelectItem value="none">គ្មានសាសនា (None)</SelectItem>
                  <SelectItem value="other">ផ្សេងទៀត (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Church Name */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Church className="h-4 w-4" />
                ឈ្មោះព្រះវិហារ (Church Name)
              </Label>
              <Input
                value={familyInfo.churchName}
                onChange={(e) => onFamilyInfoChange('churchName', e.target.value)}
                placeholder="ឧ. ព្រះវិហារស្តុក"
                className="mt-1 h-12 text-lg border-purple-200 focus:border-purple-500 focus:ring-purple-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Support Information */}
      <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">ការគាំទ្រសាលារៀន</CardTitle>
              <p className="text-indigo-100 text-sm">School Support Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Can Help School */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canHelpSchool"
                  checked={familyInfo.canHelpSchool}
                  onCheckedChange={(checked) => onFamilyInfoChange('canHelpSchool', checked)}
                  className="border-indigo-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                />
                <Label htmlFor="canHelpSchool" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  អាចជួយសាលារៀនបាន (Can Help School)
                </Label>
              </div>
            </div>

            {/* Help Amount */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <DollarSign className="h-4 w-4" />
                ចំនួនទឹកប្រាក់ជួយ (Help Amount)
              </Label>
              <Input
                value={familyInfo.helpAmount}
                onChange={(e) => onFamilyInfoChange('helpAmount', e.target.value)}
                placeholder="ឧ. $50/ខែ"
                className="mt-1 h-12 text-lg border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
              />
            </div>

            {/* Help Frequency */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                ប្រេកង់ការជួយ (Help Frequency)
              </Label>
              <Select value={familyInfo.helpFrequency} onValueChange={(value) => onFamilyInfoChange('helpFrequency', value)}>
                <SelectTrigger className="mt-1 h-12 text-lg border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200">
                  <SelectValue placeholder="ជ្រើសរើស" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">រៀងរាល់ខែ (Monthly)</SelectItem>
                  <SelectItem value="quarterly">រៀងរាល់ត្រីមាស (Quarterly)</SelectItem>
                  <SelectItem value="yearly">រៀងរាល់ឆ្នាំ (Yearly)</SelectItem>
                  <SelectItem value="one_time">តែម្តង (One Time)</SelectItem>
                  <SelectItem value="other">ផ្សេងទៀត (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Information */}
      <Card className="border-2 border-gray-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">សង្ខេបព័ត៌មាន</CardTitle>
              <p className="text-gray-100 text-sm">Summary Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Living Situation */}
            <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="flex items-center space-x-2 mb-2">
                <Home className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">រស់នៅជាមួយ</span>
              </div>
              <p className="text-sm text-teal-800 dark:text-teal-200">
                {familyInfo.livingWith || 'មិនមាន'}
              </p>
            </div>

            {/* House Ownership */}
            <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="flex items-center space-x-2 mb-2">
                <Home className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">ផ្ទះផ្ទាល់</span>
              </div>
              <p className="text-sm text-teal-800 dark:text-teal-200">
                {familyInfo.ownHouse ? 'មាន' : 'គ្មាន'}
              </p>
            </div>

            {/* Religion */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-2">
                <Church className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">សាសនា</span>
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                {familyInfo.religion || 'មិនមាន'}
              </p>
            </div>

            {/* Can Help School */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">ជួយសាលា</span>
              </div>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                {familyInfo.canHelpSchool ? 'អាចជួយ' : 'មិនអាចជួយ'}
              </p>
            </div>

            {/* Help Amount */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">ចំនួនជួយ</span>
              </div>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                {familyInfo.helpAmount || 'មិនមាន'}
              </p>
            </div>

            {/* Living Condition */}
            <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="flex items-center space-x-2 mb-2">
                <Home className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">លក្ខខណ្ឌរស់នៅ</span>
              </div>
              <p className="text-sm text-teal-800 dark:text-teal-200">
                {familyInfo.livingCondition || 'មិនមាន'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
