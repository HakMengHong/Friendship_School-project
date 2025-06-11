"use client"

import type React from "react"

import { Lock, User, Eye, EyeOff, ChevronDown, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
    <div className="min-h-screen flex items-center justify-center bg-[#0082c8] from-purple-50 p-4">
      {/* Back button */}
      <button
        onClick={handleBackToSplash}
        className="absolute top-4 left-4 p-2 text-gray-100 hover:text-[#0082c8] transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        <div className="p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-lg p-2">
              <Image
                src="/logo.png"
                alt="School Management System Logo"
                width={88}
                height={88}
                className="rounded-full"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0082c8]">កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស</h1>
            <p className="text-gray-600 text-sm">សូមបញ្ចូលឈ្មេាះនិងលេខកូដសម្ងាត់</p>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Input with Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="username">ឈ្មេាះគ្រូ</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#0082c8] z-10" />
                <Input
                  id="username"
                  type="text"
                  placeholder="ជ្រើសរើស ឬ សរសេរឈ្មេាះ"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setOpen(true)}
                  onBlur={() => setTimeout(() => setOpen(false), 200)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="absolute right-3 top-3 h-4 w-4 text-[#0082c8] hover:text-foreground"
                  disabled={isLoading}
                >
                  <ChevronDown className="h-4 w-4 text-[#0082c8]" />
                </button>

                {open && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg animate-fade-in">
                    <div className="max-h-60 overflow-auto">
                      {userOptions
                        .filter((user) => user.toLowerCase().includes(username.toLowerCase()))
                        .map((user) => (
                          <div
                            key={user}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => {
                              setUsername(user)
                              setOpen(false)
                            }}
                          >
                            <User className="mr-2 h-4 w-4 text-[#0082c8]" />
                            {user}
                          </div>
                        ))}
                      {userOptions.filter((user) => user.toLowerCase().includes(username.toLowerCase())).length ===
                        0 && <div className="px-3 py-2 text-muted-foreground">រកមិនឃើញឈ្មេាះ</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">លេខកូដសម្ងាត់</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#0082c8]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="លេខកូដសម្ងាត់"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#0082c8]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#0082c8]" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0082c8] hover:bg-[#0069a4] transition-colors"
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
        </div>
      </div>
    </div>
  )
}
