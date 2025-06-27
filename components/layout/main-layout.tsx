"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SidebarMenu } from "@/components/navigation/sidebar-menu"
import { TopBar } from "@/components/navigation/top-bar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    // Get username from localStorage when component mounts
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  return (
    <div className="flex h-screen bg-background font-khmer">
      {/* Sidebar */}
      <SidebarMenu />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation bar */}
        <TopBar username={username} />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6 max-w-7xl">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}