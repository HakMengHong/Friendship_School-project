"use client"

import { usePathname } from "next/navigation"
import { Search, Crown, BookOpen, ClipboardList, User, LogOut, Settings, AlertCircle, RefreshCw, Edit, Save, X, Eye, EyeOff, Lock, Phone, AtSign, Mail, Camera, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo, useState, useEffect } from "react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { getCurrentUser, logout, User as UserType } from "@/lib/auth-service"
import { SettingsToggle } from "@/components/ui/settings-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface TopBarProps {
  className?: string
  user?: UserType | null
  onUserUpdate?: (updatedUser: UserType) => void
}

export function TopBar({ className, user, onUserUpdate }: TopBarProps) {
  const pathname = usePathname()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileData, setProfileData] = useState({
    phonenumber1: '',
    phonenumber2: '',
    password: '',
    confirmPassword: '',
    photo: '',
    photoFile: null as File | null
  })
  const router = useRouter()

  const pageInfo = useMemo(() => {
    const routes: Record<string, { title: string; subtitle: string }> = {
      "/dashboard": {
        title: "ផ្ទាំងគ្រប់គ្រង",
        subtitle: "ការតាមដានសកម្មភាពសិស្ស និងគ្រូបង្រៀន"
      },
      "/dashboard/users": {
        title: "ការគ្រប់គ្រងអ្នកប្រើប្រាស់",
        subtitle: "គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ និងការអនុញ្ញាត"
      },
      "/dashboard/academic-management": {
        title: "ការគ្រប់គ្រងថ្នាក់",
        subtitle: "គ្រប់គ្រងឆ្នាំសិក្សា ថ្នាក់រៀន និងមុខវិជ្ជា"
      },
      "/attendance/daily": {
        title: "អវត្តមានសិស្សប្រចាំថ្ងៃ",
        subtitle: "ការកត់ត្រាវត្តមានសិស្សប្រចាំថ្ងៃ"
      },
      "/grade/addgrade": {
        title: "បញ្ចូលពិន្ទុសិស្ស",
        subtitle: "បញ្ចូលពិន្ទុថ្មីសម្រាប់សិស្ស"
      },
      "/grade/report": {
        title: "របាយការណ៍ពិន្ទុ",
        subtitle: "របាយការណ៍លម្អិតនៃពិន្ទុសិស្ស"
      },
      "/student-info": {
        title: "ព័ត៌មានសិស្ស",
        subtitle: "ការគ្រប់គ្រងព័ត៌មានលម្អិតសិស្ស"
      },
      "/student-info/list": {
        title: "បញ្ជីឈ្មោះសិស្ស",
        subtitle: "បញ្ជីសិស្សទាំងអស់ក្នុងប្រព័ន្ធ"
      },
      "/register-student": {
        title: "ចុះឈ្មោះសិស្ស",
        subtitle: "បញ្ចូលព័ត៌មានសិស្សថ្មី និងគ្រប់គ្រងព័ត៌មាន"
      },
      "/dashboard/add-student-class": {
        title: "បន្ថែមសិស្សទៅក្នុងថ្នាក់",
        subtitle: "បន្ថែមសិស្សទៅក្នុងថ្នាក់រៀនផ្សេងៗ"
      },
      "/dashboard/view-student-class": {
        title: "មើលថ្នាក់រៀន",
        subtitle: "មើលព័ត៌មានថ្នាក់រៀន និងសិស្សដែលបានចុះឈ្មោះ"
      },
      "/pdf-exports": {
        title: "ការនាំចេញ PDF",
        subtitle: "គ្រប់គ្រង និងនាំចេញឯកសារ PDF"
      },
    }
    return routes[pathname || ''] || { 
      title: "ផ្ទាំងគ្រប់គ្រង", 
      subtitle: "ការតាមដានសកម្មភាពសិស្ស និងគ្រូបង្រៀន" 
    }
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Enhanced search functionality
      const searchTerm = searchQuery.trim()
      
      // Route to appropriate search page based on current location
      if (pathname?.includes('/student-info')) {
        router.push(`/student-info/list?search=${encodeURIComponent(searchTerm)}`)
      } else if (pathname?.includes('/dashboard/users')) {
        router.push(`/dashboard/users?search=${encodeURIComponent(searchTerm)}`)
      } else if (pathname?.includes('/attendance')) {
        router.push(`/attendance/daily?search=${encodeURIComponent(searchTerm)}`)
      } else {
        // Default to student search
        router.push(`/student-info/list?search=${encodeURIComponent(searchTerm)}`)
      }
      
      toast({
        title: "ការស្វែងរក",
        description: `កំពុងស្វែងរក: "${searchTerm}"`,
      })
    }
  }

  const handleLogout = async () => {
    try {
      // Log logout activity before clearing session
      if (user) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            username: `${user.lastname} ${user.firstname}`
          })
        })
      }
    } catch (error) {
      console.error('Logout logging error:', error)
      // Continue with logout even if logging fails
    } finally {
      // Clear local session data
      logout()
      router.push("/login")
    }
  }

  const handleProfileClick = () => {
    if (user) {
      setProfileData({
        phonenumber1: user.phonenumber1 || '',
        phonenumber2: user.phonenumber2 || '',
        password: '',
        confirmPassword: '',
        photo: user.photo || '',
        photoFile: null
      })
      setShowProfileEdit(true)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "បរាជ័យ",
          description: "សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ",
          variant: "destructive"
        })
        // Reset file input
        e.target.value = ''
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "បរាជ័យ",
          description: "ទំហំឯកសារត្រូវតែតិចជាង 5MB",
          variant: "destructive"
        })
        // Reset file input
        e.target.value = ''
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setProfileData(prev => ({
        ...prev,
        photoFile: file,
        photo: previewUrl
      }))
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    // Validate required fields
    if (!profileData.phonenumber1) {
      toast({
        title: "បរាជ័យ",
        description: "លេខទូរស័ព្ទគឺចាំបាច់",
        variant: "destructive"
      })
      return
    }

    // Validate password if provided
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      toast({
        title: "បរាជ័យ",
        description: "ពាក្យសម្ងាត់មិនត្រូវគ្នា",
        variant: "destructive"
      })
      return
    }

    setProfileLoading(true)
    try {
      const updateData: any = {
        phonenumber1: profileData.phonenumber1,
        phonenumber2: profileData.phonenumber2
      }

      // Only include password if provided
      if (profileData.password) {
        updateData.password = profileData.password
      }

      // Handle photo upload if provided
      if (profileData.photoFile) {
        const formData = new FormData()
        formData.append('photo', profileData.photoFile)
        formData.append('phonenumber1', profileData.phonenumber1)
        formData.append('phonenumber2', profileData.phonenumber2)
        if (profileData.password) {
          formData.append('password', profileData.password)
        }

        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          body: formData
        })

        if (response.ok) {
          const updatedUserData = await response.json()
          toast({
            title: "ជោគជ័យ",
            description: "ព័ត៌មានផ្ទាល់ខ្លួនត្រូវបានកែប្រែ"
          })
          
          // Reset file input
          const fileInput = document.getElementById('photo') as HTMLInputElement
          if (fileInput) {
            fileInput.value = ''
          }
          
          setShowProfileEdit(false)
          
          // Update user data in parent component
          if (onUserUpdate && updatedUserData.user) {
            onUserUpdate(updatedUserData.user)
          }
          
          // Refresh page to show updated photo immediately
          setTimeout(() => {
            window.location.reload()
          }, 500)
        } else {
          const error = await response.json()
          toast({
            title: "បរាជ័យ",
            description: error.error || "មានបញ្ហាក្នុងការកែប្រែ",
            variant: "destructive"
          })
        }
        return
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedUserData = await response.json()
        toast({
          title: "ជោគជ័យ",
          description: "ព័ត៌មានផ្ទាល់ខ្លួនត្រូវបានកែប្រែ"
        })
        
        setShowProfileEdit(false)
        
        // Update user data in parent component
        if (onUserUpdate && updatedUserData.user) {
          onUserUpdate(updatedUserData.user)
        }
        
        // Refresh page to show updates immediately
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        const error = await response.json()
        toast({
          title: "បរាជ័យ",
          description: error.error || "មានបញ្ហាក្នុងការកែប្រែ",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "បរាជ័យ",
        description: "មានបញ្ហាក្នុងការកែប្រែ",
        variant: "destructive"
      })
    } finally {
      setProfileLoading(false)
    }
  }


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder="ស្វែងរក... (Ctrl+K)"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
      // Escape to clear search
      if (e.key === 'Escape') {
        setSearchQuery('')
        const searchInput = document.querySelector('input[placeholder="ស្វែងរក... (Ctrl+K)"]') as HTMLInputElement
        if (searchInput) {
          searchInput.blur()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`bg-gradient-to-r from-card/95 via-card/90 to-card/85 backdrop-blur-xl border-b border-border/50 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-primary/5 relative overflow-hidden ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Left side - Title */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent leading-relaxed py-1 truncate">
              {pageInfo.title}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground/80 mt-1 hidden sm:block font-medium">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto relative z-10">

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile - Enhanced */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-3 border-l border-border/50 hover:bg-muted/20 transition-all duration-200 group flex-shrink-0 rounded-xl relative overflow-hidden"
            >
              {/* Background decoration - very subtle */}
              <div className="absolute inset-0 bg-gradient-to-r from-muted/5 via-transparent to-muted/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              
              <div className="text-right hidden sm:block relative z-10">
                <p className="text-xs md:text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors duration-200 truncate max-w-20 md:max-w-24">
                  {user ? `${user.lastname || ''} ${user.firstname || ''}`.trim() || 'អ្នកប្រើប្រាស់' : "កំពុងផ្ទុក..."}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 font-medium transition-colors duration-200">
                    {user?.position || (user?.role === 'admin' ? 'នាយក' : user?.role === 'teacher' ? 'គ្រូបង្រៀន' : 'អ្នកប្រើប្រាស់')}
                  </p>
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-full shadow-sm transition-all duration-300">
                      <Crown className="w-2.5 h-2.5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Admin</span>
                    </div>
                  )}
                  {user?.role === 'teacher' && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-full shadow-sm transition-all duration-300">
                      <BookOpen className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Teacher</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Compact Avatar */}
              <div className="relative w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden">
                {/* Avatar content */}
                {user ? (
                  user.photo && user.photo.trim() !== '' ? (
                    <img 
                      src={user.photo.startsWith('blob:') ? user.photo : 
                            user.photo.startsWith('http') ? user.photo :
                            user.photo.startsWith('/') ? user.photo :
                            `/uploads/${user.photo}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null
                ) : null}
                
                {/* Fallback initials or loading */}
                <span className={`relative z-10 text-sm font-semibold ${user?.photo && user.photo.trim() !== '' ? 'hidden' : ''}`}>
                  {user ? (
                    user.firstname?.charAt(0)?.toUpperCase() || 
                    user.lastname?.charAt(0)?.toUpperCase() || 
                    user.username?.charAt(0)?.toUpperCase() || 
                    "U"
                  ) : (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-gradient-to-b from-card/95 to-card/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden">
            
            <DropdownMenuSeparator className="bg-border/30" />
            
            {/* Enhanced Profile Edit Item */}
            <DropdownMenuItem 
              onClick={handleProfileClick}
              className="flex items-center space-x-4 p-5 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-900 transition-all duration-200 group cursor-pointer"
            >
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 rounded-xl transition-all duration-200 shadow-sm group-hover:shadow-lg group-hover:scale-105 group-hover:from-blue-300 group-hover:to-blue-200 dark:group-hover:from-blue-700 dark:group-hover:to-blue-800">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors duration-200" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-primary group-hover:text-blue-950 dark:group-hover:text-blue-50 group-hover:font-bold transition-all duration-200">កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
                <span className="text-sm text-muted-foreground group-hover:text-blue-900 dark:group-hover:text-blue-100 group-hover:font-medium transition-all duration-200">ធ្វើបច្ចុប្បន្នភាពព័ត៌មានរបស់អ្នក</span>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-primary/40 rounded-full group-hover:bg-blue-800 dark:group-hover:bg-blue-300 group-hover:scale-110 transition-all duration-200"></div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-border/30" />
            
            {/* Enhanced Logout Item */}
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="flex items-center space-x-4 p-5 text-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 dark:hover:from-red-800 dark:hover:to-red-900 transition-all duration-200 group dark:text-red-400 cursor-pointer"
            >
              <div className="p-2.5 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-800/30 rounded-xl transition-all duration-200 shadow-sm group-hover:shadow-lg group-hover:scale-105 group-hover:from-red-300 group-hover:to-red-200 dark:group-hover:from-red-700 dark:group-hover:to-red-800">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:text-red-900 dark:group-hover:text-red-100 transition-colors duration-200" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold group-hover:text-red-950 dark:group-hover:text-red-50 group-hover:font-bold transition-all duration-200">ចាកចេញ</span>
                <span className="text-sm text-red-500/70 dark:text-red-400/70 group-hover:text-red-900 dark:group-hover:text-red-100 group-hover:font-medium transition-all duration-200">ចេញពីគណនីរបស់អ្នក</span>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-red-500/40 rounded-full group-hover:bg-red-800 dark:group-hover:bg-red-300 group-hover:scale-110 transition-all duration-200"></div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <DialogContent className="max-w-5xl max-h-[95vh] bg-gradient-to-br from-white via-blue-50/40 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 backdrop-blur-2xl border-0 shadow-3xl rounded-3xl flex flex-col animate-in fade-in-0 zoom-in-95 duration-500 overflow-visible">
          {/* Ultra Modern Header with Enhanced Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-700 to-pink-600 text-white p-10 -m-8 mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 translate-x-24 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-20 -translate-x-20 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/8 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-white/5 rounded-full animate-bounce" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-white/25 backdrop-blur-md rounded-3xl shadow-2xl group-hover:scale-110 transition-all duration-500 border border-white/20">
                  <UserIcon className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    កែប្រែព័ត៌មានផ្ទាល់ខ្លួន
                  </DialogTitle>
                  <DialogDescription className="text-white/95 text-lg font-medium drop-shadow-md">
                    ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួន និងការកំណត់របស់អ្នក
                  </DialogDescription>
                </div>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/80 text-sm font-medium">
                  {new Date().toLocaleDateString('en-GB')}
                </div>
                <div className="text-white/70 text-xs">
                  {new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 overflow-x-visible">
            <form id="profile-form" onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }} className="space-y-6 px-2">
              {/* Profile Picture & Personal Information - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Section */}
                <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl p-6 border border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary">
                    រូបភាពប្រវត្តិ
                  </h3>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  {/* Enhanced Avatar Preview */}
                  <div className="relative group">
                    {profileData.photo && profileData.photo.trim() !== '' ? (
                      <div className="relative">
                        <img
                          src={profileData.photo.startsWith('blob:') ? profileData.photo : 
                                profileData.photo.startsWith('http') ? profileData.photo :
                                profileData.photo.startsWith('/') ? profileData.photo :
                                `/uploads/${profileData.photo}`}
                          alt="Profile"
                          className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setProfileData(prev => ({ ...prev, photoFile: null, photo: "" }))}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-2 shadow-xl transition-all duration-200 hover:scale-110"
                          aria-label="លុបរូបភាព"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center text-white font-bold text-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        {user?.firstname?.charAt(0)?.toUpperCase() || 
                         user?.lastname?.charAt(0)?.toUpperCase() || 
                         user?.username?.charAt(0)?.toUpperCase() || 
                         "U"}
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Upload Controls */}
                  <div className="w-full text-center">
                    <Label htmlFor="photo" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl cursor-pointer transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                      <Camera className="w-5 h-5 mr-3" />
                      <span>ជ្រើសរើសរូបភាព</span>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed font-medium">
                      អនុញ្ញាត JPG, PNG, GIF • អតិបរមា 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl p-6 border border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary">
                    ព័ត៌មានផ្ទាល់ខ្លួន
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-muted-foreground flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-primary" />
                      ឈ្មោះពេញ
                    </Label>
                    <div className="h-12 px-4 py-3 bg-muted/60 rounded-xl text-base font-semibold border border-border/40 shadow-sm">
                      {user?.firstname} {user?.lastname}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-muted-foreground flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-primary" />
                      ឈ្មោះអ្នកប្រើ
                    </Label>
                    <div className="h-12 px-4 py-3 bg-muted/60 rounded-xl text-base font-semibold border border-border/40 shadow-sm">
                      {user?.username}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information & Password Change - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl p-6 border border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary">
                    ព័ត៌មានទំនាក់ទំនង
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Phone 1 */}
                  <div className="space-y-2">
                    <Label htmlFor="phonenumber1" className="text-base font-semibold text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      លេខទូរស័ព្ទ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phonenumber1"
                      value={profileData.phonenumber1}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phonenumber1: e.target.value }))}
                      placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                      className="h-12 text-base rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Phone 2 */}
                  <div className="space-y-2">
                    <Label htmlFor="phonenumber2" className="text-base font-semibold text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      លេខទូរស័ព្ទទី២
                    </Label>
                    <Input
                      id="phonenumber2"
                      value={profileData.phonenumber2}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phonenumber2: e.target.value }))}
                      placeholder="បញ្ចូលលេខទូរស័ព្ទទី២"
                      className="h-12 text-base rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl p-6 border border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary">
                    ផ្លាស់ប្តូរពាក្យសម្ងាត់
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Enhanced Info Banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-base text-blue-700 dark:text-blue-300">
                        <p className="font-semibold">ព័ត៌មានសំខាន់:</p>
                        <p>ទុកទទេប្រសិនបើមិនចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-base font-semibold text-muted-foreground flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        ពាក្យសម្ងាត់ថ្មី
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={profileData.password}
                          onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                          className="h-12 pr-12 text-base rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-base font-semibold text-muted-foreground flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        បញ្ជាក់ពាក្យសម្ងាត់
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={profileData.confirmPassword}
                          onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                          className="h-12 pr-12 text-base rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </form>
          </div>
          
          {/* Ultra Modern Enhanced Footer */}
          <div className="flex justify-between items-center gap-6 pt-8 border-t-2 border-gradient-to-r from-gray-200/60 via-gray-300/40 to-gray-200/60 dark:from-gray-700/60 dark:via-gray-600/40 dark:to-gray-700/60 bg-gradient-to-r from-white via-gray-50/60 to-white dark:from-gray-900 dark:via-gray-800/60 dark:to-gray-900 px-6 -mx-8 -mb-8 p-10 animate-in slide-in-from-bottom-3 duration-700 delay-500">
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg" />
              <span className="font-medium">ព័ត៌មានផ្ទាល់ខ្លួនត្រូវបានរក្សាទុកដោយសុវត្ថិភាព</span>
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProfileEdit(false)}
                className="px-8 py-4 rounded-2xl border-2 border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <X className="h-5 w-5" />
                  បោះបង់
                </div>
              </Button>
              <Button
                type="submit"
                form="profile-form"
                className="px-10 py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold"
                disabled={profileLoading}
              >
                <div className="flex items-center gap-3">
                  {profileLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      កំពុងរក្សាទុក...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      កែប្រែ
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
