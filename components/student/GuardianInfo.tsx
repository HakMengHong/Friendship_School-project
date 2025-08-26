'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users,
  User,
  Phone,
  MapPin,
  Building,
  DollarSign,
  Baby,
  Home,
  Plus,
  X,
  Heart,
  Church,
  Star
} from "lucide-react"

interface Guardian {
  firstName: string
  lastName: string
  relation: string
  phone: string
  occupation: string
  income: string
  childrenCount: string
  houseNumber: string
  village: string
  district: string
  province: string
  birthDistrict: string
  believeJesus: boolean
  church: string
}

interface GuardianInfoProps {
  guardians: Guardian[]
  guardianForms: number[]
  onGuardianChange: (index: number, field: string, value: any) => void
  onAddGuardianForm: () => void
  onRemoveGuardianForm: (index: number) => void
}

export function GuardianInfo({
  guardians,
  guardianForms,
  onGuardianChange,
  onAddGuardianForm,
  onRemoveGuardianForm
}: GuardianInfoProps) {
  return (
    <div className="space-y-6">
      {/* Guardian Information Header */}
      <Card className="border-2 border-orange-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ព័ត៌មានអាណាព្យាបាទ</CardTitle>
                <p className="text-orange-100 text-sm">Guardian Information</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {guardians.length} អាណាព្យាបាទ
              </Badge>
              <Button
                onClick={onAddGuardianForm}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                បន្ថែម
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Guardian Forms */}
      {guardianForms.map((formIndex, index) => {
        const guardian = guardians[index]
        if (!guardian) return null

        return (
          <Card key={formIndex} className="border-2 border-orange-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-orange-900 dark:text-orange-100">
                      អាណាព្យាបាទទី {index + 1}
                    </CardTitle>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Guardian {index + 1}
                    </p>
                  </div>
                </div>
                {guardianForms.length > 1 && (
                  <Button
                    onClick={() => onRemoveGuardianForm(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  ព័ត៌មានផ្ទាល់ខ្លួន (Personal Information)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4" />
                      នាមខ្លួន (First Name)
                    </Label>
                    <Input
                      value={guardian.firstName}
                      onChange={(e) => onGuardianChange(index, 'firstName', e.target.value)}
                      placeholder="ឧ. សុខ"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4" />
                      នាមត្រកូល (Last Name)
                    </Label>
                    <Input
                      value={guardian.lastName}
                      onChange={(e) => onGuardianChange(index, 'lastName', e.target.value)}
                      placeholder="ឧ. សំអាង"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>

                  {/* Relation */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Heart className="h-4 w-4" />
                      ទំនាក់ទំនង (Relation)
                    </Label>
                    <Select value={guardian.relation} onValueChange={(value) => onGuardianChange(index, 'relation', value)}>
                      <SelectTrigger className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200">
                        <SelectValue placeholder="ជ្រើសរើសទំនាក់ទំនង" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">ឪពុក (Father)</SelectItem>
                        <SelectItem value="mother">ម្តាយ (Mother)</SelectItem>
                        <SelectItem value="grandfather">ជីតា (Grandfather)</SelectItem>
                        <SelectItem value="grandmother">ជីដូន (Grandmother)</SelectItem>
                        <SelectItem value="uncle">ពូ/មីង (Uncle/Aunt)</SelectItem>
                        <SelectItem value="sibling">បងប្អូន (Sibling)</SelectItem>
                        <SelectItem value="other">ផ្សេងទៀត (Other)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Phone className="h-4 w-4" />
                      លេខទូរស័ព្ទ (Phone)
                    </Label>
                    <Input
                      value={guardian.phone}
                      onChange={(e) => onGuardianChange(index, 'phone', e.target.value)}
                      placeholder="ឧ. 012345678"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  ព័ត៌មានការងារ (Employment Information)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Occupation */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Building className="h-4 w-4" />
                      មុខរបរ (Occupation)
                    </Label>
                    <Input
                      value={guardian.occupation}
                      onChange={(e) => onGuardianChange(index, 'occupation', e.target.value)}
                      placeholder="ឧ. កសិករ"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>

                  {/* Income */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <DollarSign className="h-4 w-4" />
                      ចំណូល (Income)
                    </Label>
                    <Input
                      value={guardian.income}
                      onChange={(e) => onGuardianChange(index, 'income', e.target.value)}
                      placeholder="ឧ. $200/ខែ"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>

                  {/* Children Count */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Baby className="h-4 w-4" />
                      ចំនួនកូន (Number of Children)
                    </Label>
                    <Input
                      value={guardian.childrenCount}
                      onChange={(e) => onGuardianChange(index, 'childrenCount', e.target.value)}
                      placeholder="ឧ. 3"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  អាសយដ្ឋាន (Address)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* House Number */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Home className="h-4 w-4" />
                      លេខផ្ទះ (House Number)
                    </Label>
                    <Input
                      value={guardian.houseNumber}
                      onChange={(e) => onGuardianChange(index, 'houseNumber', e.target.value)}
                      placeholder="ឧ. 123"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>

                  {/* Village */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4" />
                      ភូមិ (Village)
                    </Label>
                    <Input
                      value={guardian.village}
                      onChange={(e) => onGuardianChange(index, 'village', e.target.value)}
                      placeholder="ឧ. ភូមិស្តុក"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4" />
                      ស្រុក (District)
                    </Label>
                    <Input
                      value={guardian.district}
                      onChange={(e) => onGuardianChange(index, 'district', e.target.value)}
                      placeholder="ឧ. ស្រុកកំពង់ធំ"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>

                  {/* Province */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4" />
                      ខេត្ត (Province)
                    </Label>
                    <Input
                      value={guardian.province}
                      onChange={(e) => onGuardianChange(index, 'province', e.target.value)}
                      placeholder="ឧ. ខេត្តកំពង់ធំ"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>

                  {/* Birth District */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4" />
                      ស្រុកកំណើត (Birth District)
                    </Label>
                    <Input
                      value={guardian.birthDistrict}
                      onChange={(e) => onGuardianChange(index, 'birthDistrict', e.target.value)}
                      placeholder="ឧ. ស្រុកកំណើត"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>
                </div>
              </div>

              {/* Religious Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <Church className="h-4 w-4" />
                  ព័ត៌មានសាសនា (Religious Information)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Believe in Jesus */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`believeJesus-${index}`}
                        checked={guardian.believeJesus}
                        onCheckedChange={(checked) => onGuardianChange(index, 'believeJesus', checked)}
                        className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <Label htmlFor={`believeJesus-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ជឿលើព្រះយេស៊ូ (Believe in Jesus)
                      </Label>
                    </div>
                  </div>

                  {/* Church */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Church className="h-4 w-4" />
                      ព្រះវិហារ (Church)
                    </Label>
                    <Input
                      value={guardian.church}
                      onChange={(e) => onGuardianChange(index, 'church', e.target.value)}
                      placeholder="ឧ. ព្រះវិហារស្តុក"
                      className="mt-1 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Add Guardian Button */}
      <div className="flex justify-center">
        <Button
          onClick={onAddGuardianForm}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          បន្ថែមអាណាព្យាបាទ (Add Guardian)
        </Button>
      </div>
    </div>
  )
}
