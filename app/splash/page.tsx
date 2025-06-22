"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SplashScreen() {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Progress animation - faster to reach 100% in 1 second
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10 // Increased from +2 to +10 for faster progress
      })
    }, 60)

    // Auto-redirect to login after 1 second
    const timer = setTimeout(() => {
      router.push("/login")
    }, 1000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0082c8] from-blue-500 to-blue-700 relative overflow-hidden">

      {/* Main content container */}
      <div className="flex flex-col items-center justify-center space-y-8 z-10">
        {/* Logo container with animation */}
        <div className="relative">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse p-2">
            <Image
              src="/logo.png"
              alt="School Management System Logo"
              width={112}
              height={112}
              className="rounded-full"
              priority
            />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-32 h-32 bg-white rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4">
          <h1 className="text-white text-4xl font-bold animate-fade-in">សួស្តី!</h1>
          <p className="text-white/90 text-xl">សូមស្វាគមន៍មកកាន់</p>
          <p className="text-white/70 text-sm">កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading text */}
        <p className="text-white/80 text-sm animate-pulse">កំពុងផ្ទុក... {progress}%</p>
      </div>

      {/* Skip button */}
      <button
        onClick={() => router.push("/login")}
        className="absolute bottom-8 right-8 text-white/70 hover:text-white text-sm underline transition-colors"
      >
        រំលង
      </button>
    </div>
  )
}
