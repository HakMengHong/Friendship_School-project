"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Crown, BookOpen, ClipboardList, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { User as UserType } from "@/lib/auth-service"
import { SettingsToggle } from "@/components/ui/settings-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface TopBarProps {
  className?: string
  user?: UserType | null
}

export function TopBar({ className, user }: TopBarProps) {
  const pathname = usePathname()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  const pageTitle = useMemo(() => {
    const routes: Record<string, string> = {
      "/admin/dashboard": "ផ្ទាំងគ្រប់គ្រង",
      "/admin/dashboard/users": "ការគ្រប់គ្រងអ្នកប្រើប្រាស់",
      "/admin/users": "ការគ្រប់គ្រងអ្នកប្រើប្រាស់",
      "/admin/attendance": "អវត្តមានសិស្ស",
      "/admin/attendance/daily": "អវត្តមានសិស្សប្រចាំថ្ងៃ",
      "/admin/attendance/report": "របាយការណ៍អវត្តមានសិស្ស",
      "/admin/grade": "ពិន្ទុសិស្ស",
      "/admin/grade/addgrade": "បញ្ចូលពិន្ទុសិស្ស",
      "/admin/grade/report": "របាយការណ៍ពិន្ទុ",
      "/admin/grade/gradebook": "សៀវភៅតាមដាន",
      "/admin/student-info": "ព័ត៌មានសិស្ស",
      "/admin/student-info/list": "បញ្ជីឈ្មោះសិស្ស",
      "/admin/register-student": "ចុះឈ្មោះសិស្ស",
      "/teacher/dashboard": "ផ្ទាំងគ្រប់គ្រង",
      "/teacher/attendance": "អវត្តមានសិស្ស",
      "/teacher/attendance/daily": "អវត្តមានសិស្សប្រចាំថ្ងៃ",
      "/teacher/attendance/report": "របាយការណ៍អវត្តមានសិស្ស",
      "/teacher/grade": "ពិន្ទុសិស្ស",
      "/teacher/grade/addgrade": "បញ្ចូលពិន្ទុសិស្ស",
      "/teacher/grade/report": "របាយការណ៍ពិន្ទុ",
      "/teacher/grade/gradebook": "សៀវភៅតាមដាន",
      "/teacher/student-info": "ព័ត៌មានសិស្ស",
      "/teacher/student-info/list": "បញ្ជីឈ្មោះសិស្ស",
      "/teacher/register-student": "ចុះឈ្មោះសិស្ស",
    }
    return routes[pathname] || "ផ្ទាំងគ្រប់គ្រង"
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast({
        title: "ការស្វែងរក",
        description: `កំពុងស្វែងរក: "${searchQuery}"`,
      })
    }
  }

  const handleLogout = () => {
    // Clear user data from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
    }
    toast({
      title: "ចាកចេញ",
      description: "អ្នកបានចាកចេញដោយជោគជ័យ",
    })
    // Redirect to login
    window.location.href = "/login"
  }

  const handleProfileClick = () => {
    toast({
      title: "ព័ត៌មានផ្ទាល់ខ្លួន",
      description: "កំពុងបើកទំព័រព័ត៌មានផ្ទាល់ខ្លួន",
    })
  }

  return (
    <div className={`bg-gradient-to-r from-card via-card/95 to-card/90 border-b border-border p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm backdrop-blur-sm ${className}`}>
      {/* Left side - Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-1 truncate">
          {pageTitle}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
          សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងសាលា
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto">
        {/* Search - Responsive */}
        <div className="flex-1 md:w-80 max-w-xs">
          <form onSubmit={handleSearch} className="relative">
            <Input
              placeholder="ស្វែងរក..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="bg-gradient-to-r from-background via-background/95 to-background/90 border-primary/20 focus:border-primary focus:ring-primary/20 hover:from-background/80 hover:via-background/85 hover:to-background/75 transition-all duration-200 text-sm"
            />
          </form>
        </div>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary hover:to-primary/80 active:from-primary/90 active:to-primary/70 text-primary hover:text-white active:text-white shadow-sm hover:shadow-lg active:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group flex-shrink-0"
          onClick={() => toast({
            title: "ការជូនដំណឹង",
            description: "មិនមានការជូនដំណឹងថ្មីទេ",
          })}
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:text-white group-active:text-white/90 transition-colors duration-200" />
          <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs shadow-sm group-hover:shadow-md transition-all duration-200"></span>
        </Button>

        {/* Settings Toggle */}
        <SettingsToggle className="flex-shrink-0" />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile - Enhanced */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-4 border-l border-border hover:bg-primary/10 transition-all duration-200 group flex-shrink-0"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:from-primary/90 hover:to-primary/70 transition-all duration-200 truncate max-w-24 md:max-w-32">
                  {user ? `${user.lastname} ${user.firstname}` : "អ្នកប្រើប្រាស់"}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    {user?.position || (user?.role === 'admin' ? 'នាយក' : 'គ្រូបង្រៀន')}
                  </p>
                  {user?.role === 'admin' && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                  {user?.role === 'teacher' && (
                    <BookOpen className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 cursor-pointer group">
                <span className="group-hover:scale-110 transition-transform duration-200 text-sm md:text-base">
                  {user?.avatar || user?.firstname?.charAt(0) || "U"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>ព័ត៌មានផ្ទាល់ខ្លួន</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="w-4 h-4 mr-2" />
              <span>កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              <span>ការកំណត់</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              <span>ចាកចេញ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
