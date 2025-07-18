import { useState, useEffect } from 'react'

export function useClientTime() {
  const [time, setTime] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      
      const period = hours >= 12 ? "ល្ងាច" : "ព្រឹក"
      const khmerHours = hours > 12 ? hours - 12 : hours
      
      // Convert to Khmer numbers
      const toKhmerNumber = (num: number): string => {
        const KHMER_NUMBERS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"]
        return num
          .toString()
          .split("")
          .map((digit) => KHMER_NUMBERS[parseInt(digit)])
          .join("")
      }
      
      const formattedTime = `${toKhmerNumber(khmerHours)}:${toKhmerNumber(minutes)}:${toKhmerNumber(seconds)} ${period}`
      setTime(formattedTime)
    }
    
    updateTime()
    const timer = setInterval(updateTime, 1000)
    
    return () => clearInterval(timer)
  }, [])

  return { time, isClient }
} 