"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { shouldShowSplash } from "@/lib/splash-preferences"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user should show splash screen
    if (shouldShowSplash()) {
    router.push("/splash")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-base text-muted-foreground dark:text-slate-400">កំពុងផ្ទុក...</p>
      </div>
    </div>
  )
}
