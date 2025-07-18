"use client"

import { useState } from "react"
import { Settings, User, Shield, Palette, BellRing, Lock, Monitor, School, Users, GraduationCap, BookOpenCheck, Calendar, HelpCircle, Info, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface SettingsToggleProps {
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export function SettingsToggle({ className, variant = "ghost", size = "icon" }: SettingsToggleProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    notifications: true,
    sound: false,
    autoSave: true,
    darkMode: true,
    language: 'km',
    fontSize: 'medium',
    compactMode: false,
    showOnlineUsers: true,
    dataSync: true,
    privacyMode: false
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Show toast notification for important changes
    const settingLabels: Record<string, string> = {
      notifications: 'ការជូនដំណឹង',
      sound: 'សំឡេង',
      autoSave: 'រក្សាទុកដោយស្វ័យប្រវត្តិ',
      darkMode: 'របៀបងងឹត',
      compactMode: 'របៀបចង្អៀត',
      dataSync: 'ធ្វើសមកាលកម្មទិន្នន័យ',
      privacyMode: 'របៀបភាពឯកជន'
    }
    
    if (settingLabels[key]) {
      toast({
        title: "ការកំណត់បានផ្លាស់ប្តូរ",
        description: `${settingLabels[key]} ${value ? 'បានបើក' : 'បានបិទ'}`,
      })
    }
  }

  const handleMenuItemClick = (action: string) => {
    toast({
      title: "ការអនុវត្ត",
      description: `កំពុងដំណើរការ: ${action}`,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={`bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary hover:to-primary/80 active:from-primary/90 active:to-primary/70 text-primary hover:text-white active:text-white shadow-sm hover:shadow-lg active:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group flex-shrink-0 ${className}`}
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:text-white group-active:text-white/90 transition-colors duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center space-x-2 text-lg font-bold">
          <Settings className="w-5 h-5" />
          <span>ការកំណត់</span>
        </DropdownMenuLabel>
        
        {/* User Profile Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground">
            <User className="w-4 h-4" />
            <span>ព័ត៌មានផ្ទាល់ខ្លួន</span>
          </DropdownMenuLabel>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('កែប្រែព័ត៌មានផ្ទាល់ខ្លួន')}
          >
            <User className="w-4 h-4" />
            <span>កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('ផ្លាស់ប្តូរពាក្យសម្ងាត់')}
          >
            <Lock className="w-4 h-4" />
            <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('ការកំណត់សុវត្ថិភាព')}
          >
            <Shield className="w-4 h-4" />
            <span>ការកំណត់សុវត្ថិភាព</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <Separator />

        {/* Appearance Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground">
            <Palette className="w-4 h-4" />
            <span>រូបរាង</span>
          </DropdownMenuLabel>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm">របៀបងងឹត</Label>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-mode" className="text-sm">របៀបចង្អៀត</Label>
              <Switch
                id="compact-mode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
              />
            </div>
            <DropdownMenuRadioGroup value={settings.fontSize} onValueChange={(value) => handleSettingChange('fontSize', value)}>
              <DropdownMenuLabel className="text-sm">ទំហំអក្សរ</DropdownMenuLabel>
              <DropdownMenuRadioItem value="small">តូច</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="medium">មធ្យម</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="large">ធំ</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </div>
        </DropdownMenuGroup>

        <Separator />

        {/* Notifications Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground">
            <BellRing className="w-4 h-4" />
            <span>ការជូនដំណឹង</span>
          </DropdownMenuLabel>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm">ការជូនដំណឹង</Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="text-sm">សំឡេង</Label>
              <Switch
                id="sound"
                checked={settings.sound}
                onCheckedChange={(checked) => handleSettingChange('sound', checked)}
              />
            </div>
          </div>
        </DropdownMenuGroup>

        <Separator />

        {/* System Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground">
            <Monitor className="w-4 h-4" />
            <span>ប្រព័ន្ធ</span>
          </DropdownMenuLabel>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="text-sm">រក្សាទុកដោយស្វ័យប្រវត្តិ</Label>
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="data-sync" className="text-sm">ធ្វើសមកាលកម្មទិន្នន័យ</Label>
              <Switch
                id="data-sync"
                checked={settings.dataSync}
                onCheckedChange={(checked) => handleSettingChange('dataSync', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="privacy-mode" className="text-sm">របៀបភាពឯកជន</Label>
              <Switch
                id="privacy-mode"
                checked={settings.privacyMode}
                onCheckedChange={(checked) => handleSettingChange('privacyMode', checked)}
              />
            </div>
          </div>
        </DropdownMenuGroup>

        <Separator />

        {/* School Management Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground">
            <School className="w-4 h-4" />
            <span>ការគ្រប់គ្រងសាលា</span>
          </DropdownMenuLabel>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('ការគ្រប់គ្រងអ្នកប្រើប្រាស់')}
          >
            <Users className="w-4 h-4" />
            <span>ការគ្រប់គ្រងអ្នកប្រើប្រាស់</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('ការគ្រប់គ្រងថ្នាក់រៀន')}
          >
            <GraduationCap className="w-4 h-4" />
            <span>ការគ្រប់គ្រងថ្នាក់រៀន</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('ការគ្រប់គ្រងវិញ្ញាបនបត្រ')}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>ការគ្រប់គ្រងវិញ្ញាបនបត្រ</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('កាលវិភាគ')}
          >
            <Calendar className="w-4 h-4" />
            <span>កាលវិភាគ</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <Separator />

        {/* Help & Support Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground">
            <HelpCircle className="w-4 h-4" />
            <span>ជំនួយ & ការគាំទ្រ</span>
          </DropdownMenuLabel>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('មគ្គុទេសក៍ប្រើប្រាស់')}
          >
            <HelpCircle className="w-4 h-4" />
            <span>មគ្គុទេសក៍ប្រើប្រាស់</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('អំពីប្រព័ន្ធ')}
          >
            <Info className="w-4 h-4" />
            <span>អំពីប្រព័ន្ធ</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center space-x-2"
            onClick={() => handleMenuItemClick('គោលការណ៍ភាពឯកជន')}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>គោលការណ៍ភាពឯកជន</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 