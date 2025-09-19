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
    <div className={`bg-gradient-to-r from-card via-card/95 to-card/90 border-b border-border p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm backdrop-blur-sm ${className}`}>
      {/* Left side - Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-1 truncate">
          {pageInfo.title}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-1 md:space-x-4 w-full md:w-auto">
        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-primary/10 transition-all duration-200"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-primary">ការជូនដំណឹង</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs p-1"
                  onClick={fetchNotifications}
                  disabled={notificationsLoading}
                >
                  <RefreshCw className={`h-3 w-3 ${notificationsLoading ? 'animate-spin' : ''}`} />
                </Button>
                
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificationsLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm">កំពុងផ្ទុក...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification, index) => (
                <DropdownMenuItem 
                  key={notification.id || index} 
                  className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-accent"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    notification.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.message}</p>
                    {notification.details && (
                      <p className="text-xs text-muted-foreground truncate">{notification.details}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
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
                <p className="text-sm">មិនមានការជូនដំណឹង</p>
              </div>
            )}
            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <span className="text-sm">មើលទាំងអស់</span>
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
              className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-4 border-l border-border hover:bg-primary/10 transition-all duration-200 group flex-shrink-0"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:from-primary/90 hover:to-primary/70 transition-all duration-200 truncate max-w-24 md:max-w-32">
                  {user ? `${user.lastname} ${user.firstname}` : "អ្នកប្រើប្រាស់"}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    {user?.position || (user?.role === 'admin' ? 'នាយក' : 'គ្រូបង្រៀន')}
                  </p>
                  {user?.role === 'admin' && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                  {user?.role === 'teacher' && (
                    <BookOpen className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 cursor-pointer group">
                <span className="group-hover:scale-110 transition-transform duration-200 text-sm md:text-base">
                  {user?.avatar || user?.firstname?.charAt(0) || "U"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-primary">ព័ត៌មានផ្ទាល់ខ្លួន</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="w-4 h-4 mr-2" />
              <span>កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              <span>ចាកចេញ</span>
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
              <span>កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
            </DialogTitle>
            <DialogDescription>
              កែប្រែព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
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
                        <span className="text-sm font-medium text-primary">
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
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, GIF (អតិបរមា 5MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>ព័ត៌មានទំនាក់ទំនង</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone 1 */}
                  <div className="space-y-2">
                    <Label htmlFor="phonenumber1" className="text-sm font-medium">
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
                    <Label htmlFor="phonenumber2" className="text-sm font-medium">
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
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium">ព័ត៌មាន:</p>
                      <p>ទុកទទេប្រសិនបើមិនចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
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
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
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
