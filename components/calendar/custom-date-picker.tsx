"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Calendar } from "lucide-react"

// ============================================================================
// CUSTOM DATE PICKER COMPONENT
// ============================================================================

interface CustomDatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
}

export function CustomDatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  className = ""
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [showYearSelector, setShowYearSelector] = useState(false)
  const [showMonthSelector, setShowMonthSelector] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  
  // Parse the current value or use today's date (avoid timezone issues)
  const selectedDate = value ? (() => {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  })() : new Date()
  
  // Month names in Khmer
  const monthNames = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  
  const dayNames = ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'ស', 'ស']
  
  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  // Get first day of month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  
  // Format date to YYYY-MM-DD (local timezone)
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Handle date selection
  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    onChange(formatDate(newDate))
    setIsOpen(false)
  }
  
  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  
  // Navigate years
  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1)
      } else {
        newDate.setFullYear(prev.getFullYear() + 1)
      }
      return newDate
    })
  }
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }
  
  const calendarDays = generateCalendarDays()
  
  return (
    <div className={`relative ${className}`}>
      {/* Date Input Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-4 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-orange-200 dark:border-orange-700 focus:border-orange-500 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 group-hover:shadow-lg cursor-pointer rounded-md flex items-center"
      >
        <span className="flex-1 text-orange-600 dark:text-orange-400">
          {value ? (() => {
            const [year, month, day] = value.split('-')
            return `${day}/${month}/${year}`
          })() : placeholder}
        </span>
        <div className="ml-3 p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded transition-colors">
          <Calendar className="h-5 w-5 text-orange-500 dark:text-orange-400" />
        </div>
      </div>
      
      {/* Custom Calendar Dropdown */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Calendar Modal */}
          <div className="relative w-72 max-w-[90vw] bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden">
          {/* Calendar Header */}
          <div className="relative p-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white rounded-t-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
            <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/5 rounded-full translate-y-4 -translate-x-4" />
            
            <div className="relative z-10 flex items-center justify-between mb-3">
              <button
                onClick={() => navigateYear('prev')}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShowYearSelector(!showYearSelector)
                  setShowMonthSelector(false)
                }}
                className="px-3 py-1 text-lg font-bold text-white hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
              >
                {currentDate.getFullYear()}
              </button>
              <button
                onClick={() => navigateYear('next')}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShowMonthSelector(!showMonthSelector)
                  setShowYearSelector(false)
                }}
                className="px-3 py-1 text-lg font-bold text-white hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
              >
                {monthNames[currentDate.getMonth()]}
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
           {/* Year Selector */}
           {showYearSelector && (
             <div className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
               <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                 ជ្រើសរើសឆ្នាំ
               </div>
               <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                 {Array.from({ length: 31 }, (_, i) => {
                   const year = 2000 + i
                   return (
                     <button
                       key={year}
                       onClick={() => {
                         setCurrentDate(new Date(year, currentDate.getMonth(), 1))
                         setShowYearSelector(false)
                       }}
                       className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 hover:scale-105 ${
                         year === currentDate.getFullYear()
                           ? 'bg-orange-500 text-white shadow-lg'
                           : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                       }`}
                     >
                       {year}
                     </button>
                   )
                 })}
               </div>
             </div>
           )}
          
          {/* Month Selector */}
          {showMonthSelector && (
            <div className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                ជ្រើសរើសខែ
              </div>
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentDate(new Date(currentDate.getFullYear(), index, 1))
                      setShowMonthSelector(false)
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded transition-all duration-200 hover:scale-105 ${
                      index === currentDate.getMonth()
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Calendar Body - Only show when selectors are closed */}
          {!showYearSelector && !showMonthSelector && (
            <div className="p-4 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3" key={`headers-${currentDate.getFullYear()}-${currentDate.getMonth()}`}>
              {dayNames.map((day, index) => (
                <div key={index} className="text-center text-xs font-bold text-gray-600 dark:text-gray-300 py-2 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2" key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}>
              {calendarDays.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day ? (
                    <button
                      onClick={() => handleDateSelect(day)}
                      className={`w-full h-full flex items-center justify-center text-xs font-semibold rounded-lg transition-all duration-200 hover:scale-105 ${
                        selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentDate.getMonth() && 
                        selectedDate.getFullYear() === currentDate.getFullYear()
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                          : 'hover:bg-gradient-to-br hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:shadow-md'
                      }`}
                    >
                      {day}
                    </button>
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
          )}
          
          {/* Calendar Footer */}
          <div className="p-4 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm rounded-b-2xl flex justify-between">
            <button
              onClick={() => {
                const today = new Date()
                onChange(formatDate(today))
                setIsOpen(false)
              }}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:scale-105 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40"
            >
              Today
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
