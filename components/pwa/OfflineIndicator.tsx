'use client'

import { useOnlineStatus } from '@/lib/pwa/pwa-utils'
import { useEffect, useState } from 'react'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true)
    } else {
      const timer = setTimeout(() => {
        setShowIndicator(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showIndicator) return null

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
      isOnline ? 'translate-y-0' : 'translate-y-0'
    }`}>
      <div className={`${
        isOnline 
          ? 'bg-green-500' 
          : 'bg-orange-500'
      } text-white px-4 py-2`}>
        <div className="container mx-auto flex items-center justify-center space-x-2 text-sm">
          {isOnline ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>다시 온라인 상태입니다</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
              <span>오프라인 모드 - 일부 기능이 제한됩니다</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}