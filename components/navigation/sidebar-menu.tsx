"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import {
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
      id: "attendance",
      icon: UserCheck,
      label: "វត្តមានសិស្ស",
      href: "/attendance",
      subItems: [
        { id: "daily-attendance", label: "វត្តមានប្រចាំថ្ងៃ", href: "/attendance/daily" },
        { id: "monthly-attendance", label: "វត្តមានប្រចាំខែ", href: "/attendance/monthly" },
        { id: "attendance-report", label: "របាយការណ៍វត្តមាន", href: "/attendance/report" },
      ],
    },
    {
      id: "scores",
      icon: BarChart2,
      label: "ពិន្ទុសិស្ស",
      href: "/scores",
      subItems: [
        { id: "exam-scores", label: "ពិន្ទុប្រលង", href: "/scores/exam" },
        { id: "assignment-scores", label: "ពិន្ទុកិច្ចការ", href: "/scores/assignment" },
        { id: "final-scores", label: "ពិន្ទុចុងក្រោយ", href: "/scores/final" },
      ],
    },
    {
      id: "student-info",
      icon: User,
      label: "ព័ត៌មានសិស្ស",
      href: "/student-info",
      subItems: [
        { id: "student-list", label: "បញ្ជីសិស្ស", href: "/student-info/list" },
        { id: "student-profile", label: "ប្រវត្តិរូបសិស្ស", href: "/student-info/profile" },
        { id: "student-documents", label: "ឯកសារសិស្ស", href: "/student-info/documents" },
      ],
    },
    {
      id: "registration",
      icon: ClipboardList,
      label: "ចុះឈ្មេាះសិស្ស",
      href: "/registration",
      subItems: [
        { id: "new-registration", label: "ចុះឈ្មេាះថ្មី", href: "/registration/new" },
        { id: "registration-review", label: "ពិនិត្យការចុះឈ្មេាះ", href: "/registration/review" },
        { id: "registration-history", label: "ប្រវត្តិការចុះឈ្មេាះ", href: "/registration/history" },
      ],
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
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out rounded-[20px] m-[10px]",
        isCollapsed ? "w-[92px]" : "w-[240px]",
        className,
      )}
    >
      {/* Header with logo and school name */}
      <div className="flex items-center p-5 relative border-b border-gray-200">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Friendship School Logo"
            width={45}
            height={45}
            className="rounded-full border-2 border-[#0082c8]"
          />
          <div className={cn("ml-3 transition-opacity duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            <h1 className="text-[#0082c8] text-xl font-bold whitespace-nowrap">សាលាមិត្តភាព</h1>
            <p className="text-sm text-gray-600 whitespace-nowrap">Friendship School</p>
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-7 bg-white rounded-full p-2 border border-gray-200 shadow-md hover:bg-gray-50 transition-all duration-300 z-10"
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
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-4">
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
                      "flex items-center flex-1 rounded-lg py-3 px-4 text-base transition-colors duration-200 group",
                      active ? "bg-[#0082c8] text-white font-medium" : "text-gray-700 hover:bg-gray-100 font-normal",
                      isCollapsed && "justify-center px-3",
                    )}
                  >
                    <item.icon className={`w-6 h-6 ${active ? "text-white" : "text-[#0082c8]"}`} />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="ml-3">{item.label}</span>
                        {hasSubItems && (
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200 chevron-icon",
                              isDropdownOpen(item.id) ? "rotate-180" : "",
                              active ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                            )}
                          />
                        )}
                      </div>
                    )}
                  </button>
                </div>

                {/* Dropdown submenu */}
                {hasSubItems && isDropdownOpen(item.id) && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavigation(subItem.href)}
                        className={cn(
                          "flex items-center w-full rounded-lg py-2 px-3 text-sm transition-colors duration-200",
                          isActive(subItem.href)
                            ? "bg-[#0082c8] text-white font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
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
      <div className="border-t border-gray-200 px-4 py-5">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full rounded-lg py-3 px-4 text-base transition-colors duration-200",
            "text-gray-700 hover:bg-gray-100 font-normal",
            isCollapsed && "justify-center px-3",
          )}
        >
          <LogOut className="w-6 h-6 text-[#0082c8]" />
          {!isCollapsed && <span className="ml-3">ចាកចេញ</span>}
        </button>
      </div>
    </div>
  )
}
