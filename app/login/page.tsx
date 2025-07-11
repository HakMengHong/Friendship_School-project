"use client"

import type React from "react"

import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ArrowLeft, 
  GraduationCap,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userOptions = [
    { name: "ហាក់​ ម៉េងហុង", role: "គ្រូបង្រៀន", avatar: "HM" },
    { name: "ហេង​ សុនី", role: "គ្រូបង្រៀន", avatar: "HS" },
    { name: "ស្រួយ​ ស៊ីណាត", role: "គ្រូបង្រៀន", avatar: "SS" },
    { name: "ស្រួយ ចាន់នាត", role: "គ្រូបង្រៀន", avatar: "SC" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simple validation
    if (!username || !password) {
      setLoginError("សូមបំពេញឈ្មោះនិងលេខកូដសម្ងាត់")
      setIsLoading(false)
      return
    }

    // Store username in localStorage
    localStorage.setItem("username", username)

    // Add authentication logic here
    console.log("Login attempt:", { username, password })

    // Redirect to dashboard after successful login
    router.push("/dashboard")
    setIsLoading(false)
  }

  const handleBackToSplash = () => {
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

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
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
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-2">
                កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                សូមបញ្ចូលឈ្មោះនិងលេខកូដសម្ងាត់
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input with Dropdown */}
            <div className="space-y-3">
              <label className="text-sm font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent dark:text-gray-200 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                ឈ្មោះគ្រូ
              </label>
              <div className="relative" ref={dropdownRef}>
                <Input
                  type="text"
                  placeholder="ជ្រើសរើស ឬ សរសេរឈ្មោះ"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                            setUsername(user.name)
                            setOpen(false)
                          }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                            {user.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                        រកមិនឃើញឈ្មោះ
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="text-sm font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent dark:text-gray-200 flex items-center gap-2">
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
                <span className="text-sm text-red-600 dark:text-red-400">{loginError}</span>
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