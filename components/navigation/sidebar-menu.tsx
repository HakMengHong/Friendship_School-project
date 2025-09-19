"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  ChevronLeft,
  LayoutDashboard,
  BarChart2,
  User as UserIcon,
  LogOut,
  Menu,
  ChevronDown,
  UserCheck,
  ClipboardList,
  GraduationCap,
  UserPlus,
  Sparkles,
  Zap,
  Shield,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentUser, logout, User, isAdmin, isTeacher } from "@/lib/auth-service"

interface SidebarMenuProps {
  className?: string
}

export function SidebarMenu({ className }: SidebarMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  const menuItems = useMemo(() => {
    const baseItems = [
      // Admin Dashboard
      {
        id: "admin-dashboard",
        icon: LayoutDashboard,
        label: "ផ្ទាំងគ្រប់គ្រង",
        href: "/dashboard",
        requiredRole: "admin" as const,
        badge: "Admin",
        subItems: [
          { id: "admin-users", label: "គ្រប់គ្រងអ្នកប្រើប្រាស់", href: "/dashboard/users", icon: Shield },
          { id: "admin-academic", label: "ការគ្រប់គ្រងថ្នាក់", href: "/dashboard/academic-management", icon: BookOpen },
          { id: "admin-add-student-class", label: "បន្ថែមសិស្សទៅក្នុងថ្នាក់", href: "/dashboard/add-student-class", icon: UserPlus },
          { id: "admin-view-student-class", label: "មើលថ្នាក់រៀន", href: "/dashboard/view-student-class", icon: BookOpen },
          { id: "admin-id-cards", label: "ប័ណ្ណសម្គាល់", href: "/dashboard/id-cards", icon: UserIcon },
        ],
      },
      // Admin Attendance
      {
        id: "admin-attendance",
        icon: UserCheck,
        label: "អវត្តមានសិស្ស",
        href: "/attendance",
        requiredRole: "admin" as const,
        badge: "Live",
        subItems: [
          { id: "admin-attendance-daily", label: "អវត្តមានប្រចាំថ្ងៃ", href: "/attendance/daily", icon: Zap },
          { id: "admin-attendance-report", label: "របាយការណ៍អវត្តមាន", href: "/attendance/report", icon: BarChart2 },
        ],
      },
      // Admin Grade
      {
        id: "admin-grade",
        icon: BarChart2,
        label: "ពិន្ទុសិស្ស",
        href: "/grade",
        requiredRole: "admin" as const,
        badge: "Analytics",
        subItems: [
          { id: "admin-add-grade", label: "បញ្ចូលពិន្ទុសិស្ស", href: "/grade/addgrade", icon: Zap },
          { id: "admin-grade-report", label: "របាយការណ៍ពិន្ទុ", href: "/grade/report", icon: BarChart2 },
          { id: "admin-grade-gradebook", label: "សៀវភៅតាមដាន", href: "/grade/gradebook", icon: BookOpen },
        ],
      },
      // Admin Student Info
      {
        id: "admin-student-info",
        icon: UserIcon,
        label: "ព័ត៌មានសិស្ស",
        href: "/student-info",
        requiredRole: "admin" as const,
        badge: "Data",
        subItems: [
          { id: "admin-student-info-list", label: "បញ្ជីឈ្មោះសិស្ស", href: "/student-info/list", icon: UserIcon },
        ],
      },
      // Admin Register Student
      {
        id: "admin-register-student",
        icon: ClipboardList,
        label: "ចុះឈ្មោះសិស្ស",
        href: "/register-student",
        requiredRole: "admin" as const,
        badge: "New",
      },

      // Teacher Attendance
      {
        id: "teacher-attendance",
        icon: UserCheck,
        label: "អវត្តមានប្រចាំថ្ងៃ",
        href: "/attendance/daily",
        requiredRole: "teacher" as const,
        badge: "Live",
      },
      // Teacher Grade
      {
        id: "teacher-grade",
        icon: BarChart2,
        label: "ពិន្ទុសិស្ស",
        href: "/grade/addgrade",
        requiredRole: "teacher" as const,
        badge: "Analytics",
        subItems: [
          { id: "teacher-grade-report", label: "របាយការណ៍ពិន្ទុ", href: "/grade/report", icon: BarChart2 }
        ],
      },
      // Teacher Student Info
      {
        id: "teacher-student-info",
        icon: UserIcon,
        label: "ព័ត៌មានសិស្ស",
        href: "/student-info",
        requiredRole: "teacher" as const,
        badge: "Data",
      },
      // Teacher Register Student
      {
        id: "teacher-register-student",
        icon: ClipboardList,
        label: "ចុះឈ្មោះសិស្ស",
        href: "/register-student",
        requiredRole: "teacher" as const,
        badge: "New",
      },
    ]

    // Filter menu items based on user role
    return baseItems.filter(item => {
      if (item.requiredRole === 'admin') return isAdmin(currentUser)
      if (item.requiredRole === 'teacher') return isTeacher(currentUser)
      return false
    })
  }, [currentUser])

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed)
    if (!isCollapsed) {
      setOpenDropdowns([])
    }
  }, [isCollapsed])

  const toggleDropdown = useCallback((itemId: string) => {
    if (isCollapsed) return
    setOpenDropdowns((prev) => 
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId) 
        : [...prev, itemId]
    )
  }, [isCollapsed])

  const handleParentItemClick = useCallback((item: typeof menuItems[0], e: React.MouseEvent) => {
    const isChevronClick = (e.target as HTMLElement).closest('.chevron-icon') !== null
    
    if (item.subItems && !isCollapsed && isChevronClick) {
      toggleDropdown(item.id)
    } else if (!item.subItems || isCollapsed) {
      handleNavigation(item.href)
    } else {
      handleNavigation(item.href)
    }
  }, [isCollapsed, toggleDropdown])

  const handleNavigation = useCallback((href: string) => {
    router.push(href)
  }, [router])

  const isActive = useCallback((href: string) => {
    return pathname === href || (pathname && pathname.startsWith(`${href}/`))
  }, [pathname])

  const hasActiveSubItem = useCallback((subItems?: { href: string }[]) => {
    return subItems?.some((subItem) => isActive(subItem.href)) ?? false
  }, [isActive])

  const isDropdownOpen = useCallback((itemId: string) => 
    openDropdowns.includes(itemId), [openDropdowns])

  const handleLogout = useCallback(() => {
    logout()
    router.push("/login")
  }, [router])

  // Auto-open dropdown for active menu items
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems && (isActive(item.href) || hasActiveSubItem(item.subItems))) {
        if (!openDropdowns.includes(item.id)) {
          setOpenDropdowns((prev) => [...prev, item.id])
        }
      }
    })
  }, [pathname, menuItems, openDropdowns, isActive, hasActiveSubItem])

  return (
    <div
      className={cn(
        "bg-gradient-to-b from-card via-card/95 to-card/90 backdrop-blur-xl border-r border-border/50 flex flex-col transition-all duration-500 ease-out rounded-r-3xl m-2 shadow-2xl sidebar",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-primary/10 before:rounded-r-3xl before:pointer-events-none",
        isCollapsed ? "w-[100px]" : "w-[280px]",
        className,
      )}
    >
      {/* Header with logo and school name */}
      <div className="flex items-center p-6 relative border-b border-border/30">
        <div className="flex items-center">
          <div className="relative w-14 h-14 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <img 
              src="/logo.png" 
              alt="សាលាមិត្តភាព" 
              className="w-9 h-9 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-icon');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <GraduationCap className="w-8 h-8 text-white fallback-icon hidden relative z-10" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className={cn("ml-5 transition-all duration-500 ease-out", isCollapsed ? "opacity-0 w-0 scale-95" : "opacity-100 scale-100")}>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent whitespace-nowrap">
              សាលាមិត្តភាព
            </h1>
            <p className="text-sm text-muted-foreground/80 whitespace-nowrap font-medium">Friendship School</p>
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-4 top-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-2.5 border border-border/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-primary/30 group"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu size={20} strokeWidth={2.5} className="text-primary group-hover:text-primary/80 transition-colors" />
          ) : (
            <ChevronLeft size={20} strokeWidth={2.5} className="text-primary group-hover:text-primary/80 transition-colors" />
          )}
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <div className="space-y-1 px-4">
          {menuItems.map((item) => {
            const active = isActive(item.href) || hasActiveSubItem(item.subItems)
            const hasSubItems = item.subItems && !isCollapsed

            return (
              <div key={item.id} className="relative">
                {/* Main menu item */}
                <div className="flex items-center">
                  <button
                    onClick={(e) => handleParentItemClick(item, e)}
                    className={cn(
                      "relative flex items-center flex-1 rounded-2xl py-3.5 px-4 text-base font-semibold transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/30",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      active 
                        ? "bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-white shadow-xl shadow-primary/25" 
                        : "text-muted-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 hover:text-foreground hover:shadow-md",
                      isCollapsed && "justify-center px-3",
                    )}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                    )}
                    
                    <div className={cn("relative", active && "animate-pulse")}>
                      <item.icon className={`w-5 h-5 transition-all duration-300 ${active ? "text-white drop-shadow-sm" : "text-primary group-hover:text-primary/80"}`} />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full ml-3">
                        <span className="truncate">{item.label}</span>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300",
                              active 
                                ? "bg-white/20 text-white" 
                                : "bg-primary/10 text-primary group-hover:bg-primary/20"
                            )}>
                              {item.badge}
                            </span>
                          )}
                          {hasSubItems && (
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-all duration-300 chevron-icon",
                                isDropdownOpen(item.id) ? "rotate-180" : "",
                                active ? "text-white/80" : "text-muted-foreground group-hover:text-foreground"
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                </div>

                {/* Dropdown submenu */}
                {hasSubItems && isDropdownOpen(item.id) && (
                  <div className="ml-6 mt-3 space-y-1 border-l-2 border-gradient-to-b from-primary/30 via-primary/20 to-transparent pl-4 animate-fade-in">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavigation(subItem.href)}
                        className={cn(
                          "flex items-center w-full rounded-xl py-2.5 px-3 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 group",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          isActive(subItem.href)
                            ? "bg-gradient-to-r from-primary/90 to-primary/80 text-white font-semibold shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:bg-gradient-to-r hover:from-muted/40 hover:to-muted/20 hover:text-foreground hover:shadow-sm",
                        )}
                      >
                        {subItem.icon && (
                          <subItem.icon className={cn(
                            "w-4 h-4 mr-3 transition-all duration-300",
                            isActive(subItem.href) 
                              ? "text-white/90" 
                              : "text-muted-foreground group-hover:text-primary/80"
                          )} />
                        )}
                        <span className="truncate">{subItem.label}</span>
                        {isActive(subItem.href) && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Bottom menu items */}
      <div className="border-t border-border/30 px-4 py-6 bg-gradient-to-t from-muted/20 to-transparent">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full rounded-2xl py-3.5 px-4 text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 group",
            "hover:scale-[1.02] active:scale-[0.98]",
            "text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-700 hover:shadow-lg hover:shadow-red-500/10",
            "dark:text-red-400 dark:hover:from-red-900/20 dark:hover:to-red-800/10 dark:hover:text-red-300",
            isCollapsed && "justify-center px-3",
          )}
        >
          <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300 transition-colors" />
          {!isCollapsed && (
            <span className="ml-3 group-hover:translate-x-0.5 transition-transform duration-300">
              ចាកចេញ
            </span>
          )}
        </button>
      </div>
    </div>
  )
}