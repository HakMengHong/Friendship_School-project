'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { 
  Download,
  FileText,
  FileSpreadsheet,
  FilePdf,
  FileJson,
  FileCsv,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react"

interface ExportField {
  id: string
  label: string
  key: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  required?: boolean
  default?: boolean
}

interface ExportFormat {
  id: string
  label: string
  icon: React.ReactNode
  extension: string
  mimeType: string
}

interface DataExportSystemProps {
  title: string
  subtitle?: string
  data: any[]
  fields: ExportField[]
  onExport: (format: string, fields: string[], filters?: any) => Promise<void>
  loading?: boolean
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function DataExportSystem({
  title,
  subtitle,
  data,
  fields,
  onExport,
  loading = false,
  theme = 'blue'
}: DataExportSystemProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('excel')
  const [selectedFields, setSelectedFields] = useState<string[]>(
    fields.filter(f => f.default).map(f => f.key)
  )
  const [exportName, setExportName] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')

  const exportFormats: ExportFormat[] = [
    {
      id: 'excel',
      label: 'Excel (.xlsx)',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      extension: 'xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
      id: 'pdf',
      label: 'PDF (.pdf)',
      icon: <FilePdf className="h-5 w-5" />,
      extension: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: 'csv',
      label: 'CSV (.csv)',
      icon: <FileCsv className="h-5 w-5" />,
      extension: 'csv',
      mimeType: 'text/csv'
    },
    {
      id: 'json',
      label: 'JSON (.json)',
      icon: <FileJson className="h-5 w-5" />,
      extension: 'json',
      mimeType: 'application/json'
    }
  ]

  const getThemeColors = () => {
    switch (theme) {
      case 'blue':
        return {
          primary: 'from-blue-500 to-indigo-600',
          secondary: 'border-blue-200',
          accent: 'text-blue-600',
          bg: 'from-blue-50 to-indigo-50',
          dark: 'from-blue-950/20 to-indigo-950/20'
        }
      case 'green':
        return {
          primary: 'from-green-500 to-emerald-600',
          secondary: 'border-green-200',
          accent: 'text-green-600',
          bg: 'from-green-50 to-emerald-50',
          dark: 'from-green-950/20 to-emerald-950/20'
        }
      case 'purple':
        return {
          primary: 'from-purple-500 to-pink-600',
          secondary: 'border-purple-200',
          accent: 'text-purple-600',
          bg: 'from-purple-50 to-pink-50',
          dark: 'from-purple-950/20 to-pink-950/20'
        }
      case 'orange':
        return {
          primary: 'from-orange-500 to-red-600',
          secondary: 'border-orange-200',
          accent: 'text-orange-600',
          bg: 'from-orange-50 to-red-50',
          dark: 'from-orange-950/20 to-red-950/20'
        }
      case 'red':
        return {
          primary: 'from-red-500 to-pink-600',
          secondary: 'border-red-200',
          accent: 'text-red-600',
          bg: 'from-red-50 to-pink-50',
          dark: 'from-red-950/20 to-pink-950/20'
        }
      default:
        return {
          primary: 'from-blue-500 to-indigo-600',
          secondary: 'border-blue-200',
          accent: 'text-blue-600',
          bg: 'from-blue-50 to-indigo-50',
          dark: 'from-blue-950/20 to-indigo-950/20'
        }
    }
  }

  const colors = getThemeColors()

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    )
  }

  const handleSelectAll = () => {
    setSelectedFields(fields.map(f => f.key))
  }

  const handleDeselectAll = () => {
    setSelectedFields([])
  }

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      setExportStatus('error')
      return
    }

    setExportStatus('exporting')
    try {
      await onExport(selectedFormat, selectedFields)
      setExportStatus('success')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  const getStatusIcon = () => {
    switch (exportStatus) {
      case 'exporting':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (exportStatus) {
      case 'exporting':
        return 'កំពុងនាំចេញ...'
      case 'success':
        return 'នាំចេញជោគជ័យ!'
      case 'error':
        return 'មានបញ្ហាក្នុងការនាំចេញ'
      default:
        return 'នាំចេញទិន្នន័យ'
    }
  }

  return (
    <Card className={`border-2 ${colors.secondary} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className={`bg-gradient-to-r ${colors.primary} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
              {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {data.length} កំណត់ត្រា
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Export Format Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              ទម្រង់នាំចេញ (Export Format)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {exportFormats.map((format) => (
                <div
                  key={format.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFormat === format.id
                      ? `${colors.secondary} bg-gradient-to-r ${colors.bg} dark:${colors.dark}`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`${selectedFormat === format.id ? colors.accent : 'text-gray-500'}`}>
                      {format.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        selectedFormat === format.id ? colors.accent : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {format.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        .{format.extension}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                វាលទិន្នន័យ (Data Fields)
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  ជ្រើសរើសទាំងអស់
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-xs"
                >
                  លុបការជ្រើសរើស
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => handleFieldToggle(field.key)}
                    disabled={field.required}
                  />
                  <label
                    htmlFor={`field-${field.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                    {field.required && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        ត្រូវការ
                      </Badge>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              ឈ្មោះឯកសារ (File Name)
            </label>
            <Input
              placeholder="ឈ្មោះឯកសារនាំចេញ"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              className={`border-2 ${colors.secondary} focus:border-${theme}-500`}
            />
          </div>

          {/* Advanced Options */}
          <div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              ជម្រើសកម្រិតខ្ពស់ (Advanced Options)
            </Button>
            
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  ជម្រើសកម្រិតខ្ពស់
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-headers" defaultChecked />
                    <label htmlFor="include-headers" className="text-sm">
                      រួមបញ្ចូលចំណងជើង
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-timestamp" defaultChecked />
                    <label htmlFor="include-timestamp" className="text-sm">
                      រួមបញ្ចូលពេលវេលា
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="format-dates" defaultChecked />
                    <label htmlFor="format-dates" className="text-sm">
                      កែប្រែទម្រង់កាលបរិច្ឆេទ
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export Status and Action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getStatusText()}
              </span>
            </div>
            <Button
              onClick={handleExport}
              disabled={loading || exportStatus === 'exporting' || selectedFields.length === 0}
              className={`bg-${theme}-600 hover:bg-${theme}-700`}
            >
              {exportStatus === 'exporting' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  កំពុងនាំចេញ...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  នាំចេញ
                </>
              )}
            </Button>
          </div>

          {/* Export Summary */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              សង្ខេបការនាំចេញ (Export Summary)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">ទម្រង់</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {exportFormats.find(f => f.id === selectedFormat)?.label}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">វាលដែលជ្រើសរើស</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedFields.length} / {fields.length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">កំណត់ត្រា</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {data.length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">ឈ្មោះឯកសារ</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {exportName || 'ឯកសារនាំចេញ'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
