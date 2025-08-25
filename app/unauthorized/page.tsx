"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, Home, ArrowLeft } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-service"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function UnauthorizedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const handleGoHome = () => {
    if (user?.role === 'admin') {
      router.push('/dashboard')
    } else if (user?.role === 'teacher') {
      router.push('/attendance/daily')
    } else {
      router.push('/login')
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleLogout = () => {
    // Clear user data and redirect to login
    localStorage.removeItem('currentUser')
    sessionStorage.removeItem('currentUser')
    router.push('/login')
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
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
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              គ្មានការអនុញ្ញាត
            </CardTitle>
            <CardDescription className="text-muted-foreground">
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
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              ត្រឡប់ទៅទំព័រដើម
            </Button>
            
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ត្រឡប់ក្រោយ
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              ចាកចេញពីប្រព័ន្ធ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
