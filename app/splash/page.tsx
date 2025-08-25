"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap } from "lucide-react"
import { getSplashPreferences, setSplashSeen, setSkipSplash, shouldShowSplash } from "@/lib/splash-preferences"

export default function SplashScreen() {
  const [progress, setProgress] = useState(0)
  const [skipSplash, setSkipSplash] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user should skip splash based on preferences
    const preferences = getSplashPreferences()
    
    if (preferences.hasSeenSplash && preferences.skipSplash) {
      router.push("/login")
      return
    }

    // Progress animation - faster to reach 100% in 800ms
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 12.5 // Increased from +10 to +12.5 for faster progress (100% in 800ms)
      })
    }, 50) // Reduced from 60ms to 50ms for faster animation

    // Auto-redirect to login after 800ms (reduced from 1000ms)
    const timer = setTimeout(() => {
      // Mark that user has seen splash
      setSplashSeen()
      router.push("/login")
    }, 800)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [router])

  const handleSkipSplash = () => {
    // Save user preference to skip splash in future
    setSkipSplash(true)
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden font-khmer transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl dark:bg-white/5"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl dark:bg-white/3"></div>

      {/* Main content container */}
      <div className="flex flex-col items-center justify-center space-y-8 z-10">
        {/* Logo container with animation */}
        <div className="relative">
          <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-pulse overflow-hidden">
            <img 
              src="/logo.png" 
              alt="សាលាមិត្តភាព" 
              className="w-20 h-20 object-contain"
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-icon');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <GraduationCap className="w-16 h-16 text-primary fallback-icon hidden" />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-32 h-32 bg-white rounded-2xl animate-ping opacity-20"></div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white/90 animate-fade-in">
            សួស្តី!
          </h1>
          <p className="text-white/90 text-xl font-medium">សូមស្វាគមន៍មកកាន់</p>
          <p className="text-white/70 text-lg">កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស</p>
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

      {/* Skip button with improved styling */}
      <button
        onClick={handleSkipSplash}
        className="absolute bottom-8 right-8 text-white/70 hover:text-white text-sm underline transition-colors hover:scale-105 transform flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20"
      >
        រំលង
        <span className="text-xs opacity-70">(ជ្រើសរើសដើម្បីរំលងក្នុងពេលក្រោយ)</span>
      </button>
    </div>
  )
}