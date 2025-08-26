'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  BarChart3
} from "lucide-react"

interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  maxValue: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  change: number
  icon: React.ReactNode
}

interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: Date
  resolved: boolean
}

interface PerformanceMonitoringProps {
  title?: string
  subtitle?: string
  metrics: PerformanceMetric[]
  alerts: SystemAlert[]
  onRefresh: () => void
  loading?: boolean
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function PerformanceMonitoring({
  title = "ការតាមដានដំណើរការ",
  subtitle = "Performance Monitoring",
  metrics,
  alerts,
  onRefresh,
  loading = false,
  theme = 'blue'
}: PerformanceMonitoringProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')
  const [showAlerts, setShowAlerts] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'ល្អណាស់'
      case 'good':
        return 'ល្អ'
      case 'warning':
        return 'ព្រមាន'
      case 'critical':
        return 'អាសន្ន'
      default:
        return status
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'info':
        return <Activity className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
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

  const calculatePercentage = (value: number, maxValue: number) => {
    return Math.round((value / maxValue) * 100)
  }

  const criticalAlerts = alerts.filter(alert => alert.type === 'error' && !alert.resolved).length
  const warningAlerts = alerts.filter(alert => alert.type === 'warning' && !alert.resolved).length

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      onRefresh()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh])

  return (
    <Card className={`border-2 ${colors.secondary} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className={`bg-gradient-to-r ${colors.primary} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
              <p className="text-white/80 text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(criticalAlerts > 0 || warningAlerts > 0) && (
              <Badge variant="secondary" className="bg-red-500 text-white border-red-400">
                ការព្រមាន: {criticalAlerts + warningAlerts}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {timeRange}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="1h">1 ម៉ោង</option>
                <option value="6h">6 ម៉ោង</option>
                <option value="24h">24 ម៉ោង</option>
                <option value="7d">7 ថ្ងៃ</option>
              </select>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-md text-sm ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                }`}
              >
                ការផ្ទុកឡើងវិញដោយស្វ័យប្រវត្តិ
              </button>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>ផ្ទុកឡើងវិញ</span>
            </button>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-gray-600 dark:text-gray-400">
                      {metric.icon}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {metric.name}
                    </h3>
                  </div>
                  <Badge className={getStatusColor(metric.status)}>
                    {getStatusLabel(metric.status)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {metric.value}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {metric.unit}
                    </span>
                  </div>
                  
                  <Progress 
                    value={calculatePercentage(metric.value, metric.maxValue)} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      0 {metric.unit}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend)}
                      <span className={metric.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {metric.change >= 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {metric.maxValue} {metric.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Alerts */}
          {showAlerts && alerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ការព្រមានប្រព័ន្ធ (System Alerts)
                </h3>
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  លាក់
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts
                  .filter(alert => !alert.resolved)
                  .slice(0, 5)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                        alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                        alert.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTimeAgo(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Performance Summary */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              សង្ខេបដំណើរការ (Performance Summary)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ស្ថានភាពសរុប</p>
                <p className={`font-bold ${
                  criticalAlerts > 0 ? 'text-red-600' :
                  warningAlerts > 0 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {criticalAlerts > 0 ? 'អាសន្ន' : warningAlerts > 0 ? 'ព្រមាន' : 'ល្អ'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ការព្រមានអាសន្ន</p>
                <p className="font-bold text-red-600">{criticalAlerts}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ការព្រមាន</p>
                <p className="font-bold text-yellow-600">{warningAlerts}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">ពេលវេលាដំណើរការ</p>
                <p className="font-bold text-blue-600">
                  {Math.floor(Math.random() * 24) + 1} ម៉ោង
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
