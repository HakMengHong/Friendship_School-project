'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Clock,
  User,
  Settings,
  RefreshCw,
  Filter,
  X,
  MoreHorizontal
} from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: Date
  read: boolean
  sender?: string
  actionUrl?: string
  category?: string
}

interface NotificationSystemProps {
  title?: string
  subtitle?: string
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onDeleteAll: () => void
  onRefresh: () => void
  loading?: boolean
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function NotificationSystem({
  title = "ការជូនដំណឹង",
  subtitle = "Notification Center",
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onRefresh,
  loading = false,
  theme = 'blue'
}: NotificationSystemProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'success' | 'warning' | 'error' | 'info'>('all')
  const [showSettings, setShowSettings] = useState(false)

  const getThemeColors = () => {
    switch (theme) {
      case 'blue':
        return {
          primary: 'from-blue-500 to-indigo-600',
          secondary: 'border-blue-200',
          accent: 'text-blue-600',
          bg: 'from-blue-50 to-indigo-50',
          dark: 'from-blue-950/20 to-indigo-950/20'
        }
      case 'green':
        return {
          primary: 'from-green-500 to-emerald-600',
          secondary: 'border-green-200',
          accent: 'text-green-600',
          bg: 'from-green-50 to-emerald-50',
          dark: 'from-green-950/20 to-emerald-950/20'
        }
      case 'purple':
        return {
          primary: 'from-purple-500 to-pink-600',
          secondary: 'border-purple-200',
          accent: 'text-purple-600',
          bg: 'from-purple-50 to-pink-50',
          dark: 'from-purple-950/20 to-pink-950/20'
        }
      case 'orange':
        return {
          primary: 'from-orange-500 to-red-600',
          secondary: 'border-orange-200',
          accent: 'text-orange-600',
          bg: 'from-orange-50 to-red-50',
          dark: 'from-orange-950/20 to-red-950/20'
        }
      case 'red':
        return {
          primary: 'from-red-500 to-pink-600',
          secondary: 'border-red-200',
          accent: 'text-red-600',
          bg: 'from-red-50 to-pink-50',
          dark: 'from-red-950/20 to-pink-950/20'
        }
      default:
        return {
          primary: 'from-blue-500 to-indigo-600',
          secondary: 'border-blue-200',
          accent: 'text-blue-600',
          bg: 'from-blue-50 to-indigo-50',
          dark: 'from-blue-950/20 to-indigo-950/20'
        }
    }
  }

  const colors = getThemeColors()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'អាសន្ន'
      case 'high':
        return 'ខ្ពស់'
      case 'medium':
        return 'មធ្យម'
      case 'low':
        return 'ទាប'
      default:
        return priority
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'ឥឡូវនេះ'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} នាទីមុន`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ម៉ោងមុន`
    return `${Math.floor(diffInSeconds / 86400)} ថ្ងៃមុន`
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read)
    
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    
    return matchesFilter && matchesPriority && matchesType
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length

  return (
    <Card className={`border-2 ${colors.secondary} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className={`bg-gradient-to-r ${colors.primary} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm relative">
              <Bell className="h-6 w-6 text-white" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
              <p className="text-white/80 text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {urgentCount > 0 && (
              <Badge variant="secondary" className="bg-red-500 text-white border-red-400">
                អាសន្ន: {urgentCount}
              </Badge>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                ទាំងអស់ ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                មិនទាន់អាន ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                បានអាន ({notifications.length - unreadCount})
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                សម្គាល់អានទាំងអស់
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showSettings && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ការច្រោះកម្រិតខ្ពស់ (Advanced Filters)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    អាទិភាព (Priority)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                      <Button
                        key={priority}
                        variant={priorityFilter === priority ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPriorityFilter(priority)}
                      >
                        {priority === 'all' ? 'ទាំងអស់' : getPriorityLabel(priority)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    ប្រភេទ (Type)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'success', 'warning', 'error', 'info'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={typeFilter === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter(type)}
                      >
                        {type === 'all' ? 'ទាំងអស់' : type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  គ្មានការជូនដំណឹង
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  មិនមានការជូនដំណឹងដែលត្រូវគ្នានឹងការច្រោះរបស់អ្នក
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    notification.read
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-semibold ${
                            notification.read 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {notification.title}
                          </h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {getPriorityLabel(notification.priority)}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(notification.timestamp)}</span>
                          </div>
                          {notification.sender && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{notification.sender}</span>
                            </div>
                          )}
                          {notification.category && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                              {notification.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(notification.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                បានបង្ហាញ {filteredNotifications.length} ក្នុងចំណោម {notifications.length} ការជូនដំណឹង
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <X className="h-4 w-4 mr-2" />
                លុបទាំងអស់
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
