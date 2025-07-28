'use client'

import { useEffect, useState } from 'react'
// import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // 마지막 동기화 시간 가져오기
    const getLastSync = () => {
      const stored = localStorage.getItem('dino-last-sync')
      if (stored) {
        setLastSync(new Date(stored).toLocaleString('ko-KR'))
      }
    }

    // 온라인 상태 변경 감지
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    updateOnlineStatus()
    getLastSync()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/dashboard'
    } else {
      alert('아직 인터넷에 연결되지 않았습니다.')
    }
  }

  const handleViewCached = () => {
    window.location.href = '/trips?offline=true'
  }

  return (
    <div className="container mx-auto px-4">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          {/* 오프라인 아이콘 */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12" 
              />
            </svg>
          </div>

          {/* 상태 표시 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isOnline ? '연결 중...' : '오프라인 모드'}
            </h1>
            <p className="text-gray-600">
              {isOnline 
                ? '인터넷에 연결되었습니다. 잠시만 기다려주세요.'
                : '인터넷 연결을 확인할 수 없습니다.'
              }
            </p>
          </div>

          {/* 연결 상태 표시 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">연결 상태</span>
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? '온라인' : '오프라인'}
              </span>
            </div>
            {lastSync && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">마지막 동기화</span>
                <span className="text-sm text-gray-700">{lastSync}</span>
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full"
              variant={isOnline ? "default" : "outline"}
            >
              {isOnline ? '대시보드로 이동' : '다시 연결 시도'}
            </Button>
            
            <Button 
              onClick={handleViewCached}
              variant="outline"
              className="w-full"
            >
              저장된 여행 기록 보기
            </Button>
          </div>

          {/* 오프라인 기능 안내 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">오프라인에서도 사용 가능</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• 저장된 여행 기록 조회</li>
              <li>• 셰겐 계산기 (캐시된 데이터)</li>
              <li>• 기본 앱 기능 사용</li>
            </ul>
          </div>

          {/* PWA 설치 안내 */}
          <div className="mt-6 text-xs text-gray-500">
            <p>더 나은 오프라인 경험을 위해 홈 화면에 앱을 추가해보세요.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}