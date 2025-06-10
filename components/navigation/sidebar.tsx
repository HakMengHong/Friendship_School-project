"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  BookOpen,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  FileText,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: "ទំព័រដើម", href: "/dashboard", id: "home" },
    { icon: Users, label: "គ្រប់គ្រងសិស្ស", href: "/students", id: "students" },
    { icon: BookOpen, label: "មុខវិជ្ជា", href: "/subjects", id: "subjects" },
    { icon: Award, label: "ពិន្ទុ", href: "/grades", id: "grades" },
    { icon: BarChart3, label: "របាយការណ៍", href: "/reports", id: "reports" },
    { icon: Calendar, label: "កាលវិភាគ", href: "/schedule", id: "schedule" },
    { icon: FileText, label: "ឯកសារ", href: "/documents", id: "documents" },
    { icon: Settings, label: "ការកំណត់", href: "/settings", id: "settings" },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    router.push("/login")
  }

  const isActive = (href: string) => pathname === href

  return (
    <aside
      className={`bg-white shadow-lg border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } ${className}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="School Management System Logo"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">កម្មវិធី</h1>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="p-2">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={isActive(item.href) ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item.href)}
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            title={isCollapsed ? "ចាកចេញ" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">ចាកចេញ</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}
