"use client"

import React, { useEffect, useState } from "react"
import { SidebarMenu } from "@/components/navigation/sidebar-menu"
import { TopBar } from "@/components/navigation/top-bar"
import { AutoLogoutTimer } from "@/components/AutoLogoutTimer"
import { getCurrentUser, User } from "@/lib/auth-service"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    }
  }, [])

  return (
    <div className="flex h-screen bg-background font-khmer transition-colors duration-300">
      {/* Sidebar - width and height unchanged */}
      <SidebarMenu />

      {/* Main content area - flat and clean */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-screen bg-gradient-to-br from-muted/40 via-background to-muted/10">
        {/* Top navigation bar */}
        <TopBar user={user} />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-background scrollbar">
          <div className="container mx-auto max-w-7xl p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-logout timer - only show for authenticated users */}
      {user && (
        <AutoLogoutTimer 
          timeoutMinutes={30}
          warningMinutes={5}
          onLogout={() => {
            // Clear user state on logout
            setUser(null)
          }}
        />
      )}
    </div>
  )
}
