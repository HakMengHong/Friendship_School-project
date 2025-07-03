'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap } from "lucide-react"

export default function SplashScreen() {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Animate progress bar quickly to 100%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 60)

    // Redirect after 1 second
    const timer = setTimeout(() => {
      router.push("/login")
    }, 1000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden font-khmer">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

      {/* Main splash content */}
      <div className="flex flex-col items-center justify-center space-y-8 z-10">
        {/* Logo with ripple */}
        <div className="relative">
          <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <GraduationCap className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute inset-0 w-32 h-32 bg-white rounded-2xl animate-ping opacity-20"></div>
        </div>

        {/* Text section */}
        <div className="text-center space-y-4">
          <h1 className="text-white text-4xl font-bold animate-fade-in">សួស្តី!</h1>
          <p className="text-white/90 text-xl">សូមស្វាគមន៍មកកាន់</p>
          <p className="text-white/70 text-lg">កម្មវិធីគ្រប់គ្រងពិន្ទុសិស្ស</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-white rounded-full transition-all duration-100 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading text */}
        <p className="text-white/80 text-sm animate-pulse">កំពុងផ្ទុក... {progress}%</p>
      </div>

      {/* Skip button */}
      <button
        onClick={() => router.push("/login")}
        className="absolute bottom-8 right-8 text-white/70 hover:text-white text-sm underline transition-colors hover:scale-105 transform"
      >
        រំលង
      </button>
    </div>
  )
}
