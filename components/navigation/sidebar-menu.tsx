"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import {
  Printer,
  ChevronLeft,
  LayoutDashboard,
  BarChart2,
  User,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
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

  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "ផ្ទាំងគ្រប់គ្រង",
      href: "/dashboard",
    },
    {
      id: "absence",
      icon: UserCheck,
      label: "អវត្តមានសិស្ស",
      href: "/absence",
      subItems: [
        { id: "daily-absence", label: "អវត្តមានប្រចាំថ្ងៃ", href: "/absence/daily" },
        { 
        id: "absence-report", label: "របាយការណ៍អវត្តមាន", href: "/absence/report" },
      ],
    },
    {
      id: "scores",
      icon: BarChart2,
      label: "ពិន្ទុសិស្ស",
      href: "/scores",
      subItems: [
        { id: "add-scores", label: "បញ្ចូលពិន្ទុ", href: "/scores/addscore" },
        { id: "scores-report", label: "របាយការណ៍ពិន្ទុ", href: "/scores/report" },
        { id: "record-book-report", label: "សៀវភៅតាមដាន", href: "/scores/gradebook" },
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
      id: "registration",
      icon: ClipboardList,
      label: "ចុះឈ្មេាះសិស្ស",
      href: "/registration",
    },
  ]

  useEffect(() => {
    // Auto-open dropdown for active menu items on mount
    menuItems.forEach((item) => {
      if (item.subItems && (isActive(item.href) || hasActiveSubItem(item.subItems))) {
        if (!openDropdowns.includes(item.id)) {
          setOpenDropdowns((prev) => [...prev, item.id])
        }
      }
    })
  }, [pathname])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
    // Close all dropdowns when collapsing
    if (!isCollapsed) {
      setOpenDropdowns([])
    }
  }

  const toggleDropdown = (itemId: string) => {
    if (isCollapsed) return // Don't allow dropdown in collapsed mode

    setOpenDropdowns((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleParentItemClick = (item: typeof menuItems[0], e: React.MouseEvent) => {
    // Check if the click was on the chevron icon
    const isChevronClick = (e.target as HTMLElement).closest('.chevron-icon') !== null
    
    if (item.subItems && !isCollapsed && isChevronClick) {
      // Only toggle dropdown if clicking on the chevron icon
      toggleDropdown(item.id)
    } else if (!item.subItems || isCollapsed) {
      // Navigate to the parent href if:
      // 1. It's a simple item without sub-items
      // 2. The sidebar is collapsed
      handleNavigation(item.href)
    }
    // If it's a parent item with sub-items and sidebar is expanded, but not clicking on chevron,
    // just navigate without toggling dropdown
    else {
      handleNavigation(item.href)
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    // Clear stored username
    localStorage.removeItem("username")
    router.push("/login")
  }

  // Check if a menu item is active (including its sub-items)
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Check if any sub-item is active to highlight the parent
  const hasActiveSubItem = (subItems?: { href: string }[]) => {
    return subItems?.some((subItem) => isActive(subItem.href)) ?? false
  }

  const isDropdownOpen = (itemId: string) => openDropdowns.includes(itemId)

  return (
    <div
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out rounded-r-2xl m-2 shadow-soft",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        className,
      )}
    >
      {/* Header with logo and school name */}
      <div className="flex items-center p-6 relative border-b border-border">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className={cn("ml-4 transition-opacity duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            <h1 className="text-[#0082c8] text-xl font-bold whitespace-nowrap">សាលាមិត្តភាព</h1>
            <p className="text-sm text-muted-foreground whitespace-nowrap">Friendship School</p>
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 bg-card rounded-full p-2 border border-border shadow-sm hover:bg-muted transition-all duration-300 z-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu size={18} strokeWidth={2} className="text-[#0082c8]" />
          ) : (
            <ChevronLeft size={18} strokeWidth={2} className="text-[#0082c8]" />
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
                      "flex items-center flex-1 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 group",
                      active 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-foreground hover:bg-muted hover:text-foreground",
                      isCollapsed && "justify-center px-3",
                    )}
                  >
                    <item.icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-[#0082c8]"}`} />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="ml-3">{item.label}</span>
                        {hasSubItems && (
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200 chevron-icon",
                              isDropdownOpen(item.id) ? "rotate-180" : "",
                              active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                        )}
                      </div>
                    )}
                  </button>
                </div>

                {/* Dropdown submenu */}
                {hasSubItems && isDropdownOpen(item.id) && (
                  <div className="ml-8 mt-2 space-y-1 border-l-2 border-border pl-4">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavigation(subItem.href)}
                        className={cn(
                          "flex items-center w-full rounded-lg py-2 px-3 text-sm transition-all duration-200",
                          isActive(subItem.href)
                            ? "bg-primary text-[#0082c8] font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
            "flex items-center w-full rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200",
            "text-foreground hover:bg-muted hover:text-foreground",
            isCollapsed && "justify-center px-3",
          )}
        >
          <LogOut className="w-5 h-5 text-[#0082c8]" />
          {!isCollapsed && <span className="ml-3">ចាកចេញ</span>}
        </button>
      </div>
    </div>
  )
}