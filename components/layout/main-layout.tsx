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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== "undefined") {
        try {
          const currentUser = getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
          }
        } catch (error) {
          console.error('Error loading user:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    loadUser()
    
    // Also listen for storage changes to update user data
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue)
            setUser(userData)
          } catch (error) {
            console.error('Error parsing user data from storage:', error)
          }
        } else {
          setUser(null)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
    // Also update localStorage to keep data in sync
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }
  }

  return (
    <div className="flex h-screen bg-background font-khmer transition-colors duration-300">
      {/* Sidebar - width and height unchanged */}
      <SidebarMenu />

      {/* Main content area - flat and clean */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-screen bg-gradient-to-br from-muted/40 via-background to-muted/10">
        {/* Top navigation bar */}
        <TopBar user={user} onUserUpdate={handleUserUpdate} />

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
