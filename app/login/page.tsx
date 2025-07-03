"use client"

import type React from "react"

import { Lock, User, Eye, EyeOff, ChevronDown, ArrowLeft, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const userOptions = [
    "ហាក់​ ម៉េងហុង",
    "ហេង​ សុនី",
    "ស្រួយ​ ស៊ីណាត",
    "ស្រួយ ចាន់នាត",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 1500))

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-khmer">
      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBackToSplash}
        className="absolute top-4 left-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <Card className="w-full max-w-md animate-fade-in" variant="elevated" padding="lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-bold text-primary">កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស</h1>
          <p className="text-muted-foreground">សូមបញ្ចូលឈ្មេាះនិងលេខកូដសម្ងាត់</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username Input with Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">ឈ្មេាះគ្រូ</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="ជ្រើសរើស ឬ សរសេរឈ្មេាះ"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                icon={<User className="h-4 w-4 text-primary" />}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <ChevronDown className="h-4 w-4" />
              </button>

              {open && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border border-border rounded-lg shadow-lg animate-fade-in">
                  <div className="max-h-60 overflow-auto">
                    {userOptions
                      .filter((user) => user.toLowerCase().includes(username.toLowerCase()))
                      .map((user) => (
                        <div
                          key={user}
                          className="flex items-center px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => {
                            setUsername(user)
                            setOpen(false)
                          }}
                        >
                          <User className="mr-3 h-4 w-4 text-primary" />
                          {user}
                        </div>
                      ))}
                    {userOptions.filter((user) => user.toLowerCase().includes(username.toLowerCase())).length ===
                      0 && <div className="px-4 py-3 text-muted-foreground">រកមិនឃើញឈ្មេាះ</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">លេខកូដសម្ងាត់</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="លេខកូដសម្ងាត់"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-4 w-4 text-primary" />}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>កំពុងចូល...</span>
              </div>
            ) : (
              "ចូលកម្មវិធី"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}