"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  ChevronLeft,
  LayoutDashboard,
  BarChart2,
  User,
  LogOut,
  Menu,
  ChevronDown,
  UserCheck,
  ClipboardList,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarMenuProps {
  className?: string
}

export function SidebarMenu({ className }: SidebarMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = useMemo(() => [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "ផ្ទាំងគ្រប់គ្រង",
      href: "/dashboard",
    },
    {
      id: "attendance",
      icon: UserCheck,
      label: "អវត្តមានសិស្ស",
      href: "/attendance",
      subItems: [
        { id: "daily-attendance", label: "អវត្តមានប្រចាំថ្ងៃ", href: "/attendance/daily" },
        { id: "attendance-report", label: "របាយការណ៍អវត្តមាន", href: "/attendance/report" },
      ],
    },
    {
      id: "grade",
      icon: BarChart2,
      label: "ពិន្ទុសិស្ស",
      href: "/grade",
      subItems: [
        { id: "add-grade", label: "បញ្ចូលពិន្ទុ", href: "/grade/addgrade" },
        { id: "grade-report", label: "របាយការណ៍ពិន្ទុ", href: "/grade/report" },
        { id: "record-book-report", label: "សៀវភៅតាមដាន", href: "/grade/gradebook" },
      ],
    },
    {
      id: "student-info",
      icon: User,
      label: "ព័ត៌មានសិស្ស",
      href: "/student-info",
      subItems: [
        { id: "student-list", label: "បញ្ជីឈ្មោះសិស្ស", href: "/student-info/list" },
      ],
    },
    {
      id: "register-student",
      icon: ClipboardList,
      label: "ចុះឈ្មេាះសិស្ស",
      href: "/register-student",
    },
  ], [])

  // Auto-open dropdown for active menu items
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems && (isActive(item.href) || hasActiveSubItem(item.subItems))) {
        if (!openDropdowns.includes(item.id)) {
          setOpenDropdowns((prev) => [...prev, item.id])
        }
      }
    })
  }, [pathname, menuItems, openDropdowns])

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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("username")
    router.push("/login")
  }, [router])

  const isActive = useCallback((href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }, [pathname])

  const hasActiveSubItem = useCallback((subItems?: { href: string }[]) => {
    return subItems?.some((subItem) => isActive(subItem.href)) ?? false
  }, [isActive])

  const isDropdownOpen = useCallback((itemId: string) => 
    openDropdowns.includes(itemId), [openDropdowns])

  return (
    <div
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out rounded-r-2xl m-2 shadow-soft sidebar",
        isCollapsed ? "w-[95px]" : "w-[240px]",
        className,
      )}
    >
      {/* Header with logo and school name */}
      <div className="flex items-center p-6 relative border-b border-border">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src="/logo.png" 
              alt="សាលាមិត្តភាព" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-icon');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <GraduationCap className="w-7 h-7 text-primary fallback-icon hidden" />
          </div>
          <div className={cn("ml-4 transition-opacity duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
              សាលាមិត្តភាព
            </h1>
            <p className="text-sm text-muted-foreground whitespace-nowrap">Friendship School</p>
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 bg-card rounded-full p-2 border border-border shadow-sm hover:bg-muted transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu size={18} strokeWidth={2} className="text-primary" />
          ) : (
            <ChevronLeft size={18} strokeWidth={2} className="text-primary" />
          )}
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="space-y-2 px-4">
          {menuItems.map((item) => {
            const active = isActive(item.href) || hasActiveSubItem(item.subItems)
            const hasSubItems = item.subItems && !isCollapsed

            return (
              <div key={item.id}>
                {/* Main menu item */}
                <div className="flex items-center">
                  <button
                    onClick={(e) => handleParentItemClick(item, e)}
                    className={cn(
                      "flex items-center flex-1 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/20",
                      active 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-muted-foreground",
                      isCollapsed && "justify-center px-3",
                    )}
                  >
                    <item.icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-primary"}`} />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="ml-3">{item.label}</span>
                        {hasSubItems && (
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200 chevron-icon",
                              isDropdownOpen(item.id) ? "rotate-180" : "",
                              active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-muted-foreground"
                            )}
                          />
                        )}
                      </div>
                    )}
                  </button>
                </div>

                {/* Dropdown submenu */}
                {hasSubItems && isDropdownOpen(item.id) && (
                  <div className="ml-8 mt-2 space-y-1 border-l-2 border-border pl-4 animate-fade-in">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavigation(subItem.href)}
                        className={cn(
                          "flex items-center w-full rounded-lg py-2 px-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
                          isActive(subItem.href)
                            ? "bg-primary text-primary-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-muted-foreground",
                        )}
                      >
                        <span>{subItem.label}</span>
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
      <div className="border-t border-border px-4 py-6">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "text-muted-foreground hover:bg-muted hover:text-muted-foreground",
            isCollapsed && "justify-center px-3",
          )}
        >
          <LogOut className="w-5 h-5 text-primary" />
          {!isCollapsed && <span className="ml-3">ចាកចេញ</span>}
        </button>
      </div>
    </div>
  )
}