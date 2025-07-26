import { useEffect, useState } from 'react'

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOffline: boolean
  installPrompt: () => Promise<void>
}

export function usePWA(): PWAState {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
          
          // 업데이트 체크
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 새 버전 사용 가능 알림
                  if (confirm('새 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.log('SW registration failed: ', error)
        })
    }

    // PWA 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // PWA 설치 완료 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    // 온라인/오프라인 상태 리스너
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    // 설치 상태 확인
    const checkInstallStatus = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone) {
        setIsInstalled(true)
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 초기 상태 설정
    checkInstallStatus()
    setIsOffline(!navigator.onLine)

    // 클린업
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installPrompt = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsInstalled(true)
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Error during install prompt:', error)
    }
  }

  return {
    isInstallable,
    isInstalled,
    isOffline,
    installPrompt
  }
}