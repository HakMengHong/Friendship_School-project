'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  X,
  Loader2
} from "lucide-react"

interface Student {
  studentId: number
  firstName: string
  lastName: string
  photo: string | null
  class: string
  gender: string
}

interface AttendanceFormData {
  studentId: number
  courseId: number
  session: 'AM' | 'PM' | 'FULL'
  status: string
  reason: string
  time: string
}

interface AttendanceDailyFormProps {
  showForm: boolean
  selectedStudent: Student | null
  currentSession: 'AM' | 'PM' | 'FULL'
  attendanceForm: AttendanceFormData
  statusOptions: Array<{ value: string; label: string; color: string }>
  sessionOptions: Array<{ value: string; label: string }>
  isEditing: boolean
  loading?: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onFormChange: (field: string, value: string) => void
}

export function AttendanceDailyForm({
  showForm,
  selectedStudent,
  currentSession,
  attendanceForm,
  statusOptions,
  sessionOptions,
  isEditing,
  loading = false,
  onClose,
  onSubmit,
  onFormChange
}: AttendanceDailyFormProps) {
  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? '👨' : '👩'
  }

  const getSessionLabel = (session: string) => {
    const option = sessionOptions.find(opt => opt.value === session)
    return option ? option.label : session
  }

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option ? option.label : status
  }

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option ? option.color : 'bg-gray-100 text-gray-800'
  }

  if (!selectedStudent) return null

  return (
    <Dialog open={showForm} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>
              {isEditing ? 'កែសម្រួលវត្តមាន' : 'បញ្ចូលវត្តមាន'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {selectedStudent.photo ? (
                  <img
                    src={selectedStudent.photo}
                    alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getGenderIcon(selectedStudent.gender)}</span>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {selectedStudent.studentId} | ថ្នាក់: {selectedStudent.class}
                </p>
              </div>
            </div>
          </div>

          {/* Session Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">ពេល (Session)</Label>
            <RadioGroup
              value={attendanceForm.session}
              onValueChange={(value) => onFormChange('session', value)}
              className="grid grid-cols-3 gap-3"
            >
              {sessionOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`session-${option.value}`} />
                  <Label htmlFor={`session-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                ពេលបច្ចុប្បន្ន: {getSessionLabel(currentSession)}
              </Badge>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">ស្ថានភាព (Status)</Label>
            <Select value={attendanceForm.status} onValueChange={(value) => onFormChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>វត្តមាន (Present)</span>
                  </div>
                </SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      {option.value === 'late' && <Clock className="h-4 w-4 text-yellow-600" />}
                      {option.value === 'absent' && <XCircle className="h-4 w-4 text-red-600" />}
                      {option.value === 'excused' && <AlertTriangle className="h-4 w-4 text-blue-600" />}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {attendanceForm.status && (
              <div className="mt-2">
                <Badge className={getStatusColor(attendanceForm.status)}>
                  {getStatusLabel(attendanceForm.status)}
                </Badge>
              </div>
            )}
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium">ម៉ោង (Time)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="time"
                type="time"
                value={attendanceForm.time}
                onChange={(e) => onFormChange('time', e.target.value)}
                className="pl-10"
                placeholder="ម៉ោង"
              />
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              មូលហេតុ (Reason) {attendanceForm.status !== 'present' && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="reason"
              value={attendanceForm.reason}
              onChange={(e) => onFormChange('reason', e.target.value)}
              placeholder="បញ្ជាក់មូលហេតុ (ប្រសិនបើមាន)"
              className="min-h-[80px]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>បោះបង់</span>
            </Button>
            <Button
              type="submit"
              disabled={loading || (attendanceForm.status !== 'present' && !attendanceForm.reason.trim())}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isEditing ? 'កែសម្រួល' : 'រក្សាទុក'}</span>
            </Button>
          </div>

          {/* Validation Message */}
          {attendanceForm.status !== 'present' && !attendanceForm.reason.trim() && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                សូមបញ្ជាក់មូលហេតុសម្រាប់ស្ថានភាព {getStatusLabel(attendanceForm.status)}
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
