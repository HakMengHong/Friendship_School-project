"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Sparkles, Loader2, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden font-khmer transition-all duration-500">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-40 animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/80 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-indigo-400/50 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-cyan-400/70 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-bounce delay-1200"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce delay-800"></div>
      </div>

      {/* Enhanced Main content container */}
      <div className="flex flex-col items-center justify-center space-y-12 z-10">
        {/* Enhanced Logo container with animation */}
        <div className="relative group">
          <div className="w-40 h-40 bg-gradient-to-br from-white/95 via-blue-50/95 to-indigo-100/95 dark:from-white/90 dark:via-slate-800/90 dark:to-slate-700/90 rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-3xl overflow-hidden transition-all duration-500 hover:scale-110 border border-white/20 dark:border-slate-600/30">
            <img 
              src="/logo.png" 
              alt="សាលាមិត្តភាព" 
              className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-icon');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <GraduationCap className="w-20 h-20 text-blue-600 dark:text-blue-400 fallback-icon hidden group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
          </div>
          {/* Enhanced ripple effects */}
          <div className="absolute inset-0 w-40 h-40 bg-white/30 rounded-3xl animate-ping opacity-20"></div>
          <div className="absolute inset-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          {/* Glow effect */}
          <div className="absolute inset-0 w-40 h-40 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
        </div>

        {/* Enhanced Text content */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              សួស្តី!
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse delay-300" />
          </div>
          <div className="space-y-3">
            <p className="text-white/95 text-3xl font-semibold leading-relaxed">សូមស្វាគមន៍មកកាន់</p>
            <p className="text-white/80 text-2xl font-medium leading-relaxed">កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស</p>
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full mx-auto opacity-60"></div>
        </div>

        {/* Enhanced Progress bar */}
        <div className="w-80 space-y-4">
          <div className="relative bg-white/10 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-100 ease-out shadow-lg relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          {/* Enhanced Loading text */}
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-white/80 animate-spin" />
            <p className="text-white/90 text-lg font-medium animate-pulse">កំពុងផ្ទុក... {progress}%</p>
          </div>
        </div>
      </div>

      {/* Enhanced Skip button */}
      <button
        onClick={handleSkipSplash}
        className="absolute bottom-8 right-8 text-white/80 hover:text-white text-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl hover:shadow-xl border border-white/20 hover:border-white/30 group"
      >
        <span>រំលង</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        <span className="text-sm opacity-70 hidden sm:inline">(ជ្រើសរើសដើម្បីរំលងក្នុងពេលក្រោយ)</span>
      </button>
    </div>
  )
}