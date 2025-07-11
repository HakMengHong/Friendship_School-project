"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMemo } from "react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface TopBarProps {
  className?: string
  username?: string
}

export function TopBar({ className, username }: TopBarProps) {
  const pathname = usePathname()

  const pageTitle = useMemo(() => {
    const routes: Record<string, string> = {
      "/dashboard": "ផ្ទាំងគ្រប់គ្រង",
      "/attendance": "អវត្តមានសិស្ស",
      "/attendance/daily": "អវត្តមានសិស្សប្រចាំថ្ងៃ",
      "/attendance/report": "របាយការណ៍អវត្តមានសិស្ស",
      "/grade": "ពិន្ទុសិស្ស",
      "/grade/addgrade": "បញ្ចូលពិន្ទុសិស្ស",
      "/grade/report": "របាយការណ៍ពិន្ទុ",
      "/grade/gradebook": "សៀវភៅតាមដាន",
      "/student-info": "ព័ត៌មានសិស្ស",
      "/student-info/list": "បញ្ជីឈ្មោះសិស្ស",
      "/register-student": "ចុះឈ្មេាះសិស្ស",
    }
    return routes[pathname] || "ផ្ទាំងគ្រប់គ្រង"
  }, [pathname])

  return (
    <div className={`bg-gradient-to-r from-card via-card/95 to-card/90 border-b border-border p-6 flex justify-between items-center shadow-sm backdrop-blur-sm ${className}`}>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-1">
          {pageTitle}
        </h1>
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
            className="bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200"
          />
        </div>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary hover:to-primary/80 active:from-primary/90 active:to-primary/70 text-primary hover:text-white active:text-white shadow-sm hover:shadow-lg active:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group"
        >
          <Bell className="w-5 h-5 text-primary group-hover:text-white group-active:text-white/90 transition-colors duration-200" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs shadow-sm group-hover:shadow-md transition-all duration-200"></span>
        </Button>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary hover:to-primary/80 active:from-primary/90 active:to-primary/70 text-primary hover:text-white active:text-white shadow-sm hover:shadow-lg active:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group"
        >
          <Settings className="w-5 h-5 text-primary group-hover:text-white group-active:text-white/90 transition-colors duration-200" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:from-primary/90 hover:to-primary/70 transition-all duration-200">
              {username}
            </p>
            <p className="text-xs text-muted-foreground">គ្រូបង្រៀន</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 cursor-pointer group">
            <span className="group-hover:scale-110 transition-transform duration-200">
            {username?.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
