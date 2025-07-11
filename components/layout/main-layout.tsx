"use client"

import React, { useEffect, useState } from "react"
import { SidebarMenu } from "@/components/navigation/sidebar-menu"
import { TopBar } from "@/components/navigation/top-bar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [username, setUsername] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username")
      if (storedUsername) {
        setUsername(storedUsername)
      }
    }
  }, [])

  return (
    <div className="flex h-screen bg-background font-khmer transition-colors duration-300">
      {/* Sidebar */}
      <SidebarMenu />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation bar */}
        <TopBar username={username} />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-background scrollbar">
          <div className="container mx-auto max-w-7xl p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
