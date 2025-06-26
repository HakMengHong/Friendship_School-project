"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Settings } from "lucide-react"
import { ModernButton } from "@/components/ui/modern-button"
import { ModernInput } from "@/components/ui/modern-input"

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
        return "បញ្ជីឈ្មោះសិស្ស"

      case "/registration":
        return "ចុះឈ្មេាះសិស្ស"
        
      default:
        return "ផ្ទាំងគ្រប់គ្រង"
    }
  }

  return (
    <div className={`bg-card border-b border-border p-6 flex justify-between items-center shadow-sm ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងសាលា
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:block w-80">
          <ModernInput
            placeholder="ស្វែងរក..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Notifications */}
        <ModernButton variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
        </ModernButton>

        {/* Settings */}
        <ModernButton variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </ModernButton>

        {/* User profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{username || "ហាក់ ម៉េងហុង"}</p>
            <p className="text-xs text-muted-foreground">គ្រូបង្រៀន</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
            {(username || "ហាក់ ម៉េងហុង").charAt(0)}
          </div>
        </div>
      </div>
    </div>
  )
}