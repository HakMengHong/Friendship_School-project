"use client"

import { useState } from "react"
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

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    // Clear stored username
    localStorage.removeItem("username")
    router.push("/login")
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")
  const isDropdownOpen = (itemId: string) => openDropdowns.includes(itemId)

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out rounded-[20px] m-[10px]",
        isCollapsed ? "w-[92px]" : "w-[280px]",
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
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Main menu item */}
              <div className="flex items-center">
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "flex items-center flex-1 rounded-lg py-3 px-4 text-base transition-colors duration-200",
                    isActive(item.href)
                      ? "bg-[#0082c8] text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100 font-normal",
                    isCollapsed && "justify-center px-3",
                  )}
                >
                  <item.icon className={`w-6 h-6 ${isActive(item.href) ? "text-white" : "text-[#0082c8]"}`} />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </button>

                {/* Dropdown toggle button */}
                {item.subItems && !isCollapsed && (
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors duration-200 ml-1",
                      isActive(item.href) ? "text-white hover:bg-white/20" : "text-gray-500 hover:bg-gray-100",
                    )}
                  >
                    {isDropdownOpen(item.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Dropdown submenu */}
              {item.subItems && !isCollapsed && isDropdownOpen(item.id) && (
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleNavigation(subItem.href)}
                      className={cn(
                        "flex items-center w-full rounded-lg py-2 px-3 text-sm transition-colors duration-200",
                        isActive(subItem.href)
                          ? "bg-blue-50 text-[#0082c8] font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
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
