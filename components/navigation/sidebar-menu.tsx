"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import {
  ChevronLeft,
  LayoutDashboard,
  Calendar,
  BarChart2,
  Users,
  User,
  LogOut,
  Menu,
  Award,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarMenuProps {
  className?: string
}

export function SidebarMenu({ className }: SidebarMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "ផ្ទាំងគ្រប់គ្រង", href: "/dashboard" },
    { id: "schedule", icon: Calendar, label: "កាលវិភាគសិស្ស", href: "/schedule" },
    { id: "scores", icon: BarChart2, label: "ពិន្ទុសិស្ស", href: "/scores" },
    { id: "grades", icon: Award, label: "ពិន្ទុតាមមុខវិជ្ជា", href: "/grades" },
    { id: "subjects", icon: BookOpen, label: "មុខវិជ្ជា", href: "/subjects" },
    { id: "student-info", icon: User, label: "ព័ត៌មានសិស្ស", href: "/student-info" },
    { id: "registration", icon: Users, label: "ចុះឈ្មោះសិស្ស", href: "/registration" },
  ]

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    router.push("/login")
  }

  const isActive = (href: string) => pathname === href

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out rounded-[20px] m-[10px]",
        isCollapsed ? "w-[92px]" : "w-[260px]",
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
        <div className="space-y-2 px-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "flex items-center w-full rounded-lg py-3 px-4 text-base transition-colors duration-200",
                isActive(item.href)
                  ? "bg-[#0082c8] text-white font-medium"
                  : "text-gray-700 hover:bg-gray-100 font-normal",
                isCollapsed && "justify-center px-3",
              )}
            >
              <item.icon className={`w-6 h-6 ${isActive(item.href) ? "text-white" : "text-[#0082c8]"}`} />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </button>
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
