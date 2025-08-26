'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search,
  Filter,
  X,
  RefreshCw,
  Save,
  Loader2,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Star,
  TrendingUp
} from "lucide-react"

interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
}

interface AdvancedSearchFilterProps {
  title: string
  subtitle?: string
  searchPlaceholder?: string
  filters: {
    [key: string]: {
      label: string
      type: 'select' | 'checkbox' | 'date' | 'range'
      options?: FilterOption[]
      placeholder?: string
      multiple?: boolean
    }
  }
  searchValue: string
  filterValues: { [key: string]: any }
  onSearchChange: (value: string) => void
  onFilterChange: (key: string, value: any) => void
  onClearAll: () => void
  onSaveFilter?: (name: string) => void
  onLoadFilter?: (name: string) => void
  savedFilters?: Array<{ name: string; filters: any }>
  loading?: boolean
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function AdvancedSearchFilter({
  title,
  subtitle,
  searchPlaceholder = "ស្វែងរក...",
  filters,
  searchValue,
  filterValues,
  onSearchChange,
  onFilterChange,
  onClearAll,
  onSaveFilter,
  onLoadFilter,
  savedFilters = [],
  loading = false,
  theme = 'blue'
}: AdvancedSearchFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [savedFilterName, setSavedFilterName] = useState('')

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

  const activeFiltersCount = Object.keys(filterValues).filter(key => 
    filterValues[key] && 
    (Array.isArray(filterValues[key]) ? filterValues[key].length > 0 : true)
  ).length

  const renderFilterInput = (key: string, config: any) => {
    const value = filterValues[key]

    switch (config.type) {
      case 'select':
        return (
          <Select
            value={Array.isArray(value) ? value[0] || '' : value || ''}
            onValueChange={(newValue) => {
              if (config.multiple) {
                const currentValues = Array.isArray(value) ? value : []
                const updatedValues = currentValues.includes(newValue)
                  ? currentValues.filter(v => v !== newValue)
                  : [...currentValues, newValue]
                onFilterChange(key, updatedValues)
              } else {
                onFilterChange(key, newValue)
              }
            }}
          >
            <SelectTrigger className={`border-2 ${colors.secondary} focus:border-${theme}-500`}>
              <SelectValue placeholder={config.placeholder || `ជ្រើសរើស ${config.label}`} />
            </SelectTrigger>
                         <SelectContent>
               {config.options?.map((option: FilterOption) => (
                 <SelectItem key={option.id} value={option.value}>
                   <div className="flex items-center justify-between w-full">
                     <span>{option.label}</span>
                     {option.count && (
                       <Badge variant="secondary" className="ml-2">
                         {option.count}
                       </Badge>
                     )}
                   </div>
                 </SelectItem>
               ))}
             </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
                   <div className="space-y-2">
           {config.options?.map((option: FilterOption) => (
             <div key={option.id} className="flex items-center space-x-2">
               <Checkbox
                 id={`${key}-${option.id}`}
                 checked={Array.isArray(value) ? value.includes(option.value) : false}
                 onCheckedChange={(checked) => {
                   const currentValues = Array.isArray(value) ? value : []
                   const updatedValues = checked
                     ? [...currentValues, option.value]
                     : currentValues.filter(v => v !== option.value)
                   onFilterChange(key, updatedValues)
                 }}
               />
               <label
                 htmlFor={`${key}-${option.id}`}
                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
               >
                 {option.label}
                 {option.count && (
                   <Badge variant="secondary" className="ml-2">
                     {option.count}
                   </Badge>
                 )}
               </label>
             </div>
           ))}
         </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onFilterChange(key, e.target.value)}
            className={`border-2 ${colors.secondary} focus:border-${theme}-500`}
          />
        )

      case 'range':
        return (
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="ចាប់ផ្តើម"
              value={value?.min || ''}
              onChange={(e) => onFilterChange(key, { ...value, min: e.target.value })}
              className={`border-2 ${colors.secondary} focus:border-${theme}-500`}
            />
            <Input
              type="number"
              placeholder="បញ្ចប់"
              value={value?.max || ''}
              onChange={(e) => onFilterChange(key, { ...value, max: e.target.value })}
              className={`border-2 ${colors.secondary} focus:border-${theme}-500`}
            />
          </div>
        )

      default:
        return null
    }
  }

  const handleSaveFilter = () => {
    if (savedFilterName.trim() && onSaveFilter) {
      onSaveFilter(savedFilterName.trim())
      setSavedFilterName('')
    }
  }

  return (
    <Card className={`border-2 ${colors.secondary} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className={`bg-gradient-to-r ${colors.primary} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
              {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Filter className="h-4 w-4 mr-2" />
              ការច្រោះ ({activeFiltersCount})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 h-12 text-lg border-2 ${colors.secondary} focus:border-${theme}-500 focus:ring-${theme}-200`}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6">
            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(filters).map(([key, config]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {config.label}
                  </label>
                  {renderFilterInput(key, config)}
                </div>
              ))}
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ការច្រោះដែលប្រើ (Active Filters)
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <X className="h-4 w-4 mr-1" />
                    លុបទាំងអស់
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filterValues).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null
                    
                    const config = filters[key]
                    let displayValue = ''
                    
                    if (Array.isArray(value)) {
                      displayValue = value.map(v => 
                        config.options?.find(opt => opt.value === v)?.label || v
                      ).join(', ')
                    } else {
                      displayValue = config.options?.find(opt => opt.value === value)?.label || value
                    }

                    return (
                      <Badge
                        key={key}
                        variant="outline"
                        className={`border-${theme}-300 text-${theme}-700 dark:text-${theme}-300`}
                      >
                        {config.label}: {displayValue}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Save/Load Filters */}
            {(onSaveFilter || onLoadFilter) && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  ការរក្សាទុកការច្រោះ (Save/Load Filters)
                </h4>
                <div className="flex items-center space-x-2">
                  {onSaveFilter && (
                    <>
                      <Input
                        placeholder="ឈ្មោះការច្រោះ"
                        value={savedFilterName}
                        onChange={(e) => setSavedFilterName(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSaveFilter}
                        disabled={!savedFilterName.trim()}
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        រក្សាទុក
                      </Button>
                    </>
                  )}
                  {onLoadFilter && savedFilters.length > 0 && (
                    <Select onValueChange={(value) => onLoadFilter(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="ផ្ទុកការច្រោះ" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedFilters.map((filter) => (
                          <SelectItem key={filter.name} value={filter.name}>
                            {filter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={onClearAll}
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <X className="h-4 w-4 mr-2" />
                  លុបការច្រោះទាំងអស់
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  ផ្ទុកឡើងវិញ
                </Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ការច្រោះដែលប្រើ: {activeFiltersCount}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
