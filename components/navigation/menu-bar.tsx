"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, Users, BookOpen, Award, Settings, LogOut, Menu, X, BarChart3, Calendar, FileText } from "lucide-react"

interface MenuBarProps {
  className?: string
}

export function MenuBar({ className }: MenuBarProps) {
  const [isOpen, setIsOpen] = useState(false)
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
    setIsOpen(false)
  }

  const handleLogout = () => {
    router.push("/login")
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Desktop Menu Bar */}
      <nav className={`hidden md:flex bg-white shadow-sm border-b ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Image
                  src="/logo.png"
                  alt="School Management System Logo"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស</h1>
            </div>

            {/* Menu Items */}
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              ))}

              {/* Logout Button */}
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2 ml-4">
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">ចាកចេញ</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Bar */}
      <nav className="md:hidden bg-white shadow-sm border-b">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
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

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu Items */}
          {isOpen && (
            <div className="pb-4 space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.href)}
                  className="w-full justify-start space-x-3"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}

              {/* Mobile Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start space-x-3 mt-4"
              >
                <LogOut className="h-4 w-4" />
                <span>ចាកចេញ</span>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
