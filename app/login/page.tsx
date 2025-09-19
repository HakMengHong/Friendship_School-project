"use client"

import type React from "react"
import { Suspense } from "react"

import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ArrowLeft, 
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Crown,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setCurrentUser } from "@/lib/auth-service"
import { resetSplashPreferences } from "@/lib/splash-preferences"

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [userOptions, setUserOptions] = useState<Array<{
    name: string
    role: string
    avatar: string
    username: string
    userRole: 'admin' | 'teacher'
  }>>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check for session timeout message
  const isTimeout = searchParams.get('timeout') === 'true'
  const timeoutMessage = searchParams.get('message') || 'សូមចូលម្តងទៀត។'

  // Load users from API on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/auth/users')
        if (response.ok) {
          const data = await response.json()
          const options = data.users.map((user: { username: string; role: string; firstname: string; lastname: string; avatar?: string }) => ({
            name: user.username, // Show username instead of full name
            role: user.role === 'admin' ? 'នាយក' : 'គ្រូបង្រៀន',
    avatar: user.avatar || user.firstname.charAt(0) + user.lastname.charAt(0),
    username: user.username,
    userRole: user.role
  }))
          setUserOptions(options)
        }
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }
    loadUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    // Simple validation
    if (!username || !password) {
      setLoginError("សូមបំពេញឈ្មោះនិងលេខកូដសម្ងាត់")
      setIsLoading(false)
      return
    }

    try {
      // Authenticate user via API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })
    
      if (!response.ok) {
        const errorData = await response.json()
        setLoginError(errorData.error || "ឈ្មោះឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ")
        return
      }

      const data = await response.json()
      const user = data.user

      // Store user data with enhanced auth service
      setCurrentUser(user)

      // Check for redirect parameter
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirect')

      // Redirect to appropriate page
      if (redirectTo && redirectTo !== '/login') {
        router.push(redirectTo)
      } else if (user.role === 'admin') {
        router.push("/dashboard")
      } else if (user.role === 'teacher') {
        router.push("/attendance/daily")
      } else {
        // Default fallback
        router.push("/dashboard")
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError("មានបញ្ហាក្នុងការចូល សូមព្យាយាមម្តងទៀត")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSplash = () => {
    router.push("/splash")
  }

  const handleResetSplashPreferences = () => {
    // Clear splash preferences to show splash screen again
    resetSplashPreferences()
    router.push("/splash")
  }

  const filteredUsers = userOptions.filter((user) => 
    user.name.toLowerCase().includes(username.toLowerCase())
  )

  // Handle clicking outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 font-khmer transition-all duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBackToSplash}
        className="absolute top-6 left-6 hover:bg-white/10 backdrop-blur-sm"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Theme Toggle and Settings */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetSplashPreferences}
          className="relative bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary hover:to-primary/80 active:from-primary/90 active:to-primary/70 text-primary hover:text-white active:text-white shadow-sm hover:shadow-lg active:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group flex-shrink-0"
          title="ផ្លាស់ប្តូរការកំណត់ Splash Screen"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md animate-fade-in shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="p-2">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="សាលាមិត្តភាព" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.fallback-icon');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <GraduationCap className="w-12 h-12 text-primary fallback-icon hidden" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-4 mb-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-2">
                កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                សូមបញ្ចូលឈ្មោះនិងលេខកូដសម្ងាត់
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input with Dropdown */}
            <div className="space-y-3">
              <label className="text-base font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent dark:text-gray-200 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                ឈ្មោះគ្រូ
              </label>
              <div className="relative" ref={dropdownRef}>
                <Input
                  type="text"
                  placeholder="ជ្រើសរើស ឬ សរសេរឈ្មោះ"
                  value={username}
                  onChange={(e) => {
                    // Remove spaces from manually typed username
                    const cleanValue = e.target.value.replace(/\s+/g, '')
                    setUsername(cleanValue)
                  }}
                  onFocus={() => setOpen(true)}
                  className="h-12 text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl animate-fade-in max-h-60 overflow-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.name}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            // Ensure username has no spaces and is properly trimmed
                            const cleanUsername = user.username.trim().replace(/\s+/g, '')
                            console.log('Selected username:', user.username, 'Clean username:', cleanUsername)
                            setUsername(cleanUsername)
                            setOpen(false)
                          }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                            {user.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-base">{user.name}</div>
                            <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400 hidden">{user.role}</div>
                              {user.userRole === 'admin' && (
                                <Crown className="w-3 h-3 text-yellow-500 hidden" />
                              )}
                              {user.userRole === 'teacher' && (
                                <BookOpen className="w-3 h-3 text-blue-500 hidden" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center text-base">
                        រកមិនឃើញឈ្មោះ
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="text-base font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent dark:text-gray-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                លេខកូដសម្ងាត់
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="លេខកូដសម្ងាត់"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-base text-red-600 dark:text-red-400">{loginError}</span>
              </div>
            )}

            {/* Session Timeout Message */}
            {isTimeout && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-base text-yellow-600 dark:text-yellow-400">{timeoutMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              variant="gradient"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>កំពុងចូល...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>ចូលកម្មវិធី</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300 text-base">កំពុងផ្ទុក...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}