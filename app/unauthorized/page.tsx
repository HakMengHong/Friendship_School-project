"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, Home, LogOut } from "lucide-react"
import { getCurrentUser, clearUserCookie } from "@/lib/auth-service"
import { ThemeToggle } from "@/components/ui/theme-toggle"

function UnauthorizedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<{
    role?: string
    username?: string
    firstname?: string
    lastname?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Refs for button focus management
  const homeButtonRef = useRef<HTMLButtonElement>(null)
  const logoutButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  // Focus management - focus on home button when component mounts
  useEffect(() => {
    if (!isLoading && homeButtonRef.current) {
      homeButtonRef.current.focus()
    }
  }, [isLoading])

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        handleGoHome()
        break
      case 'Enter':
        e.preventDefault()
        if (document.activeElement === homeButtonRef.current) {
          handleGoHome()
        } else if (document.activeElement === logoutButtonRef.current) {
          handleLogout()
        }
        break
    }
  }

  const handleGoHome = () => {
    if (user?.role === 'admin') {
      router.push('/dashboard')
    } else if (user?.role === 'teacher') {
      router.push('/attendance/daily')
    } else {
      router.push('/login')
    }
  }



  const handleLogout = () => {
    // Clear user data using the proper auth service function
    clearUserCookie()
    
    // Force a hard redirect to login page to ensure complete logout
    window.location.href = '/login'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-destructive mx-auto"></div>
          <p className="text-muted-foreground">កំពុងផ្ទុក...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        លោតទៅមាតិកាមេ (Skip to main content)
      </a>
      
      <div 
        className="min-h-screen flex items-center justify-center bg-background p-4 relative"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="main"
        id="main-content"
        aria-labelledby="unauthorized-title"
        aria-describedby="unauthorized-description"
      >
        {/* Theme Toggle in top-right corner */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      
              <Card className="w-full max-w-md shadow-xl border-destructive/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <CardTitle id="unauthorized-title" className="text-2xl font-bold text-foreground mb-2">
                គ្មានការអនុញ្ញាត
              </CardTitle>
              <CardDescription id="unauthorized-description" className="text-muted-foreground">
                អ្នកមិនមានការអនុញ្ញាតចូលទៅកាន់ទំព័រនេះទេ
              </CardDescription>
            </div>
          </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">ការចូលប្រើត្រូវបានហាមឃាត់</p>
                <p className="text-muted-foreground">
                  ទំព័រនេះត្រូវការការអនុញ្ញាតពិសេសដែលអ្នកមិនមាន។ 
                  សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធប្រសិនបើអ្នកគិតថានេះជាកំហុស។
                </p>
              </div>
            </div>
          </div>

          {user && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">ព័ត៌មានអ្នកប្រើប្រាស់:</p>
                <p className="text-muted-foreground">ឈ្មោះ: {user.firstname} {user.lastname}</p>
                <p className="text-muted-foreground">តួនាទី: {user.role === 'admin' ? 'អ្នកគ្រប់គ្រង' : 'គ្រូ'}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Button 
              ref={homeButtonRef}
              onClick={handleGoHome}
              className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="ត្រឡប់ទៅទំព័រដើម (Go to home page)"
            >
              <Home className="w-4 h-4 mr-2" />
              ត្រឡប់ទៅទំព័រដើម
            </Button>
            

            
            <Button 
              ref={logoutButtonRef}
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:outline-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="ចាកចេញពីប្រព័ន្ធ (Logout from system)"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ចាកចេញពីប្រព័ន្ធ
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-destructive mx-auto"></div>
          <p className="text-muted-foreground">កំពុងផ្ទុក...</p>
        </div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  )
}
