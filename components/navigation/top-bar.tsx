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
      case "/absence":
        return "អវត្តមានសិស្ស"
      case "/absence/daily":
        return "អវត្តមានសិស្សប្រចាំថ្ងៃ"
      case "/absence/report":
        return "របាយការណ៍អវត្តមានសិស្ស"

      case "/scores":
        return "ពិន្ទុសិស្ស"
      case "/scores/addscore":
        return "បញ្ចូលពិន្ទុសិស្ស"
      case "/scores/report":
        return "របាយការណ៍ពិន្ទុ"
      case "/scores/gradebook":
        return "សៀវភៅតាមដាន"

      case "/student-info":
        return "ព័ត៌មានសិស្ស"
      case "/student-info/list":
        return "បញ្ញីឈ្មោះសិស្ស"

      case "/registration":
        return "ចុះឈ្មេាះសិស្ស"
        
      default:
        return "ផ្ទាំងគ្រប់គ្រង"
    }
  }

  return (
    <div className={`border-b border-white/20 p-5 flex justify-between items-center ${className}`}>
      <h1 className="text-2xl font-semibold text-white">{getPageTitle()}</h1>

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
