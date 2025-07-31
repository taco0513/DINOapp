import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface OfflineData {
  trips?: any[]
  schengenStatus?: any
  visaRequirements?: any[]
  lastSynced?: Date
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [offlineData, setOfflineData] = useState<OfflineData>({})

  useEffect(() => {
    // 초기 온라인 상태 확인
    setIsOnline(navigator.onLine)

    // 온라인/오프라인 이벤트 리스너
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('인터넷 연결이 복구되었습니다! 🎉')
      syncData()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('오프라인 모드로 전환되었습니다. 캐시된 데이터를 표시합니다.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Service Worker 등록 및 상태 확인
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerReady(true)
      })
    }

    // localStorage에서 오프라인 데이터 로드
    const savedData = localStorage.getItem('dinoapp-offline-data')
    if (savedData) {
      setOfflineData(JSON.parse(savedData))
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 데이터 저장 (오프라인 대비)
  const saveForOffline = useCallback((key: keyof OfflineData, data: any) => {
    const newData = {
      ...offlineData,
      [key]: data,
      lastSynced: new Date()
    }
    
    setOfflineData(newData)
    localStorage.setItem('dinoapp-offline-data', JSON.stringify(newData))
  }, [offlineData])

  // 데이터 동기화
  const syncData = useCallback(async () => {
    if (!isOnline) return

    try {
      // 여행 데이터 동기화
      const tripsResponse = await fetch('/api/trips')
      if (tripsResponse.ok) {
        const trips = await tripsResponse.json()
        saveForOffline('trips', trips)
      }

      // 셴겐 상태 동기화
      const schengenResponse = await fetch('/api/schengen-status')
      if (schengenResponse.ok) {
        const schengen = await schengenResponse.json()
        saveForOffline('schengenStatus', schengen)
      }

      toast.success('데이터가 동기화되었습니다!')
    } catch (error) {
      console.error('동기화 실패:', error)
    }
  }, [isOnline, saveForOffline])

  // 오프라인 API 호출 래퍼
  const offlineFetch = useCallback(async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options)
      
      // 성공하면 캐시 업데이트
      if (response.ok && options?.method === 'GET') {
        const data = await response.json()
        
        // URL에 따라 적절한 키에 저장
        if (url.includes('/api/trips')) {
          saveForOffline('trips', data)
        } else if (url.includes('/api/schengen-status')) {
          saveForOffline('schengenStatus', data)
        }
      }
      
      return response
    } catch (error) {
      // 오프라인일 때 캐시된 데이터 반환
      if (!isOnline) {
        if (url.includes('/api/trips')) {
          return new Response(JSON.stringify(offlineData.trips || []), {
            headers: { 'Content-Type': 'application/json' }
          })
        } else if (url.includes('/api/schengen-status')) {
          return new Response(JSON.stringify(offlineData.schengenStatus || {}), {
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
      
      throw error
    }
  }, [isOnline, offlineData, saveForOffline])

  // 백그라운드 동기화 요청
  const requestBackgroundSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'registration' in self && self.registration && 'sync' in self.registration) {
      try {
        await (self.registration as any).sync.register('background-sync')
        toast.info('백그라운드 동기화가 예약되었습니다')
      } catch (error) {
        console.error('백그라운드 동기화 등록 실패:', error)
      }
    }
  }, [])

  return {
    isOnline,
    isServiceWorkerReady,
    offlineData,
    saveForOffline,
    syncData,
    offlineFetch,
    requestBackgroundSync
  }
}