// TODO: Remove unused logger import

// PWA Utility Functions
import { useEffect, useState } from 'react'

// Check if PWA is supported
export const isPWASupported = () => {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window
}

// Check if app is installed as PWA
export const isStandalone = () => {
  // iOS
  if ('standalone' in window.navigator) {
    return (window.navigator as any).standalone
  }
  // Android
  return window.matchMedia('(display-mode: standalone)').matches
}

// Register service worker
export const registerServiceWorker = async () => {
  if (!isPWASupported()) {
    console.info('PWA not supported on this browser')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-v2.js', {
      scope: '/'
    })
    
    console.debug('Service Worker registered successfully:', registration)
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            dispatchEvent(new Event('sw-update-available'))
          }
        })
      }
    })
    
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.info('Notifications not supported')
    return 'unsupported'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return 'denied'
}

// Subscribe to push notifications
export const subscribeToPushNotifications = async (registration: ServiceWorkerRegistration) => {
  try {
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      console.info('Notification permission denied')
      return null
    }

    // Get the public key from server
    const response = await fetch('/api/push/vapid-public-key')
    const { publicKey } = await response.json()

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })

    console.info('Push subscription successful')
    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    return null
  }
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Check for app updates
export const checkForUpdates = async () => {
  if (!navigator.serviceWorker.controller) return false

  try {
    const messageChannel = new MessageChannel()
    
    return new Promise<boolean>((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.updateAvailable)
      }

      const controller = navigator.serviceWorker.controller
      if (controller) {
        controller.postMessage(
          { type: 'CHECK_UPDATE' },
          [messageChannel.port2]
        )
      }
    })
  } catch (error) {
    console.error('Update check failed:', error)
    return false
  }
}

// Update service worker
export const updateServiceWorker = async () => {
  const registration = await navigator.serviceWorker.getRegistration()
  if (registration) {
    await registration.update()
    
    // Skip waiting on new service worker
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    
    // Reload once new service worker is active
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }
}

// Custom hook for PWA install prompt
export const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const promptInstall = async () => {
    if (!installPrompt) return false

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setInstallPrompt(null)
    }
    
    return outcome === 'accepted'
  }

  return { isInstallable, promptInstall }
}

// Custom hook for online/offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Custom hook for service worker updates
export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const handleUpdateAvailable = () => setUpdateAvailable(true)
    
    window.addEventListener('sw-update-available', handleUpdateAvailable)
    
    // Check for updates on load
    checkForUpdates().then(setUpdateAvailable)
    
    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable)
    }
  }, [])

  const updateApp = async () => {
    setIsUpdating(true)
    await updateServiceWorker()
    // Page will reload automatically
  }

  return { updateAvailable, updateApp, isUpdating }
}

// Cache management utilities
export const clearAppCache = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    const deletePromises = cacheNames.map(name => caches.delete(name))
    await Promise.all(deletePromises)
    console.info('All caches cleared')
  }
}

export const getCacheSize = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate()
    return {
      usage: usage || 0,
      quota: quota || 0,
      usageInMB: ((usage || 0) / 1024 / 1024).toFixed(2),
      quotaInMB: ((quota || 0) / 1024 / 1024).toFixed(2)
    }
  }
  return null
}

// Offline data sync utilities
export const syncOfflineData = async () => {
  if (!navigator.onLine) {
    console.info('Cannot sync: offline')
    return false
  }

  try {
    // Trigger background sync
    const registration = await navigator.serviceWorker.ready
    if ('sync' in registration) {
      await (registration as any).sync.register('sync-offline-data')
    }
    return true
  } catch (error) {
    console.error('Sync failed:', error)
    return false
  }
}

// Save data for offline use
export const saveForOffline = async (key: string, data: any) => {
  try {
    const cache = await caches.open('dino-offline-data')
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
    await cache.put(`/offline-data/${key}`, response)
    return true
  } catch (error) {
    console.error('Failed to save offline data:', error)
    return false
  }
}

// Get offline data
export const getOfflineData = async (key: string) => {
  try {
    const cache = await caches.open('dino-offline-data')
    const response = await cache.match(`/offline-data/${key}`)
    if (response) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Failed to get offline data:', error)
    return null
  }
}