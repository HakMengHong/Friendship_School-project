'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-service'

interface AutoLogoutTimerProps {
  timeoutMinutes?: number
  warningMinutes?: number
  onLogout?: () => void
}

export function AutoLogoutTimer({ 
  timeoutMinutes = 30, 
  warningMinutes = 5,
  onLogout 
}: AutoLogoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeoutMinutes * 60) // Convert to seconds
  const [showWarning, setShowWarning] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [lastHeartbeat, setLastHeartbeat] = useState(0)
  const router = useRouter()

  // Throttle heartbeat to prevent excessive API calls (max once per 30 seconds)
  const HEARTBEAT_THROTTLE = 30000 // 30 seconds

  // Reset timer function
  const resetTimer = useCallback(() => {
    if (isActive) {
      setTimeLeft(timeoutMinutes * 60)
      setShowWarning(false)
      // Send heartbeat to server only if enough time has passed
      const now = Date.now()
      if (now - lastHeartbeat > HEARTBEAT_THROTTLE) {
        sendHeartbeat()
        setLastHeartbeat(now)
      }
    }
  }, [isActive, timeoutMinutes, lastHeartbeat])

  // Send heartbeat to server to update last activity
  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch('/api/auth/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.log('Heartbeat failed:', error)
    }
  }, [])

  // Handle logout
  const handleLogout = useCallback(async () => {
    setIsActive(false)
    
    try {
      // Log auto-logout activity
      const user = getCurrentUser()
      if (user) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            username: `${user.lastname} ${user.firstname} (Auto-logout)`
          })
        })
      }
    } catch (error) {
      console.error('Auto-logout logging error:', error)
    }
    
    if (onLogout) {
      onLogout()
    }
    router.push('/login?timeout=true&message=ការប្រើប្រាស់បានផុតកំណត់ សូមចូលម្តងទៀត។')
  }, [onLogout, router])

  // Main timer effect
  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          handleLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, handleLogout])

  // Periodic heartbeat to keep session alive (every 5 minutes)
  useEffect(() => {
    if (!isActive) return

    const heartbeatInterval = setInterval(() => {
      const now = Date.now()
      if (now - lastHeartbeat > HEARTBEAT_THROTTLE) {
        sendHeartbeat()
        setLastHeartbeat(now)
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(heartbeatInterval)
  }, [isActive, lastHeartbeat, sendHeartbeat])

  // Show warning when time is running out
  useEffect(() => {
    if (timeLeft <= warningMinutes * 60 && timeLeft > 0) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [timeLeft, warningMinutes])

  // Activity detection with debouncing
  useEffect(() => {
    if (!isActive) return

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ]

    let debounceTimer: NodeJS.Timeout | null = null

    const handleActivity = () => {
      // Clear existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      
      // Set new debounce timer (500ms delay)
      debounceTimer = setTimeout(() => {
        resetTimer()
      }, 500)
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Cleanup
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [resetTimer, isActive])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Don't render if not active or no warning
  if (!isActive || !showWarning) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg border border-yellow-600">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              ការប្រើប្រាស់បានផុតកំណត់សូមចូលម្តងទៀត
            </h3>
            <p className="text-xs mt-1">
              ការប្រើប្រាស់បានផុតកំណត់ក្នុង {formatTime(timeLeft)}
            </p>
            <p className="text-xs mt-1 opacity-90">
              ចូរចុចឬចុចគ្រាប់ចុចណាមួយដើម្បីបន្ត
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-yellow-600 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: `${(timeLeft / (warningMinutes * 60)) * 100}%` 
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex space-x-2">
          <button
            onClick={resetTimer}
            className="flex-1 bg-white text-yellow-600 px-3 py-1 rounded text-xs font-medium hover:bg-yellow-50 transition-colors"
          >
            បន្តសម័យកាល
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-yellow-700 transition-colors"
          >
            ចេញ
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for using auto-logout timer
export function useAutoLogout(timeoutMinutes = 30, warningMinutes = 5) {
  const [isActive, setIsActive] = useState(true)

  const startTimer = () => setIsActive(true)
  const stopTimer = () => setIsActive(false)

  return {
    isActive,
    startTimer,
    stopTimer,
    AutoLogoutTimer: (props: Omit<AutoLogoutTimerProps, 'timeoutMinutes' | 'warningMinutes'>) => (
      <AutoLogoutTimer 
        {...props} 
        timeoutMinutes={timeoutMinutes} 
        warningMinutes={warningMinutes}
      />
    )
  }
}
