'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { registerServiceWorker, subscribeToPushNotifications } from '@/lib/pwa/pwa-utils'

interface PWAContextType {
  isInstalled: boolean
  isOnline: boolean
  registration: ServiceWorkerRegistration | null
  pushSubscription: PushSubscription | null
  updateAvailable: boolean
  enablePushNotifications: () => Promise<boolean>
}

const PWAContext = createContext<PWAContextType>({
  isInstalled: false,
  isOnline: true,
  registration: null,
  pushSubscription: null,
  updateAvailable: false,
  enablePushNotifications: async () => false
})

export function usePWA() {
  return useContext(PWAContext)
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Check online status
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Register service worker
    registerServiceWorker().then(reg => {
      if (reg) {
        setRegistration(reg)
        
        // Check for existing push subscription
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setPushSubscription(sub)
          }
        })
      }
    })
    
    // Listen for updates
    const handleUpdateAvailable = () => setUpdateAvailable(true)
    window.addEventListener('sw-update-available', handleUpdateAvailable)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('sw-update-available', handleUpdateAvailable)
    }
  }, [])

  const enablePushNotifications = async () => {
    if (!registration) return false
    
    try {
      const subscription = await subscribeToPushNotifications(registration)
      if (subscription) {
        setPushSubscription(subscription)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to enable push notifications:', error)
      return false
    }
  }

  return (
    <PWAContext.Provider value={{
      isInstalled,
      isOnline,
      registration,
      pushSubscription,
      updateAvailable,
      enablePushNotifications
    }}>
      {children}
    </PWAContext.Provider>
  )
}