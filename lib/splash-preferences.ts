// Splash screen preference management utilities

export interface SplashPreferences {
  hasSeenSplash: boolean
  skipSplash: boolean
}

export const SPLASH_STORAGE_KEYS = {
  HAS_SEEN_SPLASH: 'hasSeenSplash',
  SKIP_SPLASH: 'skipSplash'
} as const

export const getSplashPreferences = (): SplashPreferences => {
  if (typeof window === 'undefined') {
    return { hasSeenSplash: false, skipSplash: false }
  }

  const hasSeenSplash = localStorage.getItem(SPLASH_STORAGE_KEYS.HAS_SEEN_SPLASH) === 'true'
  const skipSplash = localStorage.getItem(SPLASH_STORAGE_KEYS.SKIP_SPLASH) === 'true'

  return { hasSeenSplash, skipSplash }
}

export const setSplashSeen = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(SPLASH_STORAGE_KEYS.HAS_SEEN_SPLASH, 'true')
}

export const setSkipSplash = (skip: boolean = true) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(SPLASH_STORAGE_KEYS.SKIP_SPLASH, skip.toString())
  if (skip) {
    setSplashSeen()
  }
}

export const resetSplashPreferences = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SPLASH_STORAGE_KEYS.HAS_SEEN_SPLASH)
  localStorage.removeItem(SPLASH_STORAGE_KEYS.SKIP_SPLASH)
}

export const shouldShowSplash = (): boolean => {
  if (typeof window === 'undefined') {
    return true // Show splash by default on server side
  }
  const preferences = getSplashPreferences()
  return !preferences.hasSeenSplash || !preferences.skipSplash
} 