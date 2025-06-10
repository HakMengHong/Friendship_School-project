"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const KHMER_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"]
const KHMER_DAYS = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"]
const KHMER_DAYS_SHORT = ["អាទិ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហ", "សុក្រ", "សៅរ៍"]
const KHMER_NUMBERS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"]

// Lunar calendar data (simplified - in a real app you'd want a proper lunar calculation)
const LUNAR_MONTHS = ["មិគសិរ", "បុស្ស", "មាឃ", "ផល្គុន", "ចេត្រ", "ពិសាខ", "ជេស្ឋ", "អាសាឍ", "ស្រាពណ៍", "ភទ្របទ", "អស្សុជ", "កត្តិកា"]
const KHMER_ZODIAC = ["ជូត", "ឆ្លូវ", "ខាល", "ថោះ", "រោង", "ម្សាញ់", "មមីរ", "មមែ", "វក", "រកា", "ច", "កុរ"]

function toKhmerNumber(num: number): string {
  return num
    .toString()
    .split("")
    .map((digit) => KHMER_NUMBERS[parseInt(digit)])
    .join("")
}

function getKhmerDayName(date: Date): string {
  return KHMER_DAYS[date.getDay()]
}

function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  
  const period = hours >= 12 ? "ល្ងាច" : "ព្រឹក"
  const khmerHours = hours > 12 ? hours - 12 : hours
  
  return `${toKhmerNumber(khmerHours)}:${toKhmerNumber(minutes)}:${toKhmerNumber(seconds)} ${period}`
}

// Simplified lunar date calculation (for demonstration)
// In a real app, you'd want to use a proper lunar calendar library
function getLunarDate(gregorianDate: Date) {
  const day = gregorianDate.getDate()
  const month = gregorianDate.getMonth()
  const year = gregorianDate.getFullYear()
  
  // This is a very simplified approximation
  const lunarDay = (day % 15) + 1
  const lunarMonth = month
  const lunarYear = year - 2025 + 2569 // Buddhist era
  
  return {
    day: lunarDay,
    month: LUNAR_MONTHS[lunarMonth],
    year: KHMER_ZODIAC[(year - 2000) % 12],
    buddhistYear: lunarYear
  }
}

interface KhmerCalendarProps {
  compact?: boolean
}

export function KhmerCalendar({ compact = false }: KhmerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [currentTime, setCurrentTime] = useState(getCurrentTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Get days from previous month to fill the grid
  const daysFromPrevMonth = firstDayWeekday
  const prevMonth = new Date(currentYear, currentMonth - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()

  // Calculate total cells needed
  const totalCells = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7
  const daysFromNextMonth = totalCells - (daysFromPrevMonth + daysInMonth)

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    )
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(newDate)
  }

  const renderCalendarDays = () => {
    const days = []

    // Previous month days (grayed out)
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = daysInPrevMonth - i + 1
      days.push(
        <button
          key={`prev-${day}`}
          className={`text-gray-400 hover:bg-gray-100 rounded-lg transition-colors ${
            compact ? "p-1 text-xs" : "p-2 text-sm"
          }`}
          onClick={() => {
            navigateMonth("prev")
            setTimeout(() => handleDateClick(day), 100)
          }}
        >
          {toKhmerNumber(day)}
        </button>
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day)
      const isSelectedDay = isSelected(day)

      days.push(
        <button
          key={`current-${day}`}
          onClick={() => handleDateClick(day)}
          className={`rounded-lg transition-all duration-200 hover:scale-105 ${
            compact ? "p-1 text-xs" : "p-2 text-sm"
          } ${
            isCurrentDay
              ? "bg-[#0082c8] text-white font-bold shadow-md"
              : isSelectedDay
              ? "bg-blue-100 text-blue-700 font-semibold"
              : "text-gray-700 hover:bg-blue-50"
          }`}
        >
          {toKhmerNumber(day)}
        </button>
      )
    }

    // Next month days (grayed out)
    for (let day = 1; day <= daysFromNextMonth; day++) {
      days.push(
        <button
          key={`next-${day}`}
          className={`text-gray-400 hover:bg-gray-100 rounded-lg transition-colors ${
            compact ? "p-1 text-xs" : "p-2 text-sm"
          }`}
          onClick={() => {
            navigateMonth("next")
            setTimeout(() => handleDateClick(day), 100)
          }}
        >
          {toKhmerNumber(day)}
        </button>
      )
    }

    return days
  }

  const formatSelectedDate = () => {
    if (!selectedDate) return ""
    const dayName = getKhmerDayName(selectedDate)
    const day = toKhmerNumber(selectedDate.getDate())
    const month = KHMER_MONTHS[selectedDate.getMonth()]
    const year = toKhmerNumber(selectedDate.getFullYear())
    return `ថ្ងៃ${dayName} ទី${day} ខែ${month} ឆ្នាំ${year}`
  }

  const getLunarDateInfo = (date: Date) => {
    const lunar = getLunarDate(date)
    return `ថ្ងៃទី ${toKhmerNumber(lunar.day)}កើត ខែ${lunar.month} ឆ្នាំ${lunar.year} ពុទ្ធស័ក ${toKhmerNumber(lunar.buddhistYear)}`
  }

  return (
    <Card className="bg-white rounded-2xl shadow-sm border-0">
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-[#0082c8] font-medium ${compact ? "text-xs" : "text-sm"}`}>
            កាលបរិច្ឆេទ
          </CardTitle>
        </div>
        <div className={`font-bold text-gray-900 ${compact ? "text-sm" : "text-lg"}`}>
          {formatSelectedDate() ||
            `${getKhmerDayName(today)} ទី${toKhmerNumber(today.getDate())} ខែ${KHMER_MONTHS[today.getMonth()]} ឆ្នាំ${toKhmerNumber(today.getFullYear())}`}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className={`text-[#0082c8] font-medium ${compact ? "text-xs" : "text-sm"}`}>
            {KHMER_MONTHS[currentMonth]} {toKhmerNumber(currentYear)}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 hover:bg-blue-50 ${compact ? "h-6 w-6" : "h-8 w-8"}`}
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className={`text-[#0082c8] ${compact ? "w-3 h-3" : "w-4 h-4"}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 hover:bg-blue-50 ${compact ? "h-6 w-6" : "h-8 w-8"}`}
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className={`text-[#0082c8] ${compact ? "w-3 h-3" : "w-4 h-4"}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {KHMER_DAYS_SHORT.map((day) => (
              <div
                key={day}
                className={`text-center text-[#0082c8] font-medium ${compact ? "p-1 text-xs" : "p-2 text-xs"}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
        </div>

        {/* Today's Info */}
        <div className={`border-t border-gray-100 ${compact ? "mt-2 pt-2" : "mt-4 pt-3"}`}>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">ថ្ងៃនេះ</span>
              <span className="text-[#0082c8] font-medium">
                ថ្ងៃ{getKhmerDayName(today)} ទី{toKhmerNumber(today.getDate())} ខែ{KHMER_MONTHS[today.getMonth()]} ឆ្នាំ{toKhmerNumber(today.getFullYear())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ត្រូវនឹង</span>
              <span className="text-[#0082c8] font-medium">
                {getLunarDateInfo(today)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ម៉ោង</span>
              <span className="text-[#0082c8] font-medium">
                {currentTime}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
