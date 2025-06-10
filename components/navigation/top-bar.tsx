"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"

interface TopBarProps {
  className?: string
  username?: string
}

export function TopBar({ className, username }: TopBarProps) {
  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "ផ្ទាំងគ្រប់គ្រង"
      case "/schedule":
        return "កាលវិភាគសិស្ស"
      case "/scores":
        return "ពិន្ទុសិស្ស"
      case "/grades":
        return "ពិន្ទុតាមមុខវិជ្ជា"
      case "/subjects":
        return "មុខវិជ្ជា"
      case "/student-info":
        return "ព័ត៌មានសិស្ស"
      case "/registration":
        return "ចុះឈ្មោះសិស្ស"
      default:
        return "ផ្ទាំងគ្រប់គ្រង"
    }
  }

  return (
    <div className={`border-b border-white/20 p-5 flex justify-between items-center ${className}`}>
      <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>

      {/* User profile */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-base font-medium text-white">{username || "ហាក់ ម៉េងហុង"}</p>
          <p className="text-sm text-white/90">គ្រូបង្រៀន</p>
        </div>
        <div className="bg-white/20 rounded-full p-1 backdrop-blur-sm">
          <Image src="/logo.png" alt="User Profile" width={40} height={40} className="rounded-full" />
        </div>
      </div>
    </div>
  )
}
