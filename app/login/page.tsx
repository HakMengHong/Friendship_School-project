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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-4 font-khmer transition-all duration-500">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-600/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-600/20 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-500/20 dark:from-indigo-500/10 dark:to-cyan-600/10 rounded-full blur-3xl opacity-40 animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/60 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-indigo-400/30 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Enhanced Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBackToSplash}
        className="absolute top-6 left-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 hover:bg-white dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl z-10"
      >
        <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
      </Button>

      {/* Enhanced Theme Toggle and Settings */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetSplashPreferences}
          className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 active:from-primary/20 active:to-primary/10 text-slate-700 dark:text-slate-300 hover:text-primary shadow-lg hover:shadow-xl active:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
          title="ផ្លាស់ប្តូរការកំណត់ Splash Screen"
        >
          <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
        </Button>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <ThemeToggle />
        </div>
      </div>

      <Card className="w-full max-w-md relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group">
        {/* Card glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
        
        <CardContent className="relative">
          {/* Enhanced Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative group/logo">
              <div className="w-28 h-28 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-3xl overflow-hidden transition-all duration-500 hover:scale-110 border border-white/50 dark:border-slate-600/50">
                <img 
                  src="/logo.png" 
                  alt="សាលាមិត្តភាព" 
                  className="w-18 h-18 object-contain transition-transform duration-300 group-hover/logo:scale-110"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.fallback-icon');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <GraduationCap className="w-14 h-14 text-primary fallback-icon hidden group-hover/logo:text-primary/80 transition-colors duration-300" />
              </div>
              {/* Enhanced status indicator */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white dark:border-slate-800">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover/logo:opacity-100 group-hover/logo:animate-pulse transition-opacity duration-500 -z-10"></div>
            </div>
          </div>

          {/* Enhanced Heading */}
          <div className="text-center space-y-4 mb-4">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent leading-relaxed py-2 animate-fade-in">
                កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full mx-auto opacity-60"></div>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed">
                សូមបញ្ចូលឈ្មោះនិងលេខកូដសម្ងាត់
              </p>
            </div>
          </div>

          {/* Enhanced Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Enhanced Username Input with Dropdown */}
            <div className="space-y-4">
              <label className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                ឈ្មោះគ្រូ
              </label>
              <div className="relative group" ref={dropdownRef}>
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
                  className="h-14 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm hover:border-blue-400 hover:shadow-lg focus:shadow-xl"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                  disabled={isLoading}
                >
                  <ChevronDown className={`h-5 w-5 transition-all duration-300 ${open ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                </button>

                {open && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl hover:shadow-3xl animate-fade-in max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.name}
                          className="flex items-center px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 cursor-pointer transition-all duration-300 border-b border-slate-100/50 dark:border-slate-700/50 last:border-b-0 group/user"
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
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold mr-4 shadow-lg group-hover/user:scale-110 transition-transform duration-300">
                            {user.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 dark:text-white text-lg group-hover/user:text-blue-600 dark:group-hover/user:text-blue-400 transition-colors duration-300">{user.name}</div>
                            <div className="flex items-center gap-2">
                            <div className="text-sm text-slate-500 dark:text-slate-400 hidden">{user.role}</div>
                              {user.userRole === 'admin' && (
                                <Crown className="w-4 h-4 text-yellow-500 hidden" />
                              )}
                              {user.userRole === 'teacher' && (
                                <BookOpen className="w-4 h-4 text-blue-500 hidden" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-4 text-slate-500 dark:text-slate-400 text-center text-lg">
                        រកមិនឃើញឈ្មោះ
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Password */}
            <div className="space-y-2">
              <label className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-lg">
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                លេខកូដសម្ងាត់
              </label>
              <div className="relative group">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="លេខកូដសម្ងាត់"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm hover:border-purple-400 hover:shadow-lg focus:shadow-xl"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110"
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

            {/* Enhanced Error Message */}
            {loginError && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-xl shadow-lg animate-fade-in">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-lg font-medium text-red-700 dark:text-red-300">{loginError}</span>
              </div>
            )}

            {/* Enhanced Session Timeout Message */}
            {isTimeout && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700 rounded-xl shadow-lg animate-fade-in">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-lg font-medium text-yellow-700 dark:text-yellow-300">{timeoutMessage}</span>
              </div>
            )}

            {/* Enhanced Login Button */}
            <Button
              type="submit"
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>កំពុងចូល...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Sparkles className="h-6 w-6" />
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-600/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-600/20 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">កំពុងផ្ទុក...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}