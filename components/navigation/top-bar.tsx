"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Crown, BookOpen, ClipboardList, User, LogOut, Settings, AlertCircle, RefreshCw, Edit, Save, X, Eye, EyeOff, Lock, Phone, AtSign, Mail, Camera } from "lucide-react"
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
}

export function TopBar({ className, user }: TopBarProps) {
  const pathname = usePathname()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
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

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleProfileClick = () => {
    if (user) {
      setProfileData({
        phonenumber1: user.phonenumber1 || '',
        phonenumber2: user.phonenumber2 || '',
        password: '',
        confirmPassword: '',
        photo: user.avatar || '',
        photoFile: null
      })
      setShowProfileEdit(true)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileData(prev => ({
        ...prev,
        photoFile: file,
        photo: URL.createObjectURL(file)
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
          toast({
            title: "ជោគជ័យ",
            description: "ព័ត៌មានផ្ទាល់ខ្លួនត្រូវបានកែប្រែ"
          })
          setShowProfileEdit(false)
          window.location.reload()
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
        toast({
          title: "ជោគជ័យ",
          description: "ព័ត៌មានផ្ទាល់ខ្លួនត្រូវបានកែប្រែ"
        })
        setShowProfileEdit(false)
        // Refresh the page to update user data
        window.location.reload()
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

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)
      const response = await fetch('/api/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch notifications')
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      // You can implement this API endpoint if needed
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' })
      
      // For now, just remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      // You can implement this API endpoint if needed
      // await fetch('/api/notifications/clear', { method: 'DELETE' })
      
      // For now, just clear local state
      setNotifications([])
      toast({
        title: "ការជូនដំណឹង",
        description: "បានលុបការជូនដំណឹងទាំងអស់",
      })
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
    }
  }, [showNotifications])

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
        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative p-3 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 rounded-2xl group"
            >
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-gradient-to-b from-card/95 to-card/90 backdrop-blur-xl border border-border/50 shadow-2xl">
            <DropdownMenuLabel className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-primary font-bold">ការជូនដំណឹង</span>
                {notifications.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm p-2 hover:bg-primary/10 rounded-xl transition-all duration-300"
                  onClick={fetchNotifications}
                  disabled={notificationsLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${notificationsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificationsLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-base">កំពុងផ្ទុក...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification, index) => (
                <DropdownMenuItem 
                  key={notification.id || index} 
                  className="flex items-start space-x-3 p-4 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300 group"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className={`p-2 rounded-xl ${
                    notification.type === 'warning' 
                      ? 'bg-yellow-100 dark:bg-yellow-900/20' 
                      : 'bg-blue-100 dark:bg-blue-900/20'
                  }`}>
                    <AlertCircle className={`h-4 w-4 ${
                      notification.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate group-hover:text-primary transition-colors">{notification.message}</p>
                    {notification.details && (
                      <p className="text-sm text-muted-foreground truncate mt-1">{notification.details}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground font-medium">{notification.time}</p>
                      {notification.author && (
                        <p className="text-xs text-muted-foreground">ដោយ: {notification.author}</p>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-base">មិនមានការជូនដំណឹង</p>
              </div>
            )}
            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <span className="text-base">មើលទាំងអស់</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile - Enhanced */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-3 md:space-x-4 pl-3 md:pl-4 border-l border-border/50 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 group flex-shrink-0 rounded-2xl"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm md:text-base font-black bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent hover:from-primary/80 hover:to-primary/60 transition-all duration-300 truncate max-w-24 md:max-w-32">
                  {user ? `${user.lastname} ${user.firstname}` : "អ្នកប្រើប្រាស់"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {user?.position || (user?.role === 'admin' ? 'នាយក' : 'គ្រូបង្រៀន')}
                  </p>
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-full">
                      <Crown className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Admin</span>
                    </div>
                  )}
                  {user?.role === 'teacher' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-full">
                      <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Teacher</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center text-white font-black shadow-xl hover:shadow-2xl hover:scale-110 hover:from-primary/80 hover:to-primary/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <span className="relative z-10 group-hover:scale-110 transition-transform duration-300 text-sm md:text-base">
                  {user?.avatar || user?.firstname?.charAt(0) || "U"}
                </span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-gradient-to-b from-card/95 to-card/90 backdrop-blur-xl border border-border/50 shadow-2xl">
            <DropdownMenuLabel className="flex items-center space-x-3 bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-t-lg">
              <div className="p-2 bg-primary/10 rounded-xl">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-base text-primary font-bold">ព័ត៌មានផ្ទាល់ខ្លួន</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleProfileClick}
              className="flex items-center space-x-3 p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300 group"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-base font-medium group-hover:text-primary transition-colors">កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="flex items-center space-x-3 p-4 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-700 focus:text-red-700 transition-all duration-300 group dark:text-red-400 dark:hover:from-red-900/20 dark:hover:to-red-800/10 dark:hover:text-red-300"
            >
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl group-hover:bg-red-200 dark:group-hover:bg-red-800/30 transition-colors">
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-base font-medium group-hover:translate-x-0.5 transition-transform duration-300">ចាកចេញ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-primary" />
              <span className="text-xl">កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
            </DialogTitle>
            <DialogDescription>
              <span className="text-base">កែប្រែព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <span>រូបភាព</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  {/* Current Photo */}
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden">
                    {profileData.photo ? (
                      <img 
                        src={profileData.photo} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">
                        {user?.firstname?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="flex-1">
                    <Label htmlFor="photo" className="cursor-pointer">
                      <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors">
                        <Camera className="w-5 h-5 text-primary" />
                        <span className="text-base font-medium text-primary">
                          ជ្រើសរើសរូបភាព
                        </span>
                      </div>
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      JPG, PNG, GIF (អតិបរមា 5MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>ព័ត៌មានទំនាក់ទំនង</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone 1 */}
                  <div className="space-y-2">
                    <Label htmlFor="phonenumber1" className="text-base font-medium">
                      លេខទូរស័ព្ទ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phonenumber1"
                      value={profileData.phonenumber1}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phonenumber1: e.target.value }))}
                      placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                      className="h-10"
                    />
                  </div>

                  {/* Phone 2 */}
                  <div className="space-y-2">
                    <Label htmlFor="phonenumber2" className="text-base font-medium">
                      លេខទូរស័ព្ទទី២
                    </Label>
                    <Input
                      id="phonenumber2"
                      value={profileData.phonenumber2}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phonenumber2: e.target.value }))}
                      placeholder="បញ្ចូលលេខទូរស័ព្ទទី២"
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-base text-blue-700 dark:text-blue-300">
                      <p className="font-medium">ព័ត៌មាន:</p>
                      <p>ទុកទទេប្រសិនបើមិនចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-medium">
                      ពាក្យសម្ងាត់ថ្មី
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={profileData.password}
                        onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base font-medium">
                      បញ្ជាក់ពាក្យសម្ងាត់
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowProfileEdit(false)}
              disabled={profileLoading}
            >
              <X className="w-4 h-4 mr-2" />
              បោះបង់
            </Button>
            <Button
              onClick={handleProfileUpdate}
              disabled={profileLoading || !profileData.phonenumber1}
            >
              {profileLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>កំពុងរក្សាទុក...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុក</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
