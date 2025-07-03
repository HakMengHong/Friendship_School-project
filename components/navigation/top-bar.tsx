"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Settings, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMemo } from "react"
import { useTheme } from "next-themes"

interface TopBarProps {
  className?: string
  username?: string
}

export function TopBar({ className, username }: TopBarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const pageTitle = useMemo(() => {
    const routes: Record<string, string> = {
      "/dashboard": "ផ្ទាំងគ្រប់គ្រង",
      "/absence": "អវត្តមានសិស្ស",
      "/absence/daily": "អវត្តមានសិស្សប្រចាំថ្ងៃ",
      "/absence/report": "របាយការណ៍អវត្តមានសិស្ស",
      "/scores": "ពិន្ទុសិស្ស",
      "/scores/addscore": "បញ្ចូលពិន្ទុសិស្ស",
      "/scores/report": "របាយការណ៍ពិន្ទុ",
      "/scores/gradebook": "សៀវភៅតាមដាន",
      "/student-info": "ព័ត៌មានសិស្ស",
      "/student-info/list": "បញ្ជីឈ្មោះសិស្ស",
      "/registration": "ចុះឈ្មេាះសិស្ស",
    }
    return routes[pathname] || "ផ្ទាំងគ្រប់គ្រង"
  }, [pathname])

  return (
    <div className={`bg-card border-b border-border p-6 flex justify-between items-center shadow-sm ${className}`}>
      <div>
        <h1 className="text-primary text-2xl font-bold text-foreground">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងសាលា
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:block w-80">
          <Input
            placeholder="ស្វែងរក..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* User profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-primary text-sm font-bold text-foreground">{username}</p>
            <p className="text-xs text-muted-foreground">គ្រូបង្រៀន</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
            {username?.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  )
}
